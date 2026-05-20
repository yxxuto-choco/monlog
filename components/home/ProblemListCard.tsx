"use client"

import Link from "next/link"
import UserMiniBadge from "@/components/UserMiniBadge"
import SectionCard from "@/components/ui/SectionCard"
import StarRating from "@/components/ui/StarRating"
import CommentIcon from "@/components/icons/CommentIcon"
import ProblemPreviewContent from "@/components/home/ProblemPreviewContent"
import RepresentativeReviewCard from "@/components/home/RepresentativeReviewCard"
import { COLORS, RADII, SHADOWS } from "@/components/ui/designTokens"

type ProblemListProblem = {
  id: string
  title: string
  content: string | null
  tags: string[]
  created_at: string
  user_id: string | null
}

type RepresentativeReview = {
  rating: number
  comment: string
  created_at: string | null
  user_id: string | null
}

type ProblemListCardProps = {
  problem: ProblemListProblem
  average: number
  roundedAverage: number
  reviewCount: number
  representativeReview: RepresentativeReview | null
  opened: boolean
  createdAtLabel: string
  representativeCommentPreview: string | null
  onToggle: () => void
  onTagClick: (tag: string) => void
}

function ChevronIcon({ opened }: { opened: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={opened ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ProblemListCard({
  problem,
  average,
  roundedAverage,
  reviewCount,
  representativeReview,
  opened,
  createdAtLabel,
  representativeCommentPreview,
  onToggle,
  onTagClick,
}: ProblemListCardProps) {
  return (
    <article
      style={{
        backgroundColor: COLORS.surface,
        border: `1px solid ${opened ? "rgba(42, 157, 143, 0.48)" : COLORS.cardLine}`,
        borderRadius: RADII.xl,
        boxShadow: SHADOWS.cardStrong,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={opened}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          padding: opened ? "30px 36px" : "34px 36px",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "22px",
          }}
        >
          <div style={{ minWidth: 0, flex: "1 1 auto" }}>
            {problem.user_id && (
              <div style={{ marginBottom: "18px" }}>
                <UserMiniBadge userId={problem.user_id} size="sm" showEmail={false} />
              </div>
            )}

            <h3
              style={{
                margin: 0,
                color: COLORS.navy,
                fontSize: "26px",
                lineHeight: 1.45,
                fontWeight: 900,
              }}
            >
              {problem.title}
            </h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap",
                marginTop: "20px",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: COLORS.navy,
                  fontSize: "20px",
                  fontWeight: 900,
                }}
              >
                <StarRating value={average} />
                {roundedAverage.toFixed(1)}
              </span>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  color: COLORS.slate,
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                <CommentIcon size={22} />
                {reviewCount}件
              </span>
            </div>
          </div>

          <span
            style={{
              color: COLORS.slate,
              marginTop: "8px",
              flex: "0 0 auto",
            }}
          >
            <ChevronIcon opened={opened} />
          </span>
        </div>

        {!opened && problem.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "22px",
            }}
          >
            {problem.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  borderRadius: RADII.pill,
                  backgroundColor: COLORS.tagBg,
                  color: COLORS.tagText,
                  padding: "8px 18px",
                  fontSize: "18px",
                  fontWeight: 900,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </button>

      {opened && (
        <div
          style={{
            borderTop: `1px solid ${COLORS.line}`,
            padding: "28px 36px 36px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
              color: COLORS.slate,
              fontSize: "17px",
              fontWeight: 700,
              marginBottom: "24px",
            }}
          >
            <span>投稿日: {createdAtLabel}</span>
          </div>

          <ProblemPreviewContent content={problem.content} />

          {representativeReview && representativeCommentPreview && (
            <RepresentativeReviewCard
              review={representativeReview}
              commentPreview={representativeCommentPreview}
            />
          )}

          {problem.tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "26px",
              }}
            >
              {problem.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagClick(tag)}
                  style={{
                    border: "none",
                    borderRadius: RADII.pill,
                    backgroundColor: COLORS.tagBg,
                    color: COLORS.tagText,
                    padding: "9px 18px",
                    fontSize: "18px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          <Link
            href={`/problems/${problem.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              minHeight: "72px",
              borderRadius: RADII.md,
              backgroundColor: COLORS.navy,
              color: "#FFFFFF",
              textDecoration: "none",
              fontSize: "24px",
              fontWeight: 900,
            }}
          >
            詳細を見る
          </Link>
        </div>
      )}
    </article>
  )
}
