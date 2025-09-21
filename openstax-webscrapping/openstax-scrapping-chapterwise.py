from bs4 import BeautifulSoup
import re
import json
import pandas as pd
from urllib.parse import urljoin
import os
import requests
from PIL import Image
import io

class OpenStaxContentExtractor:
    def __init__(self):
        self.base_url = "https://openstax.org"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def get_page_content(self, url):
        """Fetch and parse OpenStax webpage"""
        try:
            response = self.session.get(url)
            response.raise_for_status()
            print(response)
            return BeautifulSoup(response.content, 'html.parser')
        except requests.RequestException as e:
            print(f"Error fetching {url}: {e}")
            return None
    
    def extract_chapter_navigation(self, soup):
        """Extract chapter navigation to get all section URLs"""
        nav_links = []
        # Look for table of contents or navigation
        nav_sections = soup.find_all(['nav', 'div'], class_=re.compile(r'nav|toc|contents', re.I))
        print(f"DEBUG: Found {len(nav_sections)} nav_sections.")
        for idx, nav in enumerate(nav_sections):
            # print(f"DEBUG: nav_section[{idx}] HTML snippet:\n{str(nav)[:1000]}")
            links = nav.find_all('a', href=True)
            for link in links:
                href = link.get('href')
                if href and '/pages/' in href:
                    full_url = urljoin(self.base_url, href)
                    nav_links.append({
                        'title': link.get_text().strip(),
                        'url': full_url,
                        'section_id': self.extract_section_id(link.get_text())
                    })
        if not nav_links:
            print("DEBUG: No navigation links found. Consider inspecting the HTML structure above.")
        return nav_links
    
    def extract_section_id(self, text):
        """Extract section ID (e.g., '1.1') from text"""
        match = re.search(r'(\d+\.\d+)', text)
        return match.group(1) if match else None
    
    def extract_learning_objectives(self, soup):
        """Extract learning objectives from the page"""
        objectives = []
        
        # Look for "Learning Objectives" heading
        obj_heading = soup.find(['h2', 'h3', 'h4'], string=re.compile(r'Learning Objectives?', re.I))
        
        if obj_heading:
            # Find the next list element
            next_elem = obj_heading.find_next_sibling()
            while next_elem and next_elem.name not in ['h1', 'h2', 'h3', 'h4']:
                if next_elem.name == 'ul':
                    for li in next_elem.find_all('li'):
                        objectives.append(li.get_text().strip())
                    break
                next_elem = next_elem.find_next_sibling()
        
        return objectives
    
    def extract_figures_with_context(self, soup):
        """Extract figures with their captions and contextual information"""
        figures = []
        processed_image_urls = set()

        # Only process images as standalone with figure number
        img_elements = soup.find_all('img')
        for img in img_elements:
            if img.parent.name != 'figure':  # Only process images not inside <figure>
                img_src = img.get('src')
                if img_src and img_src.startswith('/'):
                    img_src = urljoin(self.base_url, img_src)
                # Check for duplicates
                if img_src and img_src not in processed_image_urls:
                    figure_data = self.process_standalone_image(img, soup)
                    # Only keep images with a figure number
                    if figure_data and figure_data.get('figure_number'):
                        figures.append(figure_data)
                        processed_image_urls.add(img_src)

        return figures
    
    def process_figure_element(self, figure_elem):
        """Process a figure element to extract all relevant data"""
        img = figure_elem.find('img')
        if not img or not img.get('src'):
            return None
        
        img_src = img.get('src')
        if img_src.startswith('/'):
            img_src = urljoin(self.base_url, img_src)
        
        caption_elem = figure_elem.find('figcaption')
        caption = caption_elem.get_text().strip() if caption_elem else ''
        
        # Extract figure number
        figure_num_match = re.search(r'Figure\s+(\d+\.?\d*)', caption, re.I)
        figure_number = figure_num_match.group(1) if figure_num_match else ''
        
        return {
            'figure_number': figure_number,
            'image_url': img_src,
            'caption': caption,
            'alt_text': img.get('alt', ''),
            'context_type': 'figure_element'
        }
    
    def process_standalone_image(self, img, soup):
        """Process standalone images that might be referenced in text"""
        img_src = img.get('src')
        if not img_src:
            return None
        
        if img_src.startswith('/'):
            img_src = urljoin(self.base_url, img_src)
        
        # Look for figure references in nearby text
        parent = img.parent
        figure_ref = None
        
        # Search in parent and nearby elements for figure references
        for _ in range(3):  # Check up to 3 levels up
            if parent:
                text = parent.get_text()
                figure_match = re.search(r'(Figure\s+\d+\.?\d*[^.]*\.)', text, re.I)
                if figure_match:
                    figure_ref = figure_match.group(1)
                    break
                parent = parent.parent
        
        if figure_ref:
            figure_num_match = re.search(r'Figure\s+(\d+\.?\d*)', figure_ref, re.I)
            figure_number = figure_num_match.group(1) if figure_num_match else ''
            
            return {
                'figure_number': figure_number,
                'image_url': img_src,
                'caption': figure_ref,
                'alt_text': img.get('alt', ''),
                'context_type': 'text_referenced'
            }
        
        return None
    
    def extract_content_blocks(self, soup):
        """Extract content organized in blocks (headings, paragraphs, lists, etc.) in document order."""
        content_blocks = []

        # Find main content area
        main_content = soup.find(['main', 'article', 'div'], id=re.compile(r'content|main', re.I))
        if not main_content:
            main_content = soup.find('body')

        # Iterate through children in document order
        for elem in main_content.descendants:
            if getattr(elem, 'name', None) in ['h2', 'h3', 'h4'] and elem.has_attr('data-type') and elem['data-type'] == 'title':
                heading_text = elem.get_text().strip()
                if heading_text:
                    content_blocks.append({
                        'type': 'heading',
                        'content': heading_text,
                        'level': elem.name,
                        'concepts': self.extract_concepts(heading_text)
                    })
            elif getattr(elem, 'name', None) == 'p':
                text = elem.get_text().strip()
                if len(text) > 50:
                    content_blocks.append({
                        'type': 'paragraph',
                        'content': text,
                        'concepts': self.extract_concepts(text)
                    })
            elif getattr(elem, 'name', None) in ['ul', 'ol']:
                items = [li.get_text().strip() for li in elem.find_all('li')]
                if items:
                    content_blocks.append({
                        'type': 'list',
                        'content': items,
                        'list_type': elem.name
                    })
        return content_blocks
    
    def extract_concepts(self, text):
        """Extract key biological concepts from text using simple heuristics"""
        # Common biology terms to identify
        bio_terms = [
            'cell', 'tissue', 'organ', 'organism', 'evolution', 'adaptation',
            'homeostasis', 'metabolism', 'photosynthesis', 'respiration',
            'DNA', 'RNA', 'protein', 'enzyme', 'chromosome', 'gene',
            'species', 'population', 'ecosystem', 'biodiversity'
        ]
        
        concepts = []
        text_lower = text.lower()
        
        for term in bio_terms:
            if term in text_lower:
                concepts.append(term)
        
        return concepts
    
    def extract_key_terms_glossary(self, soup):
        """Extract key terms and their definitions"""
        key_terms = {}
        
        # Look for key terms section
        key_terms_heading = soup.find(['h2', 'h3'], string=re.compile(r'Key Terms?|Glossary', re.I))
        
        if key_terms_heading:
            # Process definition list or similar structure
            next_elem = key_terms_heading.find_next_sibling()
            
            while next_elem and next_elem.name not in ['h1', 'h2']:
                if next_elem.name == 'dl':  # Definition list
                    terms = next_elem.find_all('dt')
                    definitions = next_elem.find_all('dd')
                    
                    for term, definition in zip(terms, definitions):
                        term_text = term.get_text().strip()
                        def_text = definition.get_text().strip()
                        key_terms[term_text] = def_text
                    break
                
                next_elem = next_elem.find_next_sibling()
        
        return key_terms
    
    def scrape_complete_chapter(self, chapter_url):
        """Scrape an entire chapter including all sections"""
        print(f"Starting chapter scrape: {chapter_url}")

        # Crawl using the Next link
        current_url = chapter_url
        chapter_data = {
            'chapter_title': '',
            'chapter_url': chapter_url,
            'sections': []
        }
        visited_urls = set()
        section_count = 0

        while current_url and current_url not in visited_urls:
            print(f"Processing section: {current_url}")
            soup = self.get_page_content(current_url)
            if not soup:
                print(f"Failed to fetch content, stopping.")
                break
            visited_urls.add(current_url)

            # Extract section title
            section_title = soup.find('h1')
            section_title = section_title.get_text().strip() if section_title else current_url
            section_id = self.extract_section_id(section_title) or current_url.split('/')[-1]

            # Set chapter title from first section
            if section_count == 0:
                chapter_data['chapter_title'] = section_title

            section_data = {
                'section_id': section_id,
                'title': section_title,
                'url': current_url,
                'learning_objectives': self.extract_learning_objectives(soup),
                'figures': self.extract_figures_with_context(soup),
                'content_blocks': self.extract_content_blocks(soup),
                'key_terms': self.extract_key_terms_glossary(soup)
            }
            chapter_data['sections'].append(section_data)
            section_count += 1

            # Find the 'Next' link
            next_link = None
            for link in soup.find_all('a', href=True):
                if link.get_text().strip().lower() == 'next':
                    href = link.get('href')
                    if href:
                        # Handle relative URLs
                        if not href.startswith('http'):
                            next_link = urljoin(current_url, href)
                        else:
                            next_link = href
                        break
            current_url = next_link

        print(f"Total sections scraped: {len(chapter_data['sections'])}")
        return chapter_data
    
    def process_for_multimodal_rag(self, chapter_data):
        """Convert extracted data to multimodal RAG format"""
        rag_chunks = []
        
        for section in chapter_data['sections']:
            section_id = section['section_id']
            section_title = section['title']
            
            # Process content blocks
            for i, block in enumerate(section['content_blocks']):
                if block['type'] == 'paragraph':
                    chunk = {
                        'chunk_id': f"{section_id}_content_{i}",
                        'content_type': 'text',
                        'text': block['content'],
                        'section': section_title,
                        'concepts': block.get('concepts', []),
                        'learning_objectives': section['learning_objectives'],
                        'metadata': {
                            'chapter': chapter_data['chapter_title'],
                            'section_id': section_id,
                            'chunk_type': 'content_paragraph'
                        }
                    }
                    rag_chunks.append(chunk)
                elif block['type'] == 'heading':
                    chunk = {
                        'chunk_id': f"{section_id}_heading_{i}",
                        'content_type': 'heading',
                        'text': block['content'],
                        'section': section_title,
                        'concepts': block.get('concepts', []),
                        'learning_objectives': section['learning_objectives'],
                        'metadata': {
                            'chapter': chapter_data['chapter_title'],
                            'section_id': section_id,
                            'chunk_type': 'heading',
                            'heading_level': block.get('level', '')
                        }
                    }
                    rag_chunks.append(chunk)
            
            # Process figures
            for fig in section['figures']:
                if fig['image_url']:
                    # Create multimodal chunk
                    text_content = f"Figure {fig['figure_number']}: {fig['caption']}"
                    
                    multimodal_chunk = {
                        'chunk_id': f"{section_id}_figure_{fig['figure_number']}",
                        'content_type': 'multimodal',
                        'text': text_content,
                        'image_url': fig['image_url'],
                        'image_description': fig['alt_text'],
                        'section': section_title,
                        'concepts': ['visual learning', 'diagram'],
                        'metadata': {
                            'chapter': chapter_data['chapter_title'],
                            'section_id': section_id,
                            'figure_number': fig['figure_number'],
                            'chunk_type': 'educational_figure'
                        }
                    }
                    rag_chunks.append(multimodal_chunk)
        
        return rag_chunks

