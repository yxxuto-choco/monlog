"use client"

import Link from "next/link"
import SectionCard from "@/components/ui/SectionCard"
import { COLORS, RADII } from "@/components/ui/designTokens"

function BackIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function LoginRequiredCard() {
  return (
    <>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: COLORS.teal,
          fontSize: "17px",
          fontWeight: 900,
          textDecoration: "none",
          marginBottom: "28px",
        }}
      >
        <BackIcon />
        トップへ戻る
      </Link>

      <SectionCard style={{ padding: "36px" }}>
        <h1
          style={{
            margin: 0,
            color: COLORS.navy,
            fontSize: "36px",
            fontWeight: 900,
          }}
        >
          マイページを見るにはログインが必要です
        </h1>

        <p
          style={{
            margin: "16px 0 0",
            color: COLORS.slate,
            fontSize: "17px",
            lineHeight: 1.8,
            fontWeight: 600,
          }}
        >
          ログインすると、自分の投稿・レビュー・活動スコアを確認できます。
        </p>

        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "56px",
            padding: "0 24px",
            marginTop: "28px",
            borderRadius: RADII.md,
            backgroundColor: COLORS.navy,
            color: "#FFFFFF",
            textDecoration: "none",
            fontSize: "17px",
            fontWeight: 900,
          }}
        >
          ログイン / 新規登録
        </Link>
      </SectionCard>
    </>
  )
}
