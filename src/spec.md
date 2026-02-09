# Specification

## Summary
**Goal:** Replace the lesson content textarea with a basic rich-text editor for creating/editing lessons, and render the saved rich-text formatting correctly in the lesson view.

**Planned changes:**
- Update `frontend/src/pages/NewLessonPage.tsx` to replace the “Përmbajtja” `<Textarea>` with an in-page rich-text editor supporting bold, italic, underline, bulleted list, numbered list, and link insertion, while continuing to bind to the existing `lessonContent` state string.
- Update `frontend/src/pages/EditLessonPage.tsx` similarly, ensuring saving logic and mutation call sites remain unchanged and existing “empty content” validation still blocks saving.
- Update `frontend/src/pages/ViewLessonPage.tsx` to render `lesson.content` as rich text (preserving formatting, lists, and links) and keep the existing expand/collapse behavior working with the rendered content.

**User-visible outcome:** Users can format lesson content with basic rich-text tools when creating or editing lessons, and the lesson view displays that formatting (including lists and links) while retaining the current preview/expand behavior.
