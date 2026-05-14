"use client"

import { COLORS } from "@/components/ui/designTokens"

type EditorEmptyTextProps = {
  children: string
}

export default function EditorEmptyText({ children }: EditorEmptyTextProps) {
  return (
    <p
      style={{
        margin: 0,
        color: COLORS.muted,
        fontSize: "15px",
        lineHeight: 1.8,
      }}
    >
      {children}
    </p>
  )
}
