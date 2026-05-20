"use client"

import Link from "next/link"
import SectionCard from "@/components/ui/SectionCard"
import StarRating from "@/components/ui/StarRating"
import { COLORS } from "@/components/ui/designTokens"
import type { MyReview } from "@/hooks/useMyPageData"

type MyReviewListProps = {
  reviews: MyReview[]
}

function formatDate(value: string | null) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <SectionCard
      style={{
        padding: "32px",
        color: COLORS.muted,
        fontSize: "16px",
        lineHeight: 1.8,
      }}
    >
      {children}
    </SectionCard>
  )
}

export default function MyReviewList({ reviews }: MyReviewListProps) {
  return (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: COLORS.navy,
              fontSize: "32px",
              fontWeight: 900,
            }}
          >
            自分が書いたレビュー
          </h2>

          <p
            style={{
              margin: "8px 0 0",
              color: COLORS.slate,
              fontSize: "15px",
              fontWeight: 700,
            }}
          >
            他の問題に残した評価とコメント
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState>まだレビューを書いていません。気になる問題にレビューを残してみましょう。</EmptyState>
      ) : (
        <div style={{ display: "grid", gap: "18px" }}>
          {reviews.map((review) => (
            <SectionCard
              key={review.id}
              style={{
                padding: "24px 26px",
                borderRadius: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <Link
                    href={`/problems/${review.problem_id}`}
                    style={{ color: COLORS.navy, textDecoration: "none" }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        color: COLORS.navy,
                        fontSize: "20px",
                        lineHeight: 1.45,
                        fontWeight: 900,
                      }}
                    >
                      {review.problem_title}
                    </h3>
                  </Link>

                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <StarRating value={review.rating} size={18} />
                    <span style={{ color: COLORS.navy, fontSize: "17px", fontWeight: 900 }}>
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <p
                  style={{
                    margin: 0,
                    color: COLORS.muted,
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  {formatDate(review.created_at)}
                </p>
              </div>

              {review.comment ? (
                <p
                  style={{
                    margin: "18px 0 0",
                    color: COLORS.text,
                    fontSize: "16px",
                    lineHeight: 1.8,
                  }}
                >
                  {review.comment}
                </p>
              ) : (
                <p
                  style={{
                    margin: "18px 0 0",
                    color: COLORS.muted,
                    fontSize: "15px",
                    lineHeight: 1.8,
                  }}
                >
                  コメントなし
                </p>
              )}
            </SectionCard>
          ))}
        </div>
      )}
    </section>
  )
}
