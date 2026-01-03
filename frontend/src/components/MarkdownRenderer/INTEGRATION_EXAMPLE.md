# Integration Example

## Quick Start: Replace Your Current Answer Rendering

### Current Code (ContentView.tsx)

```tsx
// Line ~2115
<div className="answer-content">
  {parseStructuredText(q.answer, q.metadata?.format || 'normal')}
</div>
```

### New Code (Using MarkdownRenderer)

```tsx
// Import at the top
import { MarkdownRenderer } from '../../components/MarkdownRenderer/MarkdownRenderer';

// Replace the answer rendering
<div className="answer-content">
  <MarkdownRenderer content={q.answer} />
</div>
```

## Complete Integration Steps

### 1. Import the Component

Add to `ContentView.tsx` imports:

```tsx
import { MarkdownRenderer } from '../../components/MarkdownRenderer/MarkdownRenderer';
```

### 2. Replace Answer Rendering

Find this code (around line 2115):

```tsx
<div className="qa-widget-answer">
  <div className="answer-content">
    {parseStructuredText(q.answer, q.metadata?.format || 'normal')}
  </div>
</div>
```

Replace with:

```tsx
<div className="qa-widget-answer">
  <div className="answer-content">
    <MarkdownRenderer content={q.answer} />
  </div>
</div>
```

### 3. Test It

Use a test answer like:

```markdown
To solve this problem:

$$\lim_{x \to 0} \frac{\sin(x)}{x} = 1$$

We use L'Hôpital's rule:

1. Differentiate numerator: $\frac{d}{dx}\sin(x) = \cos(x)$
2. Differentiate denominator: $\frac{d}{dx}x = 1$
3. Result: $\lim_{x \to 0} \frac{\cos(x)}{1} = 1$

**Answer**: The limit is $1$.
```

This should render beautifully with:
- ✅ Properly formatted markdown
- ✅ Rendered math expressions
- ✅ Clean, readable layout

## Optional: Keep Both Approaches

If you want to support both formats during migration:

```tsx
<div className="answer-content">
  {q.metadata?.useMarkdownRenderer ? (
    <MarkdownRenderer content={q.answer} />
  ) : (
    parseStructuredText(q.answer, q.metadata?.format || 'normal')
  )}
</div>
```

Then gradually migrate answers to use the new renderer.

## Benefits After Migration

✅ **Automatic LaTeX Rendering**: All math expressions work
✅ **No Manual Parsing**: Standard libraries handle everything
✅ **Future-Proof**: New math expressions work automatically
✅ **Better Quality**: Matches ChatGPT's rendering
✅ **Secure**: Built-in XSS protection
✅ **Maintainable**: Less custom code to maintain

