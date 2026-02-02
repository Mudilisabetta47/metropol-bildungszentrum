import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface CapacityBadgeProps {
  current: number;
  max: number;
  showIcon?: boolean;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CapacityBadge({
  current,
  max,
  showIcon = true,
  showPercentage = false,
  size = "md",
  className,
}: CapacityBadgeProps) {
  const available = Math.max(0, max - current);
  const percentage = max > 0 ? Math.round((current / max) * 100) : 0;
  const isFull = current >= max;
  const isAlmostFull = percentage >= 80 && !isFull;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        sizeClasses[size],
        isFull
          ? "bg-red-100 text-red-800"
          : isAlmostFull
          ? "bg-yellow-100 text-yellow-800"
          : "bg-green-100 text-green-800",
        className
      )}
    >
      {showIcon && <Users className={iconSizes[size]} />}
      {isFull ? (
        "Ausgebucht"
      ) : showPercentage ? (
        `${percentage}% belegt`
      ) : (
        <>
          {available} von {max} frei
        </>
      )}
    </span>
  );
}

interface CapacityBarProps {
  current: number;
  max: number;
  showLabel?: boolean;
  className?: string;
}

export function CapacityBar({
  current,
  max,
  showLabel = true,
  className,
}: CapacityBarProps) {
  const percentage = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  const isFull = current >= max;
  const isAlmostFull = percentage >= 80 && !isFull;

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Auslastung</span>
          <span className="font-medium">
            {current} / {max} Plätze
          </span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isFull
              ? "bg-red-500"
              : isAlmostFull
              ? "bg-yellow-500"
              : "bg-green-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
