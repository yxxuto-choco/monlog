"use client"

import Breadcrumbs from "@/components/navigation/Breadcrumbs"
import { COLORS } from "@/components/ui/designTokens"

export default function NewProblemHeader() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "問ログ", href: "/" },
          { label: "問題投稿" },
        ]}
      />

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
            fontSize: "44px",
            lineHeight: 1.15,
            fontWeight: 900,
            letterSpacing: "-0.04em",
          }}
        >
          問題を投稿する
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
          問題文、タグ、画像、LaTeX数式をまとめて登録できます。
        </p>
      </header>
    </>
  )
}
