# Add missing imports
import os
import glob
import pandas as pd
import re


# List of textbook folders
textbook_folders = [
    "concepts-biology",
    "biology-2e",
    "biology-ap-courses",
    "introduction-behavioral-neuroscience",
    "microbiology"
]

for folder in textbook_folders:
    # Collect all figures for this folder
    all_figures = []
    data_folder = os.path.join('data', folder)
    output_dir = os.path.join('extracted', folder)
    os.makedirs(output_dir, exist_ok=True)
    csv_files = glob.glob(os.path.join(data_folder, '*_rag.csv'))
    for csv_path in csv_files:
        # Skip empty CSV files
        try:
            df = pd.read_csv(csv_path)
        except pd.errors.EmptyDataError:
            print(f"Skipping empty file: {csv_path}")
            continue

        # Get first non-empty section value for YAML
        section_val = df['section'].dropna().values[0] if not df['section'].dropna().empty else 'Unknown Section'
        chapter_val = None
        for meta in df['metadata']:
            try:
                meta_dict = eval(meta) if isinstance(meta, str) else meta
                if 'chapter' in meta_dict:
                    chapter_val = meta_dict['chapter']
                    break
            except Exception:
                continue
        if not chapter_val:
            chapter_val = 'Unknown Chapter'

        # Derive output filenames
        base_name = os.path.basename(csv_path).replace('_rag.csv', '')
        output_md = os.path.join(output_dir, f'{base_name}.md')
        anchor_md = os.path.join(output_dir, f'{base_name}_anchor.md')
        seen_headings = set()

        with open(output_md, 'w', encoding='utf-8') as f, open(anchor_md, 'w', encoding='utf-8') as anchor_f:
            # Write YAML-like frontmatter (plain text, not true YAML) for main md
            f.write('---\n')
            f.write(f'chapter: {chapter_val}\n')
            f.write(f'section: {section_val}\n')
            f.write(f'subject: Biology\n')
            f.write(f'source: {folder}\n')
            f.write('---\n\n')

            # Write YAML-like frontmatter for anchor md
            anchor_f.write('---\n')
            anchor_f.write(f'chapter: "{chapter_val}"\n')
            anchor_f.write('kind: "anchor"\n')
            anchor_f.write('---\n\n')

            # Track figure captions to avoid duplicates
            seen_figures = set()

            # Section mapping for special headings
            section_headings = {
                'Chapter Summary': '## Summary'
            }

            skip_section = False
            current_special_section = None
            special_section_buffer = []
            skip_rest = False
            summary_heading_written = False
            for _, row in df.iterrows():
                section_name = str(row['section']).strip()
                # After Chapter Summary, skip all subsequent rows
                if skip_rest:
                    continue

                if section_name == 'Chapter Summary' and not summary_heading_written:
                    f.write('## Summary\n\n')
                    summary_heading_written = True

                if row['content_type'] == 'heading':
                    heading = row['text'].strip()
                    if heading.lower() == 'link to learning':
                        skip_section = True
                        continue
                    else:
                        skip_section = False
                    if heading not in seen_headings:
                        try:
                            level_dict = eval(row['metadata']) if isinstance(row['metadata'], str) else row['metadata']
                            heading_level = level_dict.get('heading_level', 'h2')
                        except Exception:
                            heading_level = 'h2'
                        hashes = '#' * int(heading_level.replace('h', ''))
                        f.write(f"{hashes} {heading}\n\n")
                        # Write to anchor file with hierarchy
                        anchor_f.write(f"{hashes} {heading}\n")
                        seen_headings.add(heading)
                elif skip_section:
                    continue
                elif row['content_type'] == 'multimodal':
                    try:
                        meta = eval(row['metadata']) if isinstance(row['metadata'], str) else row['metadata']
                        fig_num = meta.get('figure_number', None)
                    except Exception:
                        fig_num = None
                    fig_key = f"{fig_num}_{row['image_url']}"
                    if fig_key not in seen_figures:
                        img_desc = row['image_description'].strip() if isinstance(row['image_description'], str) else ''
                        img_url = row['image_url'].strip() if isinstance(row['image_url'], str) else ''
                        if img_url:
                            f.write(f"![{img_desc}]({img_url})\n")
                        # Remove all line breaks, then remove the second 'Figure <number>'
                        figure_text = row['text']
                        # Remove all line breaks and extra spaces
                        figure_text = ' '.join(figure_text.split())
                        # Remove the second 'Figure <number>' after the colon
                        figure_text = re.sub(r'^(Figure\s+\d+\.?\d*:)[ ]*Figure\s+\d+\.?\d*\s*', r'\1 ', figure_text)
                        f.write(figure_text.strip() + '\n\n')
                        seen_figures.add(fig_key)

                        # Collect figure for all_figures list
                        all_figures.append({
                            'img_desc': img_desc,
                            'img_url': img_url,
                            'figure_text': figure_text.strip(),
                            'chapter': chapter_val,
                            'section': section_name,
                            'source': folder
                        })
    # After all CSVs, write all figures to a single file
    if all_figures:
        all_figures_md = os.path.join(output_dir, f'all-{folder}-figures.md')
        with open(all_figures_md, 'w', encoding='utf-8') as fig_f:
            fig_f.write('---\n')
            fig_f.write(f'chapter: All Figures\n')
            fig_f.write(f'section: All Figures\n')
            fig_f.write(f'subject: Biology\n')
            fig_f.write(f'source: {folder}\n')
            fig_f.write('---\n\n')
            for fig in all_figures:
                if fig['img_url']:
                    fig_f.write(f"![{fig['img_desc']}]({fig['img_url']})\n")
                    fig_f.write(f"{fig['figure_text']}\n")
                    fig_f.write(f"*Chapter: {fig['chapter']} | Section: {fig['section']}*\n\n")
                elif row['content_type'] == 'text':
                    text_val = row['text'].strip()
                    if not any(text_val == t for t in seen_figures):
                        f.write(text_val + '\n\n')

                if section_name == 'Chapter Summary':
                    skip_rest = True