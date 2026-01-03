import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import './MarkdownRenderer.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Universal Markdown + LaTeX Renderer
 * 
 * This component renders ChatGPT responses that contain:
 * - Markdown (headings, bold, lists, code blocks, etc.)
 * - LaTeX math (inline: $...$, block: $$...$$)
 * 
 * Features:
 * - Automatically handles ALL LaTeX expressions (limits, fractions, integrals, derivatives, etc.)
 * - Future-proof: any valid LaTeX will render without code changes
 * - Secure: react-markdown sanitizes HTML by default
 * - ChatGPT-like appearance: clean, readable, professional
 */
/**
 * Preprocess content to convert square-bracket math expressions to LaTeX format
 * Converts [expression] patterns that look like math to $expression$ or $$expression$$
 * Handles patterns like [\lim_{(x,y)\to(a,b)} f(x,y) = L], [x^2 + y^2 \le 4], etc.
 * Also escapes # characters in math mode (needed for KaTeX)
 */
/**
 * Rule 0: Handle \boxed{} commands - highest priority
 * Converts [ \boxed{...} ] and strips trailing non-math tokens
 * Ensures ONLY pure math goes inside $$...$$ delimiters
 */
const handleBoxedCommands = (text: string): string => {
  // Process line by line to handle trailing tokens properly
  const lines = text.split('\n');
  const processedLines = lines.map(line => {
    // Match [ ... \boxed{...} ... ] optionally followed by trailing tokens
    const boxedPattern = /^\s*\[([^\]]*\s*\\boxed\s*\{[^}]*\}[^\]]*)\]\s*(.*)$/;
    const match = line.match(boxedPattern);

    if (match) {
      const [, boxedContent, trailingTokens] = match;

      // Extract and clean the \boxed{...} content
      const trimmed = boxedContent.trim();

      // If there are trailing tokens, put them on a separate line
      if (trailingTokens && trailingTokens.trim()) {
        return `$$${trimmed}$$\n${trailingTokens.trim()}`;
      } else {
        // No trailing tokens - just the boxed math
        return `$$${trimmed}$$`;
      }
    }

    // No boxed command on this line
    return line;
  });

  return processedLines.join('\n');
};

/**
 * Problem Fixer - Pre-render validation & correction layer
 *
 * Enforces math formatting rules to prevent KaTeX errors:
 * 0. Handle \boxed{} commands (highest priority)
 * 1. Balance math delimiters ($ and $$)
 * 2. Enforce \left / \right pairing
 * 3. Never allow Markdown inside math (#, *, etc.)
 * 4. Auto-wrap bare LaTeX math (safe mode)
 * 5. Block math should be centered
 */
const preprocessMathExpressions = (text: string): string => {
  if (!text) return text;

  let processed = text;

  // Rule 0: Handle \boxed{} commands (highest priority)
  processed = handleBoxedCommands(processed);

  // Rule 1: Balance math delimiters (fix dangling $ and $$)
  processed = balanceMathDelimiters(processed);

  // Rule 2: Enforce \left / \right pairing
  processed = fixLeftRightDelimiters(processed);

  // Rule 3: Never allow Markdown inside math
  processed = preventMarkdownInMath(processed);

  // Rule 4: Auto-wrap bare LaTeX math (only pure math lines)
  processed = autoWrapBareMath(processed);

  // Rule 5: Ensure complex expressions use block math
  processed = ensureBlockMathForComplex(processed);

  return processed;
};

/**
 * Rule 1: Balance math delimiters - auto-close dangling $ or $$
 */
const balanceMathDelimiters = (text: string): string => {
  let result = '';
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (char === '$') {
      // Check if it's $$ (block) or $ (inline)
      if (i + 1 < text.length && text[i + 1] === '$') {
        // Block math $$
        const start = i;
        i += 2; // Skip $$

        // Find matching $$
        let foundClosing = false;
        while (i < text.length - 1) {
          if (text[i] === '$' && text[i + 1] === '$') {
            foundClosing = true;
            i += 2; // Skip closing $$
            break;
          }
          i++;
        }

        // If no closing $$, add one
        if (!foundClosing) {
          result += text.substring(start, i) + '$$';
        } else {
          result += text.substring(start, i);
        }
      } else {
        // Inline math $
        const start = i;
        i++; // Skip $

        // Find matching $
        let foundClosing = false;
        while (i < text.length) {
          if (text[i] === '$' && (i + 1 >= text.length || text[i + 1] !== '$')) {
            foundClosing = true;
            i++; // Skip closing $
            break;
          }
          i++;
        }

        // If no closing $, add one
        if (!foundClosing) {
          result += text.substring(start, i) + '$';
        } else {
          result += text.substring(start, i);
        }
      }
    } else {
      result += char;
      i++;
    }
  }

  return result;
};

/**
 * Rule 2: Enforce \left / \right pairing
 */