# Usage example and cost analysis

def get_chapter_map_selenium(base_url, max_no_new=3):
    from selenium.webdriver.common.by import By
    """Extract chapter map using Selenium, similar to test.py"""
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    import time
    chapter_map = {}
    next_chapter_num = 1
    no_new_count = 0
    while no_new_count < max_no_new:
        url = f"{base_url}{next_chapter_num}-introduction"
        options = Options()
        options.add_argument("--headless")
        driver = webdriver.Chrome(options=options)
        driver.get(url)
        time.sleep(5)
        try:
            main_headings = driver.find_elements(By.XPATH, "//div[@role='row' and @aria-level='1']")
            for heading in main_headings:
                try:
                    expanded = heading.get_attribute('aria-expanded')
                    if expanded != 'true':
                        heading.click()
                        time.sleep(0.5)
                except Exception:
                    pass
        except Exception:
            pass
        time.sleep(2)
        html = driver.page_source
        driver.quit()
        soup = BeautifulSoup(html, "html.parser")
        found_new = False
        found_chapter_nums = []
        for summary_span in soup.find_all('span', class_='styled__SummaryTitle-sc-18yti3s-0'):
            num_span = summary_span.find('span', class_='os-number')
            text_span = summary_span.find('span', class_='os-text')
            if num_span and text_span:
                chap_num_str = num_span.get_text(strip=True)
                chap_name = text_span.get_text(strip=True)
                found_chapter_nums.append(int(chap_num_str))
                if chap_num_str not in chapter_map:
                    chapter_map[chap_num_str] = chap_name
                    found_new = True
        if found_new:
            no_new_count = 0
            unseen = [n for n in sorted(found_chapter_nums) if str(n) not in chapter_map]
            if unseen:
                next_chapter_num = unseen[0]
            else:
                next_chapter_num = max(found_chapter_nums) + 1
        else:
            no_new_count += 1
            next_chapter_num += 1
    return chapter_map

