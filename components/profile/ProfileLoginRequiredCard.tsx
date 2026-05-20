"use client"

import Link from "next/link"
import SectionCard from "@/components/ui/SectionCard"
import { COLORS, RADII } from "@/components/ui/designTokens"

export default function ProfileLoginRequiredCard() {
  return (
    <SectionCard
      style={{
        padding: "38px",
        borderRadius: RADII.xxl,
      }}
    >
      <h1
        style={{
          margin: 0,
          color: COLORS.navy,
          fontSize: "36px",
          lineHeight: 1.35,
          fontWeight: 900,
          letterSpacing: "-0.03em",
        }}
      >
        プロフィール設定
      </h1>

      <p
        style={{
          margin: "18px 0 0",
          color: COLORS.slate,
          fontSize: "17px",
          lineHeight: 1.8,
          fontWeight: 600,
        }}
      >
        プロフィールを編集するにはログインが必要です。ログインすると、ユーザー名・アバター・活動レベルを確認できます。
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
        ログイン / 新規登録へ
      </Link>
    </SectionCard>
  )
}
