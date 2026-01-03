// Convert LaTeX commands to Unicode symbols for plain text display

const latexToUnicode: { [key: string]: string } = {
  // Relations
  '\\ge': '≥',
  '\\geq': '≥',
  '\\le': '≤',
  '\\leq': '≤',
  '\\neq': '≠',
  '\\approx': '≈',
  '\\equiv': '≡',
  '\\sim': '∼',
  
  // Set operations
  '\\in': '∈',
  '\\notin': '∉',
  '\\subset': '⊂',
  '\\subseteq': '⊆',
  '\\supset': '⊃',
  '\\supseteq': '⊇',
  '\\cup': '∪',
  '\\cap': '∩',
  '\\emptyset': '∅',
  
  // Math symbols
  '\\mathbb{R}': 'ℝ',
  '\\mathbb{N}': 'ℕ',
  '\\mathbb{Z}': 'ℤ',
  '\\mathbb{Q}': 'ℚ',
  '\\mathbb{C}': 'ℂ',
  '\\mid': '|',
  '\\cdot': '·',
  '\\times': '×',
  '\\div': '÷',
  '\\pm': '±',
  '\\mp': '∓',
  
  // Greek letters (common ones)
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\delta': 'δ',
  '\\epsilon': 'ε',
  '\\theta': 'θ',
  '\\lambda': 'λ',
  '\\mu': 'μ',
  '\\pi': 'π',
  '\\sigma': 'σ',
  '\\phi': 'φ',
  '\\omega': 'ω',
  
  // Operators
  '\\sum': '∑',
  '\\prod': '∏',
  '\\int': '∫',
  // Note: \sqrt is handled separately below to preserve braces
  '\\partial': '∂',
  '\\nabla': '∇',
  
  // Functions
  '\\sin': 'sin',
  '\\cos': 'cos',
  '\\tan': 'tan',
  '\\log': 'log',
  '\\ln': 'ln',
  '\\exp': 'exp',
};

/**
 * Convert LaTeX commands to Unicode symbols for plain text display
 */
