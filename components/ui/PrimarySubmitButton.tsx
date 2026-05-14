"use client"

import type { ReactNode } from "react"
import { COLORS, RADII } from "@/components/ui/designTokens"

type PrimarySubmitButtonProps = {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  minHeight?: string
  fontSize?: string
}

export default function PrimarySubmitButton({
  children,
  onClick,
  disabled = false,
  minHeight = "64px",
  fontSize = "20px",
}: PrimarySubmitButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        minHeight,
        border: "none",
        borderRadius: RADII.md,
        backgroundColor: COLORS.navy,
        color: "#FFFFFF",
        fontSize,
        fontWeight: 900,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  )
}
