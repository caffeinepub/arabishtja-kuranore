import { sanitizeHtml, truncateHtml } from '../utils/safeHtml';

interface LessonContentHtmlProps {
  content: string;
  isExpanded: boolean;
  maxPreviewLength?: number;
  className?: string;
}

export default function LessonContentHtml({
  content,
  isExpanded,
  maxPreviewLength = 200,
  className = '',
}: LessonContentHtmlProps) {
  // Sanitize the HTML content
  const sanitized = sanitizeHtml(content);

  // Determine what to display based on expansion state
  const { truncated, isTruncated } = isExpanded 
    ? { truncated: sanitized, isTruncated: false }
    : truncateHtml(sanitized, maxPreviewLength);

  const displayContent = isTruncated ? truncated + '...' : truncated;

  return (
    <div
      className={`prose prose-sm max-w-none text-muted-foreground text-lg ${className}`}
      dangerouslySetInnerHTML={{ __html: displayContent }}
      style={{
        // Scoped styling for rich text content using Tailwind-compatible inline styles
        // Links
        '--tw-prose-links': 'hsl(var(--primary))',
        // Lists
        '--tw-prose-bullets': 'hsl(var(--primary))',
        // Bold, italic, underline inherit from prose
      } as React.CSSProperties}
    />
  );
}
