import { cn } from "@/lib/utils";

interface SentimentBadgeProps {
  sentiment: "positive" | "negative" | "neutral";
  confidence?: number;
  className?: string;
}

export function SentimentBadge({ sentiment, confidence, className }: SentimentBadgeProps) {
  const baseClasses = "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full";
  
  const variants = {
    positive: "bg-positive/10 text-positive border border-positive/20",
    negative: "bg-destructive/10 text-destructive border border-destructive/20",
    neutral: "bg-muted text-muted-foreground border border-border",
  };

  const labels = {
    positive: "Positive",
    negative: "Negative",
    neutral: "Neutral",
  };

  return (
    <span className={cn(baseClasses, variants[sentiment], className)}>
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        sentiment === "positive" && "bg-positive",
        sentiment === "negative" && "bg-destructive",
        sentiment === "neutral" && "bg-muted-foreground"
      )} />
      {labels[sentiment]}
      {confidence !== undefined && (
        <span className="text-[10px] opacity-70">
          ({Math.round(confidence * 100)}%)
        </span>
      )}
    </span>
  );
}
