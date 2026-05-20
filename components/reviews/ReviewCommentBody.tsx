"use client"

import ProblemMarkdown from "@/components/ProblemMarkdown"
import { COLORS } from "@/components/ui/designTokens"

type ReviewCommentBodyProps = {
  comment: string | null
}

export default function ReviewCommentBody({ comment }: ReviewCommentBodyProps) {
  if (comment) {
    return (
      <div
        style={{
          marginTop: "18px",
          color: COLORS.text,
          fontSize: "17px",
          lineHeight: 1.8,
        }}
      >
        <ProblemMarkdown content={comment} />
      </div>
    )
  }

  return (
    <p
      style={{
        margin: "18px 0 0",
        color: COLORS.muted,
        fontSize: "15px",
        lineHeight: 1.8,
      }}
    >
      コメントなし
    </p>
  )
}
