# Specification

## Summary
**Goal:** Render the selected section’s stored HTML content as sanitized rich text so users see formatted text instead of literal HTML tags.

**Planned changes:**
- Update only the frontend UI element at XPath `/html[1]/body[1]/div[1]/div[1]/main[1]/div[1]/div[1]/div[2]/div[1]/div[1]/div[2]` to render its string content as sanitized HTML (bold/italic/underline, lists, links).
- Ensure sanitization uses the existing frontend sanitization approach (e.g., `frontend/src/utils/safeHtml.ts`) so scripts/event handlers are not executed.
- Leave all other page sections/elements unchanged.

**User-visible outcome:** The specified section displays HTML-formatted content (e.g., bold text, lists, links) as rich text and no longer shows visible `<b>...</b>`-style tags.
