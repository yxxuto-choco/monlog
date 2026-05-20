"use client"

import SectionCard from "@/components/ui/SectionCard"
import { COLORS } from "@/components/ui/designTokens"

type MyStatsGridProps = {
  postCount: number
  totalReviewCount: number
  writtenReviewCount: number
  roundedWeightedAverage: number
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <SectionCard style={{ padding: "22px 24px" }}>
      <p
        style={{
          margin: 0,
          color: COLORS.slate,
          fontSize: "14px",
          fontWeight: 900,
        }}
      >
        {label}
      </p>

      <div
        style={{
          marginTop: "10px",
          color: COLORS.navy,
          fontSize: "34px",
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: "-0.03em",
        }}
      >
        {value}
      </div>

      {sub && (
        <p
          style={{
            margin: "10px 0 0",
            color: COLORS.muted,
            fontSize: "13px",
            fontWeight: 700,
            lineHeight: 1.6,
          }}
        >
          {sub}
        </p>
      )}
    </SectionCard>
  )
}

export default function MyStatsGrid({
  postCount,
  totalReviewCount,
  writtenReviewCount,
  roundedWeightedAverage,
}: MyStatsGridProps) {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "18px",
        marginBottom: "34px",
      }}
    >
      <StatCard label="投稿問題数" value={postCount} sub="あなたが投稿した問題数" />
      <StatCard label="受け取ったレビュー数" value={totalReviewCount} sub="自分の投稿に付いたレビュー" />
      <StatCard label="自分が書いたレビュー" value={writtenReviewCount} sub="他の問題へのレビュー数" />
      <StatCard
        label="加重平均評価"
        value={roundedWeightedAverage.toFixed(1)}
        sub="全レビューをまとめた平均"
      />
    </section>
  )
}
