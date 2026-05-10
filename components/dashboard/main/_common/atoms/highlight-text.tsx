import { cn } from "@/lib/utils";

type HighlightTextProps = {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
};

/**
 * Renders `text` with any substring matching `query` wrapped in a highlighted span.
 * The match is case-insensitive.
 */
function HighlightText({
  text,
  query,
  className,
  highlightClassName,
}: HighlightTextProps) {
  if (!query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className={cn(
              "bg-primary text-black font-semibold",
              highlightClassName,
            )}
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </span>
  );
}

export default HighlightText;
