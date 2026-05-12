/*app/components/ui/StarRating.tsx*/
"use client"

import { COLORS } from "@/components/ui/designTokens"

type StarRatingProps = {
  value: number
  size?: number
  label?: string
}

export default function StarRating({
  value,
  size = 20,
  label,
}: StarRatingProps) {
  return (
    <span
      aria-label={label ?? `評価 ${value.toFixed(1)}`}
      style={{
        display: "inline-flex",
        gap: "2px",
        verticalAlign: "middle",
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercent = Math.max(0, Math.min(100, (value - (star - 1)) * 100))

        return (
          <span
            key={star}
            style={{
              position: "relative",
              display: "inline-block",
              width: `${size}px`,
              height: `${size}px`,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width={size}
              height={size}
              style={{ color: COLORS.starEmpty }}
            >
              <path
                fill="currentColor"
                d="M12 2.5l2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.6l-5.8 3.1 1.1-6.6-4.8-4.7 6.6-.9L12 2.5z"
              />
            </svg>

            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${fillPercent}%`,
                height: `${size}px`,
                overflow: "hidden",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width={size}
                height={size}
                style={{ color: COLORS.star }}
              >
                <path
                  fill="currentColor"
                  d="M12 2.5l2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.6l-5.8 3.1 1.1-6.6-4.8-4.7 6.6-.9L12 2.5z"
                />
              </svg>
            </span>
          </span>
        )
      })}
    </span>
  )
}
