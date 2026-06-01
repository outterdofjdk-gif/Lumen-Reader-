import { cn } from "@/lib/utils";

export function Shimmer({ className }: { className?: string }) {
  return <div className={cn("shimmer-skeleton rounded-lg", className)} />;
}
