import React, { useState } from 'react';

interface QAItem {
  id: number;
  question: string;
  answer: string;
}

interface QASectionProps {
  questions: QAItem[];
  isAdmin: boolean;
  onDeleteQuestion?: (questionId: number) => void;
  onAddQuestion?: () => void;
  onEditQuestion?: (questionId: number) => void;
}

export const QASection: React.FC<QASectionProps> = ({
  questions,
  isAdmin,
  onDeleteQuestion,
  onAddQuestion,
  onEditQuestion
}) => {
  const [_openQuestions, _setOpenQuestions] = useState<Set<number>>(new Set());

  // Parse and render structured text with visual elements for hierarchy
  const parseStructuredText = (text: string, enableCodeDetection: boolean = false) => {
    if (!text || text.trim() === '') {
      return [<p key="empty" className="structured-paragraph">No content available</p>];
    }

    // If code detection is enabled, check if entire text should be treated as code
    if (enableCodeDetection) {
      const hasCodeContent = text.split('\n').some(line => {
        const trimmed = line.trim();
        // Function definitions
        if (trimmed.match(/^(function|def|class|public|private|void|int|string|bool|const|let|var)\s+\w+/)) return true;
        // Algorithm/pseudocode patterns
        if (trimmed.match(/^(if|for|while|do|BEGIN|END|READ|FOR|WHILE|IF|ELSE|RETURN)\s|\w+\([^)]*\)\s*[:{]|\w+\s*\([^)]*\)\s*{/)) return true;
        // Array access patterns
        if (trimmed.match(/[A-Z]\[[^\]]+\]/)) return true;
        // Assignment with code-like syntax
        if (trimmed.match(/^\w+\s*=\s*[^=]/) && (trimmed.includes('[') || trimmed.includes('(') || trimmed.includes('{'))) return true;
        return false;
      });

      // If text contains code patterns, render entire text as one code block
      if (hasCodeContent) {
        return [
          <pre
            key="full-code-block"
            className="structured-code-block"
            data-language="text"
          >
            <code className="language-text">
              {text}
            </code>
          </pre>
        ];
      }
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
      let formattedText = text;

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

      // Links [text](url)
      formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="structured-link" target="_blank" rel="noopener noreferrer">$1</a>');

      return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
    };

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const trimmedLine = line.trim();
      const leadingSpaces = line.length - line.trimLeft().length;

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

      // Regular paragraphs (if not in a list or table)
      if (!inList && !inTable) {
        flushList();
        flushTable();
        elements.push(
          <p key={`para-${index}`} className="structured-paragraph">
            {parseInlineFormatting(trimmedLine)}
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
    <section className="section questions" key="questions">
      <div className="section-header">
        <h2 className="section-title">Questions & Answers</h2>
        {isAdmin && questions.length > 0 && (
          <button
            className="section-delete-btn"
            onClick={() => {/* Delete all questions */}}
            title="Delete all questions"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        )}
      </div>

      <div className="qa-widget">
        {questions.map((q, _index) => (
          <details key={q.id} className="qa-item">
            <summary className="qa-widget-question">
              <div className="question-content">
                {parseStructuredText(q.question)}
              </div>
              <div className="question-controls">
                {isAdmin && (
                  <>
                    <button
                      className="question-edit-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        onEditQuestion?.(q.id);
                      }}
                      title="Edit question"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      className="question-delete-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        onDeleteQuestion?.(q.id);
                      }}
                      title="Delete question"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </>
                )}
                <div className="question-toggle">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </div>
            </summary>
            <div className="qa-widget-answer">
              <div className="answer-content">
                {parseStructuredText(q.answer, true)}
              </div>
            </div>
          </details>
        ))}
      </div>

      {isAdmin && (
        <div className="content-add-section">
          <button
            className="content-add-btn"
            onClick={onAddQuestion}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <path d="M12 17h.01"/>
            </svg>
            Add Question
          </button>
        </div>
      )}
    </section>
  );
};
