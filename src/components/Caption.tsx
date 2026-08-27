import { formatDate } from "@/lib/utils";

interface CaptionProps {
  location?: string;
  date?: string;
  className?: string;
}

export function Caption({ location, date, className = "" }: CaptionProps) {
  const formattedDate = date ? formatDate(date) : null;

  return (
    <div className={`flex items-center gap-3 flex-wrap ${className}`}>
      {location && (
        <span className="t-caption" style={{ color: "#4A0B0B" }}>
          {location}
        </span>
      )}
      {location && formattedDate && (
        <span className="t-caption" style={{ color: "#4A0B0B", opacity: 0.4 }}>
          ·
        </span>
      )}
      {formattedDate && (
        <span className="t-caption" style={{ color: "#4A0B0B" }}>
          {formattedDate}
        </span>
      )}
    </div>
  );
}
