"use client"

import type { ReactNode } from "react"
import { COLORS, RADII } from "@/components/ui/designTokens"

type ActionButtonProps = {
  children: ReactNode
  onClick: () => void
  variant?: "primary" | "secondary" | "danger"
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

export default function ActionButton({
  children,
  onClick,
  variant = "secondary",
  disabled = false,
  type = "button",
}: ActionButtonProps) {
  const isPrimary = variant === "primary"
  const isDanger = variant === "danger"

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "7px",
        minHeight: "42px",
        padding: "0 15px",
        borderRadius: RADII.md,
        border: `1px solid ${isPrimary ? COLORS.navy : isDanger ? "#FCA5A5" : COLORS.lineStrong}`,
        backgroundColor: isPrimary ? COLORS.navy : isDanger ? "#FEF2F2" : COLORS.surface,
        color: isPrimary ? "#FFFFFF" : isDanger ? COLORS.danger : COLORS.navy,
        fontSize: "14px",
        fontWeight: 900,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
      }}
    >
      {children}
    </button>
  )
}
