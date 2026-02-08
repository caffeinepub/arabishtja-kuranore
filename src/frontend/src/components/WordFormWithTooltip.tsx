import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface WordFormWithTooltipProps {
  form: string;
  meaning?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
}

export default function WordFormWithTooltip({
  form,
  meaning,
  variant = 'secondary',
  className = '',
}: WordFormWithTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        badgeRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !badgeRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTooltip]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (meaning) {
      setShowTooltip(!showTooltip);
    }
  };

  return (
    <div className="relative inline-block">
      {showTooltip && meaning && (
        <div
          ref={tooltipRef}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg border border-border z-50 whitespace-nowrap"
        >
          {meaning}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-popover" />
        </div>
      )}
      <div ref={badgeRef}>
        <Badge
          variant={variant}
          className={`${className} ${meaning ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          onClick={handleClick}
        >
          {form}
        </Badge>
      </div>
    </div>
  );
}
