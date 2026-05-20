"use client"

import Link from "next/link"
import { COLORS, RADII } from "@/components/ui/designTokens"

export default function HomeHero() {
  return (
    <header
      style={{
        textAlign: "center",
        marginBottom: "46px",
      }}
    >
      <h1
        style={{
          margin: 0,
          color: COLORS.navy,
          fontSize: "56px",
          lineHeight: 1.1,
          fontWeight: 900,
          letterSpacing: "-0.05em",
        }}
      >
        問ログ
      </h1>

      <p
        style={{
          margin: "18px 0 0",
          color: COLORS.slate,
          fontSize: "20px",
          lineHeight: 1.7,
          fontWeight: 600,
        }}
      >
        学問の問題を投稿・レビューするプラットフォーム
      </p>

      <Link
        href="/new"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70px",
          padding: "0 38px",
          marginTop: "26px",
          borderRadius: RADII.md,
          backgroundColor: COLORS.teal,
          color: "#FFFFFF",
          fontSize: "24px",
          fontWeight: 900,
          textDecoration: "none",
          boxShadow: "0 4px 14px rgba(42, 157, 143, 0.22)",
        }}
      >
        問題を投稿する
      </Link>
    </header>
  )
}
