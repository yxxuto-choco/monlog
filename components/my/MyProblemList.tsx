"use client"

import Link from "next/link"
import CommentIcon from "@/components/icons/CommentIcon"
import SectionCard from "@/components/ui/SectionCard"
import StarRating from "@/components/ui/StarRating"
import { COLORS, RADII } from "@/components/ui/designTokens"
import type { MyProblem } from "@/hooks/useMyPageData"

type MyProblemListProps = {
  problems: MyProblem[]
}

function PenIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function formatDate(value: string | null) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

function truncateText(text: string | null, length: number) {
  if (!text) return ""
  return text.length > length ? `${text.slice(0, length)}...` : text
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

export default function MyProblemList({ problems }: MyProblemListProps) {
  return (
    <section style={{ marginBottom: "42px" }}>
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
            自分の投稿
          </h2>

          <p
            style={{
              margin: "8px 0 0",
              color: COLORS.slate,
              fontSize: "15px",
              fontWeight: 700,
            }}
          >
            投稿した問題の評価とレビュー状況
          </p>
        </div>

        <Link
          href="/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            minHeight: "48px",
            padding: "0 18px",
            borderRadius: RADII.md,
            backgroundColor: COLORS.teal,
            color: "#FFFFFF",
            textDecoration: "none",
            fontSize: "15px",
            fontWeight: 900,
          }}
        >
          <PenIcon size={18} />
          問題を投稿する
        </Link>
      </div>

      {problems.length === 0 ? (
        <EmptyState>まだ投稿した問題はありません。まずは1問投稿してみましょう。</EmptyState>
      ) : (
        <div style={{ display: "grid", gap: "22px" }}>
          {problems.map((problem) => {
            const roundedAverage = Math.floor(problem.average * 10) / 10

            return (
              <SectionCard key={problem.id} style={{ padding: "28px 30px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "18px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: "1 1 560px" }}>
                    <Link
                      href={`/problems/${problem.id}`}
                      style={{ color: COLORS.navy, textDecoration: "none" }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          color: COLORS.navy,
                          fontSize: "24px",
                          lineHeight: 1.45,
                          fontWeight: 900,
                        }}
                      >
                        {problem.title}
                      </h3>
                    </Link>

                    <p
                      style={{
                        margin: "12px 0 0",
                        color: COLORS.slate,
                        fontSize: "15px",
                        fontWeight: 700,
                      }}
                    >
                      投稿日: {formatDate(problem.created_at)}
                    </p>

                    {problem.content && (
                      <p
                        style={{
                          margin: "16px 0 0",
                          color: COLORS.text,
                          fontSize: "16px",
                          lineHeight: 1.8,
                        }}
                      >
                        {truncateText(problem.content, 120)}
                      </p>
                    )}
                  </div>

                  <SectionCard
                    variant="teal"
                    style={{
                      minWidth: "180px",
                      padding: "16px",
                      borderRadius: "16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <StarRating value={problem.average} size={18} />
                      <span style={{ color: COLORS.navy, fontSize: "19px", fontWeight: 900 }}>
                        {roundedAverage.toFixed(1)}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: "10px 0 0",
                        color: COLORS.slate,
                        fontSize: "14px",
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                      }}
                    >
                      <CommentIcon size={18} />
                      {problem.reviewCount}件
                    </p>
                  </SectionCard>
                </div>

                {problem.tags.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "20px",
                    }}
                  >
                    {problem.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/?q=${encodeURIComponent(tag)}`}
                        style={{
                          borderRadius: RADII.pill,
                          backgroundColor: COLORS.tagBg,
                          color: COLORS.tagText,
                          padding: "8px 16px",
                          fontSize: "14px",
                          fontWeight: 900,
                          textDecoration: "none",
                        }}
                      >
                        #{tag}
                      </Link>
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
                    minHeight: "54px",
                    marginTop: "22px",
                    borderRadius: RADII.md,
                    backgroundColor: COLORS.navy,
                    color: "#FFFFFF",
                    textDecoration: "none",
                    fontSize: "16px",
                    fontWeight: 900,
                  }}
                >
                  詳細を見る
                </Link>
              </SectionCard>
            )
          })}
        </div>
      )}
    </section>
  )
}