const fixLeftRightDelimiters = (text: string): string => {
  // Process each math block separately
  return text.replace(/\$\$([^$]+)\$\$/g, (_match, content) => {
    let fixed = content;
    const leftCount = (content.match(/\\left/g) || []).length;
    const rightCount = (content.match(/\\right/g) || []).length;

    if (leftCount > rightCount) {
      // Add missing \right delimiters
      for (let i = 0; i < leftCount - rightCount; i++) {
        fixed += '\\right.';
      }
    } else if (rightCount > leftCount) {
      // Remove extra \right delimiters (simplified approach)
      fixed = fixed.replace(/\\right[^a-zA-Z]/g, (match: string) => {
        rightCount > leftCount ? '' : match;
      });
    }

    return `$$${fixed}$$`;
  }).replace(/(?<!\$)\$(?!\$)([^$\n]+?)(?<!\$)\$(?!\$)/g, (_match, content) => {
    let fixed = content;
    const leftCount = (content.match(/\\left/g) || []).length;
    const rightCount = (content.match(/\\right/g) || []).length;

    if (leftCount > rightCount) {
      for (let i = 0; i < leftCount - rightCount; i++) {
        fixed += '\\right.';
      }
    }

    return `$${fixed}$`;
  });
};

/**
 * Rule 3: Never allow Markdown inside math (#, *, etc.)
 */
const preventMarkdownInMath = (text: string): string => {
  // Process each math block and exit math mode before Markdown
  return text.replace(/\$\$([^$]+)\$\$/g, (_match, content) => {
    // Check for Markdown syntax
    if (/^#{1,6}\s|^\s*[\*\-\+]\s|^\s*\d+\.\s|\*\*|\*|^\s*>\s|^\s*```|~~~|^\s*\|.*\|.*\|/.test(content)) {
      // Contains Markdown - exit math mode
      return content;
    }
    return `$$${content}$$`;
  }).replace(/(?<!\$)\$(?!\$)([^$\n]+?)(?<!\$)\$(?!\$)/g, (_match, content) => {
    if (/^#{1,6}\s|^\s*[\*\-\+]\s|^\s*\d+\.\s|\*\*|\*|^\s*>\s|^\s*```|~~~|^\s*\|.*\|.*\|/.test(content)) {
      return content;
    }
    return `$${content}$`;
  });
};

/**
 * Rule 4: Auto-wrap bare LaTeX math (only pure math lines)
 */
const autoWrapBareMath = (text: string): string => {
  const lines = text.split('\n');
  const processedLines = lines.map(line => {
    const trimmed = line.trim();

    // Skip if already in math mode
    if (/^\$\$|^(?<!\$)\$(?!\$)/.test(trimmed)) return line;

    // Check if line contains ONLY math tokens (no English words)
    const hasLaTeXCommand = /\\[a-zA-Z]+/.test(trimmed);
    const hasMathSymbols = /[\^_\{\}\(\)=\+\-\*\/\s]/.test(trimmed);

    // Must contain LaTeX commands AND no English words
    if (hasLaTeXCommand && hasMathSymbols && !/[a-zA-Z]{3,}/.test(trimmed.replace(/\\[a-zA-Z]+/g, ''))) {
      return `$$${trimmed}$$`;
    }

    return line;
  });

  return processedLines.join('\n');
};

/**
 * Rule 5: Ensure complex expressions use block math
 */
const ensureBlockMathForComplex = (text: string): string => {
  // Convert inline math with complex expressions to block math
  return text.replace(/(?<!\$)\$(?!\$)([^$\n]+?)(?<!\$)\$(?!\$)/g, (_match, content) => {
    // Check if it's complex (multi-line, contains =, \frac, \sum, \int, \lim)
    const isComplex = /\n|[\=\+\-\*\/]=|\\frac|\\sum|\\prod|\\int|\\lim|\\partial|\\nabla/.test(content) ||
                     content.length > 50;

    if (isComplex) {
      return `$$${content}$$`;
    }

    return `$${content}$`;
  });
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  if (!content || content.trim() === '') {
    return <p className="markdown-empty">No content available</p>;
  }

  // Preprocess content to convert square-bracket math to LaTeX format
  const processedContent = preprocessMathExpressions(content);


  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Custom styling for code blocks
          code: ({ node, inline, className, children, ...props }: any) => {
            const match: RegExpExecArray | null = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre className="markdown-code-block">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="markdown-inline-code" {...props}>
                {children}
              </code>
            );
          },
          // Custom styling for headings
          h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
          h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
          h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
          // Custom styling for paragraphs
          p: ({ children }) => <p className="markdown-p">{children}</p>,
          // Custom styling for lists
          ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
          ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
          li: ({ children }) => <li className="markdown-li">{children}</li>,
          // Custom styling for blockquotes
          blockquote: ({ children }) => (
            <blockquote className="markdown-blockquote">{children}</blockquote>
          ),
          // Custom styling for links
          a: ({ href, children }) => (
            <a href={href} className="markdown-link" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          // Custom styling for tables
          table: ({ children }) => (
            <div className="markdown-table-wrapper">
              <table className="markdown-table">{children}</table>
            </div>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

