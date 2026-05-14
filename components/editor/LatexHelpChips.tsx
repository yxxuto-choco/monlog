"use client"

import { COLORS, RADII } from "@/components/ui/designTokens"

export default function LatexHelpChips() {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        marginTop: "12px",
        color: COLORS.slate,
        fontSize: "13px",
        fontWeight: 800,
      }}
    >
      <span
        style={{
          border: `1px solid ${COLORS.line}`,
          borderRadius: RADII.sm,
          backgroundColor: COLORS.softYellow,
          padding: "5px 9px",
        }}
      >
        インライン数式：{String.raw`$ \frac{1}{2} $`}
      </span>

      <span
        style={{
          border: `1px solid ${COLORS.line}`,
          borderRadius: RADII.sm,
          backgroundColor: COLORS.softYellow,
          padding: "5px 9px",
        }}
      >
        表示数式：{String.raw`$$ \int_0^1 x^2 dx $$`}
      </span>
    </div>
  )
}
