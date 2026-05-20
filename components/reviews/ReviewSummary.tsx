"use client"

import StarRating from "@/components/ui/StarRating"
import { COLORS } from "@/components/ui/designTokens"

type ReviewSummaryProps = {
  rating: number
  size?: number
}

export default function ReviewSummary({ rating, size = 20 }: ReviewSummaryProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <StarRating value={rating} size={size} />
      <span
        style={{
          color: COLORS.navy,
          fontSize: "20px",
          fontWeight: 900,
        }}
      >
        {rating.toFixed(1)}
      </span>
    </div>
  )
}
