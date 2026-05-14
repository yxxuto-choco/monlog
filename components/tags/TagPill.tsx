"use client"

import { COLORS, RADII } from "@/components/ui/designTokens"

type TagPillProps = {
  name: string
}

export default function TagPill({ name }: TagPillProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: RADII.pill,
        backgroundColor: COLORS.tagBg,
        color: COLORS.tagText,
        padding: "8px 15px",
        fontSize: "14px",
        fontWeight: 900,
      }}
    >
      #{name}
    </span>
  )
}
