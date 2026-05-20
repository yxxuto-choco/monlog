"use client"

import Link from "next/link"
import { COLORS } from "@/components/ui/designTokens"

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

export default function MyPageHeader() {
  return (
    <>
      <nav
        style={{
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
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
          }}
        >
          <BackIcon />
          トップへ戻る
        </Link>

        <div
          style={{
            color: COLORS.slate,
            fontSize: "15px",
            fontWeight: 700,
          }}
        >
          問ログ / マイページ
        </div>
      </nav>

      <header
        style={{
          textAlign: "center",
          marginBottom: "34px",
        }}
      >
        <h1
          style={{
            margin: 0,
            color: COLORS.navy,
            fontSize: "48px",
            lineHeight: 1.15,
            fontWeight: 900,
            letterSpacing: "-0.04em",
          }}
        >
          マイページ
        </h1>

        <p
          style={{
            margin: "18px 0 0",
            color: COLORS.slate,
            fontSize: "18px",
            lineHeight: 1.8,
            fontWeight: 600,
          }}
        >
          自分の投稿・レビュー・活動の蓄積を確認する。
        </p>
      </header>
    </>
  )
}
