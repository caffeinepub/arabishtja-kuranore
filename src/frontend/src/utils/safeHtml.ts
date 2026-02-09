/**
 * Sanitizes HTML content by removing unsafe tags and attributes
 * while preserving basic formatting (bold, italic, underline, lists, links)
 */
export function sanitizeHtml(html: string): string {
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Remove script tags and their content
  const scripts = temp.querySelectorAll('script');
  scripts.forEach(script => script.remove());

  // Remove event handler attributes
  const allElements = temp.querySelectorAll('*');
  allElements.forEach(el => {
    // Remove all event handler attributes (onclick, onerror, etc.)
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });

    // Clean href attributes to prevent javascript: URLs
    if (el.tagName === 'A') {
      const href = el.getAttribute('href');
      if (href && href.trim().toLowerCase().startsWith('javascript:')) {
        el.removeAttribute('href');
      }
    }
  });

  return temp.innerHTML;
}

/**
 * Truncates HTML content to a specified length while preserving tag structure
 * Returns a safe preview that doesn't break HTML tags
 */
export function truncateHtml(html: string, maxLength: number): { truncated: string; isTruncated: boolean } {
  // Strip HTML tags to get plain text length
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const plainText = temp.textContent || '';

  if (plainText.length <= maxLength) {
    return { truncated: html, isTruncated: false };
  }

  // Find a safe truncation point
  let charCount = 0;
  let truncatedHtml = '';
  const walker = document.createTreeWalker(temp, NodeFilter.SHOW_TEXT);
  
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent || '';
    if (charCount + text.length > maxLength) {
      const remaining = maxLength - charCount;
      truncatedHtml = html.substring(0, html.indexOf(text) + remaining);
      break;
    }
    charCount += text.length;
  }

  // If we couldn't find a good truncation point, just use substring on plain text
  if (!truncatedHtml) {
    return { truncated: plainText.substring(0, maxLength), isTruncated: true };
  }

  // Clean up any broken tags at the end
  const tempTruncated = document.createElement('div');
  tempTruncated.innerHTML = truncatedHtml;
  
  return { truncated: tempTruncated.innerHTML, isTruncated: true };
}
