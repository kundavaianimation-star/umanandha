interface SectionNumberProps {
  number: number;
  className?: string;
}

export function SectionNumber({ number, className = "" }: SectionNumberProps) {
  const formatted = String(number).padStart(2, "0");

  return (
    <span className={`section-number ${className}`}>
      {formatted}
    </span>
  );
}
