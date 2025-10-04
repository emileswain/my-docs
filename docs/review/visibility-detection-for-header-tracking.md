# Review: Visibility Detection for Header Tracking

## Current Implementation Analysis

The provided Svelte component uses **IntersectionObserver API** to detect when elements enter/exit the viewport. Here's how it works:

### Key Mechanisms

1. **IntersectionObserver Setup** (lines ~51-62)
   - Threshold: `0` - triggers immediately when any part of the element crosses viewport boundary
   - Callback sets `isVisible` to `true` when `entry.isIntersecting` is true
   - Optional `sticky` mode disconnects observer once element becomes visible

2. **Manual Visibility Check** (lines ~37-50)
   - `checkVisibility()` function checks `getBoundingClientRect()`
   - Sets visible if element is in viewport OR above viewport (`rect.bottom < 0`)
   - Resets animation delay when element becomes invisible

### Limitation for Header Tracking

**The current implementation has a critical issue for header tracking:**

The condition on line ~40:
```typescript
if (isInViewport || isAboveViewport) {
  isVisible.set(true);
```

This keeps elements marked as "visible" even after they scroll above the viewport. This works for sticky animations but won't help identify which header just scrolled out of view.

## Adaptation for Header Tracking Use Case

To track which header scrolls out of view and set it as the current title, you need:

### 1. **Detect "Just Scrolled Out" State**
```typescript
const isAboveViewport = rect.top < 0 && rect.bottom < 0;
const isInViewport = rect.top >= 0 && rect.top < window.innerHeight;
```

### 2. **Track Last Visible Header**
Instead of just `isVisible`, track header state:
- `in-view`: Header is currently visible
- `above`: Header has scrolled above viewport (this is your active title)
- `below`: Header is below viewport

### 3. **IntersectionObserver Configuration**
Use `rootMargin` to detect when header crosses the top:
```typescript
{
  threshold: [0, 1],
  rootMargin: '-1px 0px 0px 0px' // Trigger 1px before top edge
}
```

### 4. **Recommended Approach**
- Attach observers to all header elements
- When a header's `boundingClientRect.top < 0`, it's scrolled past
- The **last header** with `top < 0` becomes your active title
- Use a store to track active header globally

### Key Differences from Animation Use Case
| Animation Component | Header Tracking |
|---|---|
| Binary visible/hidden | Three states: above/in/below |
| Sticky once visible | Continuous tracking |
| Individual element state | Relative to all headers |
| Entry triggers action | Exit (scroll past top) triggers action |

## Implementation Pattern

```typescript
// Pseudo-code for header tracking
const activeHeader = writable(null);

observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const rect = entry.target.getBoundingClientRect();
    if (rect.top < 0) {
      // This header is above viewport - it's a candidate
      activeHeader.set(entry.target.textContent);
    }
  });
}, {
  threshold: 1,
  rootMargin: '-1px 0px 0px 0px'
});
```

The critical insight: you need to track when headers cross the **top boundary** (scrolling up past viewport), not when they enter the viewport.
