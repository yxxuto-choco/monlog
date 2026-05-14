"use client"

import { COLORS } from "@/components/ui/designTokens"

type FieldLabelProps = {
  children: string
  size?: string
}

export default function FieldLabel({ children, size = "20px" }: FieldLabelProps) {
  return (
    <label
      style={{
        display: "block",
        color: COLORS.navy,
        fontSize: size,
        fontWeight: 900,
        marginBottom: "8px",
      }}
    >
      {children}
    </label>
  )
}
