"use client"

import SectionCard from "@/components/ui/SectionCard"
import { COLORS, RADII, SHADOWS } from "@/components/ui/designTokens"

function SparkleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l1.4 5.2L18 10l-4.6 2.8L12 18l-1.4-5.2L6 10l4.6-2.8L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M5 14l.6 1.9L7.5 16.5l-1.9.6L5 19l-.6-1.9-1.9-.6 1.9-.6L5 14Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FeaturePill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        borderRadius: RADII.pill,
        border: `1px solid ${COLORS.tealLine}`,
        backgroundColor: "rgba(255,255,255,0.75)",
        color: COLORS.navy,
        padding: "8px 12px",
        fontSize: "13px",
        fontWeight: 900,
      }}
    >
      <CheckIcon size={16} />
      {children}
    </span>
  )
}

export default function LoginHeroPanel() {
  return (
    <SectionCard
      variant="teal"
      style={{
        position: "relative",
        overflow: "hidden",
        borderLeft: `6px solid ${COLORS.teal}`,
        borderRadius: RADII.xxl,
        boxShadow: SHADOWS.cardStrong,
        padding: "38px",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: "-80px",
          top: "-80px",
          width: "240px",
          height: "240px",
          borderRadius: "50%",
          backgroundColor: "rgba(42, 157, 143, 0.16)",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: "70px",
          bottom: "-70px",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          backgroundColor: "rgba(30, 58, 95, 0.08)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "9px",
            borderRadius: RADII.pill,
            backgroundColor: "rgba(255,255,255,0.8)",
            border: `1px solid ${COLORS.tealLine}`,
            color: COLORS.teal,
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: 900,
            letterSpacing: "0.12em",
            marginBottom: "24px",
          }}
        >
          <SparkleIcon size={18} />
          START MONLOG
        </div>

        <h1
          style={{
            margin: 0,
            color: COLORS.navy,
            fontSize: "48px",
            lineHeight: 1.16,
            fontWeight: 900,
            letterSpacing: "-0.05em",
          }}
        >
          良問を集める。
          <br />
          解法を語る。
          <br />
          学びを残す。
        </h1>

        <p
          style={{
            margin: "22px 0 0",
            color: COLORS.slate,
            fontSize: "17px",
            lineHeight: 1.9,
            fontWeight: 700,
            maxWidth: "580px",
          }}
        >
          問ログは、数学や学問の問題を投稿し、タグで整理し、レビューで良問を見つけるための場所です。
          ログインすると、投稿・レビュー・マイページ・レベル表示が使えるようになります。
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "28px",
          }}
        >
          <FeaturePill>問題を投稿</FeaturePill>
          <FeaturePill>レビューを書く</FeaturePill>
          <FeaturePill>LaTeX対応</FeaturePill>
          <FeaturePill>活動レベル表示</FeaturePill>
        </div>

        <div
          style={{
            marginTop: "36px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "14px",
          }}
        >
          {[
            { label: "STEP 1", text: "ログインまたは新規登録" },
            { label: "STEP 2", text: "気になる問題を投稿・検索" },
            { label: "STEP 3", text: "レビューで良問を育てる" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                borderRadius: RADII.lg,
                border: `1px solid ${COLORS.tealLine}`,
                backgroundColor: "rgba(255,255,255,0.72)",
                padding: "16px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: COLORS.teal,
                  fontSize: "12px",
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                }}
              >
                {item.label}
              </p>

              <p
                style={{
                  margin: "8px 0 0",
                  color: COLORS.navy,
                  fontSize: "15px",
                  fontWeight: 900,
                  lineHeight: 1.6,
                }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  )
}
