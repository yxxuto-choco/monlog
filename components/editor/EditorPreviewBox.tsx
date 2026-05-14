"use client"

import type { ReactNode } from "react"
import { COLORS } from "@/components/ui/designTokens"

type EditorPreviewBoxProps = {
  children: ReactNode
  minHeight?: string
}

export default function EditorPreviewBox({
  children,
  minHeight = "210px",
}: EditorPreviewBoxProps) {
  return (
    <div
      style={{
        minHeight,
        borderRadius: "16px",
        border: `1px solid ${COLORS.lineStrong}`,
        backgroundColor: COLORS.surface,
        color: COLORS.text,
        fontSize: "17px",
        lineHeight: 1.8,
        padding: "16px 18px",
      }}
    >
      {children}
    </div>
  )
}