export const convertLatexToUnicode = (text: string): string => {
  if (!text) return text;
  
  let converted = text;
  
  // Handle \sqrt{content} FIRST - before other conversions
  // This must be done BEFORE other LaTeX conversions to preserve the structure
  let sqrtIndex = 0;
  while (sqrtIndex < converted.length) {
    const sqrtPos = converted.indexOf('\\sqrt', sqrtIndex);
    if (sqrtPos === -1) break;
    
    // Find the opening brace after \sqrt
    const braceStart = converted.indexOf('{', sqrtPos + 5);
    if (braceStart === -1) {
      // No brace found, handle simple \sqrt without braces
      const afterSqrt = sqrtPos + 5;
      if (afterSqrt < converted.length && /[a-zA-Z0-9]/.test(converted[afterSqrt])) {
        // Simple case: \sqrt x
        const match = converted.substring(afterSqrt).match(/^([a-zA-Z0-9]+)/);
        if (match) {
          const before = converted.substring(0, sqrtPos);
          const after = converted.substring(afterSqrt + match[0].length);
          converted = before + `√${match[0]}` + after;
          sqrtIndex = sqrtPos + match[0].length + 1;
          continue;
        }
      }
      sqrtIndex = sqrtPos + 5;
      continue;
    }
    
    // Find matching closing brace by counting braces
    let braceCount = 1;
    let braceEnd = braceStart + 1;
    while (braceEnd < converted.length && braceCount > 0) {
      if (converted[braceEnd] === '{') braceCount++;
      if (converted[braceEnd] === '}') braceCount--;
      if (braceCount > 0) braceEnd++;
    }
    
    if (braceCount === 0) {
      // Extract content inside braces
      const content = converted.substring(braceStart + 1, braceEnd);
      let processedContent = content;
      
      // Handle superscripts inside sqrt: x^2 → x², x^{10} → x¹⁰
      processedContent = processedContent.replace(/\^{(\d+)}/g, (_m, digits) => {
        const superscripts: { [key: string]: string } = {
          '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
          '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
        };
        return digits.split('').map((d: string) => superscripts[d] || d).join('');
      });
      processedContent = processedContent.replace(/\^(\d)/g, (_m, d: string) => {
        const superscripts: { [key: string]: string } = {
          '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
          '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
        };
        return superscripts[d] || d;
      });
      
      // Replace the entire \sqrt{content} with √(content)
      const before = converted.substring(0, sqrtPos);
      const after = converted.substring(braceEnd + 1);
      converted = before + `√(${processedContent})` + after;
      sqrtIndex = sqrtPos + processedContent.length + 3; // Move past the replacement
    } else {
      sqrtIndex = sqrtPos + 5;
    }
  }
  
  // Convert LaTeX commands to Unicode
  // Sort by length (longest first) to avoid partial matches
  const sortedCommands = Object.keys(latexToUnicode).sort((a, b) => b.length - a.length);
  
  for (const command of sortedCommands) {
    // Match the command as a whole word (not part of another command)
    const regex = new RegExp(`\\\\${command.replace(/\\/g, '')}(?![a-zA-Z])`, 'g');
    converted = converted.replace(regex, latexToUnicode[command]);
  }
  
  // Handle superscripts: x^2 → x², x^{10} → x¹⁰
  converted = converted.replace(/\^{(\d+)}/g, (_match, digits) => {
    const superscripts: { [key: string]: string } = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };
    return digits.split('').map((d: string) => superscripts[d] || d).join('');
  });
  
  converted = converted.replace(/\^(\d)/g, (_match, digit) => {
    const superscripts: { [key: string]: string } = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };
    return superscripts[digit] || digit;
  });
  
  // Handle subscripts: x_1 → x₁
  converted = converted.replace(/_(\d)/g, (_match, digit) => {
    const subscripts: { [key: string]: string } = {
      '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
      '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
    };
    return subscripts[digit] || digit;
  });
  
  // Handle \sqrt{content} → √(content) - properly handle nested braces
  // Use a more robust approach to match balanced braces
  let sqrtIndex2 = 0;
  while (sqrtIndex2 < converted.length) {
    const sqrtPos = converted.indexOf('\\sqrt', sqrtIndex2);
    if (sqrtPos === -1) break;
    
    // Find the opening brace after \sqrt
    const braceStart = converted.indexOf('{', sqrtPos + 5);
    if (braceStart === -1) {
      sqrtIndex2 = sqrtPos + 5;
      continue;
    }
    
    // Find matching closing brace by counting braces
    let braceCount = 1;
    let braceEnd = braceStart + 1;
    while (braceEnd < converted.length && braceCount > 0) {
      if (converted[braceEnd] === '{') braceCount++;
      if (converted[braceEnd] === '}') braceCount--;
      if (braceCount > 0) braceEnd++;
    }
    
    if (braceCount === 0) {
      // Extract content inside braces
      const content = converted.substring(braceStart + 1, braceEnd);
      let processedContent = content;
      
      // Handle superscripts inside sqrt: x^2 → x², x^{10} → x¹⁰
      processedContent = processedContent.replace(/\^{(\d+)}/g, (_m, digits) => {
        const superscripts: { [key: string]: string } = {
          '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
          '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
        };
        return digits.split('').map((d: string) => superscripts[d] || d).join('');
      });
      processedContent = processedContent.replace(/\^(\d)/g, (_m, d: string) => {
        const superscripts: { [key: string]: string } = {
          '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
          '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
        };
        return superscripts[d] || d;
      });
      
      // Replace the entire \sqrt{content} with √(content)
      const before = converted.substring(0, sqrtPos);
      const after = converted.substring(braceEnd + 1);
      converted = before + `√(${processedContent})` + after;
      sqrtIndex = sqrtPos + processedContent.length + 3; // Move past the replacement
    } else {
      sqrtIndex = sqrtPos + 5;
    }
  }
  
  // Handle \sqrt without braces (simple case)
  converted = converted.replace(/\\sqrt([a-zA-Z0-9]+)/g, '√$1');
  
  // Clean up extra spaces
  converted = converted.replace(/\s+/g, ' ').trim();
  
  return converted;
};

