"use client"

import SectionCard from "@/components/ui/SectionCard"
import { COLORS } from "@/components/ui/designTokens"

function SparkleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M19 14l.8 2.6L22 17.5l-2.2.9L19 21l-.8-2.6-2.2-.9 2.2-.9L19 14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M5 13l.6 1.8L7.5 15.5l-1.9.7L5 18l-.6-1.8-1.9-.7 1.9-.7L5 13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export default function AvatarEvolutionPanel() {
  return (
    <SectionCard variant="teal" style={{ borderLeft: `6px solid ${COLORS.teal}`, borderRadius: "22px", padding: "28px 32px" }}>
      <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px", color: COLORS.navy, fontSize: "24px", fontWeight: 900 }}>
        <SparkleIcon />
        アバター進化機能について
      </h2>

      <p style={{ margin: "14px 0 0", color: COLORS.slate, fontSize: "16px", lineHeight: 1.8, fontWeight: 600 }}>
        現在のドット絵アバターは、ユーザーIDから自動生成されています。将来的には、投稿数・レビュー数・コメント内容・タグ傾向に応じて、装備や色が変化する進化システムを追加予定です。
      </p>
    </SectionCard>
  )
}
