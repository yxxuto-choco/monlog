"use client"

import UserMiniBadge from "@/components/UserMiniBadge"
import ProblemMarkdown from "@/components/ProblemMarkdown"
import SectionCard from "@/components/ui/SectionCard"
import StarRating from "@/components/ui/StarRating"
import { COLORS } from "@/components/ui/designTokens"

type RepresentativeReview = {
  rating: number
  comment: string
  created_at: string | null
  user_id: string | null
}

type RepresentativeReviewCardProps = {
  review: RepresentativeReview
  commentPreview: string
}

export default function RepresentativeReviewCard({
  review,
  commentPreview,
}: RepresentativeReviewCardProps) {
  return (
    <SectionCard
      variant="yellow"
      style={{
        padding: "22px 24px",
        marginBottom: "24px",
        borderRadius: "16px",
        boxShadow: "none",
      }}
    >
      {review.user_id && (
        <div style={{ marginBottom: "14px" }}>
          <UserMiniBadge userId={review.user_id} size="sm" showEmail={false} />
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          flexWrap: "wrap",
          marginBottom: "12px",
        }}
      >
        <p
          style={{
            margin: 0,
            color: COLORS.teal,
            fontSize: "17px",
            fontWeight: 900,
          }}
        >
          最も評価が高いコメント
        </p>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: COLORS.navy,
            fontSize: "16px",
            fontWeight: 900,
          }}
        >
          <StarRating value={review.rating} size={17} />
          {review.rating.toFixed(1)}
        </span>
      </div>

      <div
        style={{
          margin: 0,
          color: COLORS.text,
          fontSize: "18px",
          lineHeight: 1.8,
        }}
      >
        <ProblemMarkdown content={commentPreview} />
      </div>
    </SectionCard>
  )
}
