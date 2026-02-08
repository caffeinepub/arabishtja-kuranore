# Specification

## Summary
**Goal:** Add rich-text (HTML) editing and accordion-style HTML rendering for lesson content (“Përmbajtja” / `lesson.content`) on the Dërrasa (Whiteboard) page, and use the same editor in teacher lesson create/edit forms.

**Planned changes:**
- Render `lesson.content` as HTML (supporting formatting like bold/italic/lists) in the existing Whiteboard lesson header/top panel, inside an accordion-style expand/collapse section.
- Add an inline rich-text HTML editor for teachers/admins within the Whiteboard content accordion, with save via the existing lesson update flow and a refresh of the active lesson data after save.
- Ensure students/non-teachers can view the rendered HTML content but cannot edit it.
- Update the New Lesson and Edit Lesson teacher forms to use the same rich-text editor for `lesson.content`, storing the resulting HTML string via existing create/update flows.
- Handle plain-text existing lessons so they continue to display correctly, while allowing lessons containing HTML to render formatted output as-is (no sanitization/stripping).

**User-visible outcome:** On the Whiteboard page, lesson “Përmbajtja” appears in an expandable accordion and displays formatted HTML; teachers can edit it inline with a rich-text toolbar and save changes, and teachers can also author the same formatted content from the New Lesson and Edit Lesson pages.
