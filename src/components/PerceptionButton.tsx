"use client";

interface PerceptionButtonProps {
  count: number;
  onClick: () => void;
}

export function PerceptionButton({ count, onClick }: PerceptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="perception-btn"
    >
      PERCEPTIONS
      <span className="perception-btn-count">({count})</span>
    </button>
  );
}
