import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * Tailwind-merge only knows the default Tailwind scale, so the FinTrack
 * typography tokens below have to be registered explicitly. Without this,
 * `cn("text-sm", "text-body")` would keep both declarations and
 * `cn("text-small", "text-ink-muted")` would silently drop the font size.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["body-lg", "body", "small", "h-1", "h-1-sm", "h-1-snug", "h-2", "h-2-sm", "h-3", "h-4"],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
