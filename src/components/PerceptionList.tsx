import type { Perception } from "@/lib/types";

interface PerceptionListProps {
  perceptions: Perception[];
}

export function PerceptionList({ perceptions }: PerceptionListProps) {
  if (perceptions.length === 0) {
    return (
      <p className="t-p3" style={{ color: "#4A0B0B" }}>
        No perceptions yet. Be the first to share what you see.
      </p>
    );
  }

  return (
    <div>
      <p
        className="t-caption mb-5"
        style={{ color: "#4A0B0B", letterSpacing: "0.1em" }}
      >
        OTHERS SAW
      </p>
      <div className="flex flex-col gap-4">
        {perceptions.map((p) => (
          <p
            key={p.id}
            className="t-p2"
            style={{ color: "#4A0B0B", opacity: 0.8 }}
          >
            &ldquo;{p.content}&rdquo;
          </p>
        ))}
      </div>
    </div>
  );
}
