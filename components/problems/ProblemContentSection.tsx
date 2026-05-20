"use client"

import ProblemMarkdown from "@/components/ProblemMarkdown"
import SectionCard from "@/components/ui/SectionCard"
import { COLORS } from "@/components/ui/designTokens"

type ProblemContentSectionProps = {
  content: string | null
}

export default function ProblemContentSection({ content }: ProblemContentSectionProps) {
  return (
    <SectionCard
      style={{
        padding: "34px 36px",
        marginBottom: "28px",
      }}
    >
      <h2
        style={{
          margin: "0 0 22px",
          color: COLORS.navy,
          fontSize: "28px",
          fontWeight: 900,
        }}
      >
        問題内容
      </h2>

      {content ? (
        <ProblemMarkdown content={content} />
      ) : (
        <p
          style={{
            margin: 0,
            color: COLORS.muted,
            fontSize: "17px",
            lineHeight: 1.8,
          }}
        >
          本文はまだ登録されていません。
        </p>
      )}
    </SectionCard>
  )
}