def main():
    extractor = OpenStaxContentExtractor()
    base_urls = [
        "https://openstax.org/books/concepts-biology/pages/",
        "https://openstax.org/books/biology-2e/pages/",
        "https://openstax.org/books/biology-ap-courses/pages/",
        "https://openstax.org/books/introduction-behavioral-neuroscience/pages/",
        "https://openstax.org/books/microbiology/pages/"
    ]
    folder_names = [
        "concepts-biology",
        "biology-2e",
        "biology-ap-courses",
        "introduction-behavioral-neuroscience",
        "microbiology"
    ]

    for base_url, folder_name in zip(base_urls, folder_names):
        start_url = base_url + "1-introduction"
        output_folder = os.path.join("data", folder_name)
        os.makedirs(output_folder, exist_ok=True)
        print(f"\nProcessing book: {folder_name}")

        # Step 1: Use Selenium to build chapter map
        chapter_map = get_chapter_map_selenium(base_url)

        # Step 2: Scrape chapters and use chapter_map for filenames
        current_url = start_url
        visited_urls = set()
        chapters = {}

        while current_url and current_url not in visited_urls:
            print(f"Processing section: {current_url}")
            soup = extractor.get_page_content(current_url)
            if not soup:
                print(f"Failed to fetch content, stopping.")
                break
            visited_urls.add(current_url)

            # Extract section title
            section_title = soup.find('h1')
            section_title = section_title.get_text().strip() if section_title else current_url
            section_id = extractor.extract_section_id(section_title) or current_url.split('/')[-1]

            # Determine chapter number from URL (e.g., /pages/1-...)
            match = re.search(r'/pages/(\d+)-', current_url)
            chapter_num = match.group(1) if match else 'unknown'

            # Use chapter_map for dynamic naming
            chapter_name = chapter_map.get(chapter_num, section_title if section_id.endswith('introduction') else f'Chapter {chapter_num}')
            formatted_chapter_name = chapter_name.lower().replace(' ', '_')
            chapter_key = f"{chapter_num}_{formatted_chapter_name}" if chapter_num != 'unknown' else f"unknown_{formatted_chapter_name}"

            if chapter_key not in chapters:
                chapters[chapter_key] = {
                    'chapter_title': chapter_name,
                    'chapter_url': f'{base_url}{chapter_num}-introduction',
                    'sections': []
                }

            section_data = {
                'section_id': section_id,
                'title': section_title,
                'url': current_url,
                'learning_objectives': extractor.extract_learning_objectives(soup),
                'figures': extractor.extract_figures_with_context(soup),
                'content_blocks': extractor.extract_content_blocks(soup),
                'key_terms': extractor.extract_key_terms_glossary(soup)
            }
            chapters[chapter_key]['sections'].append(section_data)

            # Find the 'Next' link
            next_link = None
            for link in soup.find_all('a', href=True):
                if link.get_text().strip().lower() == 'next':
                    href = link.get('href')
                    if href:
                        # Handle relative URLs
                        if not href.startswith('http'):
                            next_link = urljoin(current_url, href)
                        else:
                            next_link = href
                        break
            current_url = next_link

        # Save each chapter's data to a separate file in the subfolder
        for chapter_key, chapter_data in chapters.items():
            chapter_filename = os.path.join(output_folder, f"{chapter_key}.json")
            with open(chapter_filename, 'w', encoding='utf-8') as f:
                json.dump(chapter_data, f, indent=2, ensure_ascii=False)
            print(f"Chapter {chapter_key} data saved to {chapter_filename}")

            # Process for RAG
            rag_chunks = extractor.process_for_multimodal_rag(chapter_data)
            rag_filename = os.path.join(output_folder, f"{chapter_key}_rag.csv")
            df = pd.DataFrame(rag_chunks)
            df.to_csv(rag_filename, index=False)
            print(f"RAG data saved to {rag_filename}")

            # Cost analysis
            text_chunks = len([c for c in rag_chunks if c['content_type'] in ['text', 'multimodal']])
            image_chunks = len([c for c in rag_chunks if c['content_type'] == 'multimodal'])

            print(f"\nCost Analysis for Chapter {chapter_key}:")
            print(f"Text chunks: {text_chunks}")
            print(f"Image chunks: {image_chunks}")
            print(f"Estimated processing cost: ${text_chunks * 0.0001 + image_chunks * 0.01:.4f}")

if __name__ == "__main__":
    main()