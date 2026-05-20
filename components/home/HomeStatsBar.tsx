"use client"

import { COLORS } from "@/components/ui/designTokens"

type HomeStatsBarProps = {
  problemCount: number
  reviewCount: number
  visibleCount: number
}

export default function HomeStatsBar({
  problemCount,
  reviewCount,
  visibleCount,
}: HomeStatsBarProps) {
  return (
    <section
      style={{
        display: "flex",
        gap: "34px",
        flexWrap: "wrap",
        marginBottom: "44px",
        padding: "0 24px",
        color: COLORS.slate,
        fontSize: "17px",
        fontWeight: 700,
      }}
    >
      <span>
        投稿問題数:{" "}
        <strong style={{ color: COLORS.navy, marginLeft: "8px" }}>{problemCount}</strong>
      </span>

      <span>
        レビュー数:{" "}
        <strong style={{ color: COLORS.navy, marginLeft: "8px" }}>{reviewCount}</strong>
      </span>

      <span>
        表示件数:{" "}
        <strong style={{ color: COLORS.navy, marginLeft: "8px" }}>{visibleCount}</strong>
      </span>
    </section>
  )
}
