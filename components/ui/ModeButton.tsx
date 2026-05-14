"use client"

import type { ReactNode } from "react"
import { COLORS, RADII } from "@/components/ui/designTokens"

type ModeButtonProps = {
  active: boolean
  onClick: () => void
  children: ReactNode
}

export default function ModeButton({ active, onClick, children }: ModeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: "40px",
        padding: "0 18px",
        borderRadius: RADII.pill,
        border: `1px solid ${active ? COLORS.teal : COLORS.lineStrong}`,
        backgroundColor: active ? COLORS.teal : COLORS.surface,
        color: active ? "#FFFFFF" : COLORS.navy,
        fontSize: "15px",
        fontWeight: 900,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  )
}
