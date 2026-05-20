"use client"

import { COLORS, RADII } from "@/components/ui/designTokens"

type RatingSelectProps = {
  value: string
  onChange: (value: string) => void
}

export default function RatingSelect({ value, onChange }: RatingSelectProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      style={{
        width: "160px",
        height: "48px",
        borderRadius: RADII.sm,
        border: `1px solid ${COLORS.lineStrong}`,
        backgroundColor: COLORS.surface,
        color: COLORS.navy,
        fontSize: "17px",
        fontWeight: 900,
        padding: "0 12px",
        outline: "none",
      }}
    >
      <option value="5">5</option>
      <option value="4">4</option>
      <option value="3">3</option>
      <option value="2">2</option>
      <option value="1">1</option>
    </select>
  )
}
