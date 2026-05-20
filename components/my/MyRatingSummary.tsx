"use client"

import SectionCard from "@/components/ui/SectionCard"
import StarRating from "@/components/ui/StarRating"
import { COLORS, RADII } from "@/components/ui/designTokens"

type MyRatingSummaryProps = {
  simpleAverage: number
  weightedAverage: number
  roundedSimpleAverage: number
  roundedWeightedAverage: number
}

export default function MyRatingSummary({
  simpleAverage,
  weightedAverage,
  roundedSimpleAverage,
  roundedWeightedAverage,
}: MyRatingSummaryProps) {
  return (
    <SectionCard
      style={{
        padding: "28px 30px",
        marginBottom: "36px",
      }}
    >
      <h2
        style={{
          margin: 0,
          color: COLORS.navy,
          fontSize: "28px",
          fontWeight: 900,
        }}
      >
        評価サマリー
      </h2>

      <div
        style={{
          marginTop: "22px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        <SectionCard
          variant="yellow"
          style={{
            padding: "22px",
            borderRadius: RADII.lg,
            boxShadow: "none",
          }}
        >
          <p
            style={{
              margin: 0,
              color: COLORS.slate,
              fontSize: "14px",
              fontWeight: 900,
            }}
          >
            単純平均評価
          </p>

          <div
            style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <StarRating value={simpleAverage} size={20} />
            <span style={{ color: COLORS.navy, fontSize: "24px", fontWeight: 900 }}>
              {roundedSimpleAverage.toFixed(1)}
            </span>
          </div>

          <p
            style={{
              margin: "12px 0 0",
              color: COLORS.muted,
              fontSize: "13px",
              lineHeight: 1.7,
              fontWeight: 700,
            }}
          >
            各投稿問題の平均評価を、投稿数で割った値。
          </p>
        </SectionCard>

        <SectionCard
          variant="teal"
          style={{
            padding: "22px",
            borderRadius: RADII.lg,
          }}
        >
          <p
            style={{
              margin: 0,
              color: COLORS.slate,
              fontSize: "14px",
              fontWeight: 900,
            }}
          >
            加重平均評価
          </p>

          <div
            style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <StarRating value={weightedAverage} size={20} />
            <span style={{ color: COLORS.navy, fontSize: "24px", fontWeight: 900 }}>
              {roundedWeightedAverage.toFixed(1)}
            </span>
          </div>

          <p
            style={{
              margin: "12px 0 0",
              color: COLORS.muted,
              fontSize: "13px",
              lineHeight: 1.7,
              fontWeight: 700,
            }}
          >
            すべてのレビュー評価をまとめて計算した値。
          </p>
        </SectionCard>
      </div>
    </SectionCard>
  )
}
