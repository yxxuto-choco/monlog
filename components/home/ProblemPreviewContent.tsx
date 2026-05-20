"use client"

import ProblemMarkdown from "@/components/ProblemMarkdown"
import { COLORS } from "@/components/ui/designTokens"

type ProblemPreviewContentProps = {
  content: string | null
  maxLength?: number
}

function truncateMarkdownPreview(text: string, length: number) {
  const normalized = text.trim()

  if (normalized.length <= length) return normalized

  const imageMatch = normalized.match(/!\[[^\]]*\]\([^)]*\)/)

  if (imageMatch?.index !== undefined && imageMatch.index < length) {
    const beforeImage = normalized.slice(0, imageMatch.index).trimEnd()
    return beforeImage ? `${beforeImage}\n\n...` : "..."
  }

  let preview = normalized.slice(0, length)

  const unfinishedImageStart = preview.lastIndexOf("![")
  if (unfinishedImageStart !== -1) {
    preview = preview.slice(0, unfinishedImageStart).trimEnd()
  }

  const dollarCount = (preview.match(/\$/g) ?? []).length
  const lastDollar = preview.lastIndexOf("$")

  if (dollarCount % 2 === 1 && lastDollar !== -1) {
    preview = preview.slice(0, lastDollar).trimEnd()
  }

  return preview ? `${preview}...` : "..."
}

export default function ProblemPreviewContent({
  content,
  maxLength = 260,
}: ProblemPreviewContentProps) {
  return (
    <section style={{ marginBottom: "28px" }}>
      <h4
        style={{
          margin: "0 0 16px",
          color: COLORS.navy,
          fontSize: "21px",
          fontWeight: 900,
        }}
      >
        問題内容
      </h4>

      {content ? (
        <div
          style={{
            color: COLORS.text,
            fontSize: "20px",
            lineHeight: 1.9,
          }}
        >
          <ProblemMarkdown content={truncateMarkdownPreview(content, maxLength)} />
        </div>
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
    </section>
  )
}
