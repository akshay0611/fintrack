import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-brand"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="5"
            fill="white"
            opacity="0.92"
          />
        </svg>
      </span>
      <span className="text-[22px] font-extrabold tracking-logo text-ink">
        FinTrack
      </span>
    </span>
  );
}
