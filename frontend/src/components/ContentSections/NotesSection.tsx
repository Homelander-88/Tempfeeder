import React, { useEffect } from 'react';
import { processMathExpressions, isStandaloneMathLine } from '../../utils/mathProcessor';

declare global {
  interface Window {
    MathJax?: {
      typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
      startup: {
        ready: () => void;
      };
      config: {
        tex: {
          inlineMath: string[][];
          displayMath: string[][];
        };
      };
    };
  }
}

interface NotesSectionProps {
  notes: string;
  isAdmin: boolean;
  onEditNotes?: () => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  isAdmin,
  onEditNotes
}) => {
  // Initialize MathJax
  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise().catch((err: Error) => {
        console.warn('MathJax typeset error:', err);
      });
    }
  }, [notes]);

  // Parse and render structured text with visual elements for hierarchy
  const parseStructuredText = (text: string) => {
    if (!text || text.trim() === '') {
      return [<p key="empty" className="structured-paragraph">No content available</p>];
    }

    // Content parsing for regular text sections
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let inList = false;
    let listItems: React.ReactElement[] = [];
    let currentIndentation = 0;
    let listType: 'bullet' | 'numbered' = 'bullet';
    let listStartNumber = 1;
    let inTable = false;
    let tableRows: string[][] = [];
    let tableHeaders: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === 'numbered') {
          elements.push(
            <ol key={`list-${elements.length}`} className="structured-list structured-numbered-list" start={listStartNumber}>
              {listItems}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`list-${elements.length}`} className="structured-list">
              {listItems}
            </ul>
          );
        }
        listItems = [];
        inList = false;
      }
    };

    const flushTable = () => {
      if (tableHeaders.length > 0 || tableRows.length > 0) {
        elements.push(
          <table key={`table-${elements.length}`} className="structured-table">
            {tableHeaders.length > 0 && (
              <thead>
                <tr>
                  {tableHeaders.map((header, index) => (
                    <th key={index} className="structured-table-header">
                      {parseInlineFormatting(header.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {tableRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="structured-table-cell">
                      {parseInlineFormatting(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
        tableHeaders = [];
        tableRows = [];
        inTable = false;
      }
    };

    const parseInlineFormatting = (text: string) => {
      if (!text) return text;
      
      // Process math expressions first
      let formattedText = processMathExpressions(text);

      // Escape HTML entities
      formattedText = formattedText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

      // Links [text](url) - process before other formatting
      formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="structured-link" target="_blank" rel="noopener noreferrer">$1</a>');

      // Inline code (`code`) - preserves exact characters
      formattedText = formattedText.replace(/`([^`\n]+)`/g, (_match, code) => {
        // Only escape essential HTML entities within inline code
        const escapedCode = code
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `<code class="structured-inline-code">${escapedCode}</code>`;
      });

      // Bold (**text**)
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong class="structured-bold">$1</strong>');

      // Italic (*text*)
      formattedText = formattedText.replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '<em class="structured-italic">$1</em>');

      // Strikethrough (~~text~~)
      formattedText = formattedText.replace(/~~(.*?)~~/g, '<del class="structured-strikethrough">$1</del>');

      return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
    };

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const trimmedLine = line.trim();
      const leadingSpaces = line.length - line.trimLeft().length;

      // Skip standalone square brackets (just [ or ] on their own line)
      if (trimmedLine === '[' || trimmedLine === ']') {
        continue; // Skip this line
      }

      // Table detection (dot-separated format)
      if (trimmedLine.includes(' . ') || trimmedLine.includes(' | ')) {
        flushList();
        if (!inTable) {
          inTable = true;
          tableHeaders = [];
          tableRows = [];
        }

        const cells = trimmedLine.split(/\s*\.\s*|\s*\|\s*/).filter(cell => cell.trim() !== '');
        if (tableHeaders.length === 0 && index === 0) {
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Headers (# ## ###)
      const headerMatch = trimmedLine.match(/^(#{1,6})\s*(.+)?$/);
      if (headerMatch) {
        flushList();
        flushTable();
        const level = headerMatch[1].length;
        const content = headerMatch[2] || '';
        const className = `structured-heading structured-h${level}`;
        elements.push(
          <div key={`header-${index}`} className={className}>
            {parseInlineFormatting(content)}
          </div>
        );
        continue;
      }

      // Horizontal lines (---, ***, ___)
      if (/^[-*_]{3,}$/.test(trimmedLine)) {
        flushList();
        flushTable();
        elements.push(<hr key={`hr-${index}`} className="structured-horizontal-line" />);
        continue;
      }

      // Blockquotes (> text)
      if (trimmedLine.startsWith('>')) {
        flushList();
        flushTable();
        const content = trimmedLine.substring(1).trim();
        elements.push(
          <blockquote key={`blockquote-${index}`} className="structured-blockquote">
            {parseInlineFormatting(content)}
          </blockquote>
        );
        continue;
      }

      // Lists (numbered: 1. 2. 3., bullet: * - +)
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
      const bulletMatch = trimmedLine.match(/^[-*+]\s+(.+)$/);

      if (numberedMatch || bulletMatch) {
        flushTable();

        const listNumber = numberedMatch ? parseInt(numberedMatch[1]) : 1;
        const content = (numberedMatch ? numberedMatch[2] : bulletMatch![1]).trim();

        if (!inList || listType !== (numberedMatch ? 'numbered' : 'bullet') || leadingSpaces !== currentIndentation) {
          flushList();
          inList = true;
          listType = numberedMatch ? 'numbered' : 'bullet';
          currentIndentation = leadingSpaces;
          listStartNumber = listNumber;
        }

        listItems.push(
          <li key={`item-${index}`} className="structured-list-item" style={{ marginLeft: `${leadingSpaces * 20}px` }}>
            {parseInlineFormatting(content)}
          </li>
        );
        continue;
      }

      // Empty lines break lists
      if (trimmedLine === '') {
        if (inList) {
          flushList();
        }
        continue;
      }

      // Block math detection ($$...$$ or \[...\])
      const blockMathMatch = trimmedLine.match(/^\$\$([^$]+)\$\$$/) || trimmedLine.match(/^\\\[([^\]]+)\\\]$/);
      if (blockMathMatch) {
        flushList();
        flushTable();
        const mathContent = blockMathMatch[1].trim();
        elements.push(
          <div key={`math-${index}`} className="math-block" style={{ margin: '1em 0', textAlign: 'center' }}>
            <span className="math-display">$${mathContent}$$</span>
          </div>
        );
        continue;
      }

      // Check if line is a standalone math expression (possibly in square brackets)
      if (isStandaloneMathLine(trimmedLine)) {
        flushList();
        flushTable();
        // Process the line to remove brackets and format as block math
        let processedLine = processMathExpressions(trimmedLine);
        
        // Ensure it's in block math format
        if (!processedLine.trim().startsWith('$$')) {
          // Extract math content (remove any remaining formatting)
          const mathMatch = processedLine.match(/\$\$([^$]+)\$\$/) || processedLine.match(/\\\(([^\)]+)\\\)/);
          if (mathMatch) {
            processedLine = `$$${mathMatch[1].trim()}$$`;
          } else {
            // If no math delimiters, wrap the whole thing
            processedLine = `$$${processedLine.trim()}$$`;
          }
        }
        
        // Extract just the math content for display
        const mathContentMatch = processedLine.match(/\$\$([^$]+)\$\$/);
        const mathContent = mathContentMatch ? mathContentMatch[1].trim() : processedLine.replace(/\$\$/g, '').trim();
        
        elements.push(
          <div key={`math-block-${index}`} className="math-block" style={{ margin: '1em 0', textAlign: 'center' }}>
            <span className="math-display">$${mathContent}$$</span>
          </div>
        );
        continue;
      }

      // Regular paragraphs (if not in a list or table)
      if (!inList && !inTable) {
        flushList();
        flushTable();
        const processedLine = processMathExpressions(trimmedLine);
        elements.push(
          <p key={`para-${index}`} className="structured-paragraph">
            {parseInlineFormatting(processedLine)}
          </p>
        );
      }
    }

    // Flush any remaining content
    flushList();
    flushTable();

    return elements;
  };

  return (
    <section className="section notes" key="notes">
      <div className="section-header">
        <h2 className="section-title">Notes</h2>
        {isAdmin && (
          <button
            className="section-edit-btn"
            onClick={onEditNotes}
            title="Edit notes"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
      </div>
      <div className="notes-content">
        <div className="notes-structured">
          {parseStructuredText(notes)}
        </div>
      </div>
    </section>
  );
};
