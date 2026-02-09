/**
 * Check if rich text content is effectively empty
 * Strips HTML tags and whitespace to determine if there's actual content
 */
export function isRichTextEmpty(html: string): boolean {
  if (!html || html.trim() === '') return true;
  
  // Remove HTML tags and check if there's any text content
  const text = html.replace(/<[^>]*>/g, '').trim();
  
  // Also check for common empty states from Quill
  if (text === '' || html === '<p><br></p>' || html === '<p></p>') {
    return true;
  }
  
  return false;
}

/**
 * Extract plain text from rich HTML content
 * Useful for length checks and previews
 */
export function getPlainTextFromHtml(html: string): string {
  if (!html) return '';
  
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  return temp.textContent || temp.innerText || '';
}

/**
 * Get the length of plain text content from rich HTML
 */
export function getRichTextLength(html: string): number {
  return getPlainTextFromHtml(html).length;
}

/**
 * Sanitize HTML content for safe rendering
 * Basic sanitization - removes script tags and dangerous attributes
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  return sanitized;
}

/**
 * Create a preview of rich text content with a character limit
 * Preserves some formatting while truncating
 */
export function createRichTextPreview(html: string, maxLength: number = 300): string {
  const plainText = getPlainTextFromHtml(html);
  
  if (plainText.length <= maxLength) {
    return html;
  }
  
  // For preview, just return truncated plain text wrapped in paragraph
  const truncated = plainText.substring(0, maxLength) + '...';
  return `<p>${truncated}</p>`;
}
