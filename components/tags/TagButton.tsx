"use client"

import { COLORS, RADII } from "@/components/ui/designTokens"

type TagButtonProps = {
  name: string
  selected?: boolean
  onClick: () => void
}

export default function TagButton({ name, selected = false, onClick }: TagButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `1px solid ${selected ? COLORS.teal : COLORS.line}`,
        borderRadius: RADII.pill,
        backgroundColor: selected ? COLORS.teal : COLORS.tagBg,
        color: selected ? "#FFFFFF" : COLORS.tagText,
        padding: "8px 15px",
        fontSize: "14px",
        fontWeight: 900,
        cursor: "pointer",
      }}
    >
      #{name}
    </button>
  )
}
