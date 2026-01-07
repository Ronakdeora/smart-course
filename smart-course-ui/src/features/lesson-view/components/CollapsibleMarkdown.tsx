import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MarkdownContent } from "./MarkdownContent";

interface CollapsibleMarkdownProps {
  content: string;
}

export const CollapsibleMarkdown = ({ content }: CollapsibleMarkdownProps) => {
  const [sections, setSections] = useState<{ title: string; content: string; id: number }[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0, 1]));
  const sectionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    // Split content by H2 headings
    const h2Regex = /^## (.+)$/gm;
    const matches = [...content.matchAll(h2Regex)];
    
    if (matches.length === 0) {
      // No H2 headings found, show all content
      setSections([{ title: "", content, id: 0 }]);
      setExpandedSections(new Set([0]));
      return;
    }

    const parsedSections: { title: string; content: string; id: number }[] = [];
    
    // Content before first H2
    if (matches[0].index! > 0) {
      const preContent = content.substring(0, matches[0].index).trim();
      if (preContent) {
        parsedSections.push({
          title: "",
          content: preContent,
          id: 0
        });
      }
    }

    // Process each H2 section
    matches.forEach((match, index) => {
      const title = match[1];
      const startIndex = match.index! + match[0].length;
      const endIndex = matches[index + 1]?.index ?? content.length;
      const sectionContent = content.substring(startIndex, endIndex).trim();
      
      parsedSections.push({
        title,
        content: sectionContent,
        id: parsedSections.length
      });
    });

    setSections(parsedSections);
    // First two sections expanded by default
    setExpandedSections(new Set([0, 1]));
  }, [content]);

  const toggleSection = (id: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      const isExpanding = !newSet.has(id);
      
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      
      // Scroll to section when expanding
      if (isExpanding) {
        setTimeout(() => {
          const element = sectionRefs.current[id];
          if (element) {
            const headerOffset = 100; // Account for sticky header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100); // Small delay to allow expansion animation to start
      }
      
      return newSet;
    });
  };

  if (sections.length === 0) {
    return <MarkdownContent content={content} />;
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.id);
        const hasTitle = section.title.trim() !== "";

        if (!hasTitle) {
          // Content without heading - always show
          return (
            <div key={section.id} className="mb-4">
              <MarkdownContent content={section.content} />
            </div>
          );
        }

        return (
          <div 
            key={section.id} 
            ref={(el) => { sectionRefs.current[section.id] = el; }}
            className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all duration-300 text-left group"
            >
              <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                {section.title}
              </h2>
              <div className="flex-shrink-0 ml-4">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-all duration-300 transform group-hover:scale-110" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-all duration-300 transform group-hover:scale-110" />
                )}
              </div>
            </button>
            <div 
              className={`transition-all duration-500 ease-in-out ${
                isExpanded 
                  ? 'max-h-[5000px] opacity-100' 
                  : 'max-h-0 opacity-0 overflow-hidden'
              }`}
            >
              <div className="px-6 pb-6 border-t border-slate-100">
                <MarkdownContent content={section.content} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
