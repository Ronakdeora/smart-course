import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Lightbulb } from "lucide-react";

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent = ({ content }: MarkdownContentProps) => {
  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings with modern styling
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mb-6 mt-8 text-slate-900 border-b-2 border-blue-500 pb-3">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-semibold mb-4 mt-8 text-slate-800 flex items-center gap-2">
              <span className="w-1 h-8 bg-blue-500 rounded-full"></span>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-semibold mb-3 mt-6 text-slate-700">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xl font-medium mb-2 mt-4 text-slate-600">
              {children}
            </h4>
          ),
          // Paragraphs with better spacing
          p: ({ children }) => (
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              {children}
            </p>
          ),
          // Lists with custom styling
          ul: ({ children }) => (
            <ul className="space-y-2 mb-4 ml-6 list-none">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 mb-4 ml-6 list-decimal list-inside">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="flex-1">{children}</span>
            </li>
          ),
          // Blockquotes with icon
          blockquote: ({ children }) => (
            <Card className="my-6 p-4 border-l-4 border-blue-500 bg-blue-50/50">
              <div className="flex gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1 text-slate-700">{children}</div>
              </div>
            </Card>
          ),
          // Code blocks with better styling
          code: ({ ...props }) => {
            const isInline = !props.className;
            if (isInline) {
              return (
                <code className="px-2 py-1 rounded bg-slate-100 text-pink-600 font-mono text-sm border border-slate-200" {...props} />
              );
            }
            return (
              <Card className="my-4 p-4 bg-slate-900 text-slate-100 overflow-x-auto">
                <code className="font-mono text-sm" {...props} />
              </Card>
            );
          },
          pre: ({ children }) => (
            <div className="my-4">{children}</div>
          ),
          // Tables with modern styling
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto">
              <table className="w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-200">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-slate-50 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b-2 border-slate-300">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-slate-700">{children}</td>
          ),
          // Links with hover effects
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-600 transition-colors"
            >
              {children}
            </a>
          ),
          // Strong/Bold text
          strong: ({ children }) => (
            <strong className="font-bold text-slate-900">{children}</strong>
          ),
          // Emphasis/Italic text
          em: ({ children }) => (
            <em className="italic text-slate-700">{children}</em>
          ),
          // Horizontal rule
          hr: () => (
            <hr className="my-8 border-t-2 border-slate-200" />
          ),
          // Images with modern styling
          img: ({ src, alt }) => (
            <div className="my-6">
              <img
                src={src}
                alt={alt || ""}
                className="rounded-lg shadow-lg w-full object-cover"
                loading="lazy"
              />
              {alt && (
                <p className="text-sm text-slate-500 text-center mt-2 italic">
                  {alt}
                </p>
              )}
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
