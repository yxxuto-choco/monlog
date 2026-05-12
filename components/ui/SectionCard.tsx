/*app/components/ui/SectionCard.tsx*/
"use client"

import type { CSSProperties, ReactNode } from "react"
import { COLORS, RADII, SHADOWS } from "@/components/ui/designTokens"

type SectionCardProps = {
  children: ReactNode
  variant?: "white" | "teal" | "yellow"
  style?: CSSProperties
}

export default function SectionCard({
  children,
  variant = "white",
  style,
}: SectionCardProps) {
  const backgroundColor =
    variant === "teal"
      ? COLORS.tealPanel
      : variant === "yellow"
        ? COLORS.softYellow
        : COLORS.surface

  const border =
    variant === "teal"
      ? "1px solid #B8DCD5"
      : `1px solid ${COLORS.line}`

  return (
    <section
      style={{
        backgroundColor,
        border,
        borderRadius: RADII.xl,
        boxShadow: variant === "white" ? SHADOWS.card : "none",
        padding: "30px 34px",
        ...style,
      }}
    >
      {children}
    </section>
  )
}
