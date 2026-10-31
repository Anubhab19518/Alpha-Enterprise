'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Parses inline markdown (bold **text**, italic *text*, code `text`, links)
 */
function parseInlineMarkdown(text: string): React.ReactNode[] {
  // Regex to match bold (**text**), italic (*text*), code (`text`)
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-neutral-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-neutral-800">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 bg-neutral-200/70 text-neutral-900 rounded text-[11px] font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/**
 * Renders full markdown content to JSX supporting headings, bullet lists,
 * numbered lists, paragraphs, bold tags, and line breaks.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  if (!content || !content.trim()) return null;

  // Split into lines or paragraphs
  const rawLines = content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];

  let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        elements.push(
          <ul
            key={`ul-${elements.length}`}
            className="list-disc list-inside space-y-1.5 my-2 pl-1 text-neutral-700"
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol
            key={`ol-${elements.length}`}
            className="list-decimal list-inside space-y-1.5 my-2 pl-1 text-neutral-700"
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();

    if (!line) {
      flushList();
      continue;
    }

    // Headings: ### Heading 3, ## Heading 2, # Heading 1
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h4
          key={`h4-${i}`}
          className="text-xs sm:text-sm font-bold text-neutral-950 uppercase tracking-wider mt-3 mb-1 font-serif"
        >
          {parseInlineMarkdown(line.slice(4))}
        </h4>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-sm sm:text-base font-bold text-neutral-950 uppercase tracking-wider mt-3.5 mb-1.5 font-serif"
        >
          {parseInlineMarkdown(line.slice(3))}
        </h3>
      );
      continue;
    }

    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-base sm:text-lg font-bold text-neutral-950 uppercase tracking-wider mt-4 mb-2 font-serif"
        >
          {parseInlineMarkdown(line.slice(2))}
        </h2>
      );
      continue;
    }

    // Unordered List: - item, * item, • item
    if (/^[-*•]\s+/.test(line)) {
      const itemText = line.replace(/^[-*•]\s+/, '');
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(parseInlineMarkdown(itemText));
      continue;
    }

    // Numbered List: 1. item, 2. item
    if (/^\d+\.\s+/.test(line)) {
      const itemText = line.replace(/^\d+\.\s+/, '');
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(parseInlineMarkdown(itemText));
      continue;
    }

    // Regular paragraph or text with inline markdown
    flushList();

    // Check if line contains embedded numbered list items like "1. **Foo**: ... 2. **Bar**: ..." on one line
    if (line.includes('1. **') && line.includes('2. **')) {
      const parts = line.split(/(?=\d+\.\s+\*\*)/g);
      elements.push(
        <div key={`split-num-${i}`} className="space-y-2 my-2">
          {parts.map((p, pIdx) => {
            const cleanP = p.trim();
            if (!cleanP) return null;
            return (
              <div key={pIdx} className="leading-relaxed flex items-start gap-1.5">
                <span className="text-neutral-900 shrink-0 font-bold">•</span>
                <div>{parseInlineMarkdown(cleanP.replace(/^\d+\.\s+/, ''))}</div>
              </div>
            );
          })}
        </div>
      );
      continue;
    }

    elements.push(
      <p
        key={`p-${i}`}
        className="leading-[1.6] text-neutral-700 my-1 font-sans"
        style={{ lineHeight: 1.6 }}
      >
        {parseInlineMarkdown(line)}
      </p>
    );
  }

  flushList();

  return (
    <div
      className={`markdown-content text-xs text-neutral-700 leading-relaxed font-sans ${className}`}
      style={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}
    >
      {elements}
    </div>
  );
};
