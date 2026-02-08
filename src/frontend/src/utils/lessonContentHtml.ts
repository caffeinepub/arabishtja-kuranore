/**
 * Utility to safely render lesson content as HTML.
 * Detects if content is HTML or plain text and renders accordingly.
 * No sanitization is applied as per user requirements.
 */

export function isLikelyHtml(content: string): boolean {
  // Check if content contains HTML tags
  const htmlTagPattern = /<[^>]+>/;
  return htmlTagPattern.test(content);
}

export function renderLessonContent(content: string): string {
  if (!content) return '';
  
  // If content appears to be HTML, return as-is
  if (isLikelyHtml(content)) {
    return content;
  }
  
  // Otherwise, escape HTML characters and convert newlines to <br/>
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  // Convert newlines to <br/>
  return escaped.replace(/\n/g, '<br/>');
}
