"use client"

import type { ReactNode } from "react"
import { COLORS } from "@/components/ui/designTokens"

type FieldDescriptionProps = {
  children: ReactNode
}

export default function FieldDescription({ children }: FieldDescriptionProps) {
  return (
    <p
      style={{
        margin: 0,
        color: COLORS.slate,
        fontSize: "14px",
        fontWeight: 700,
        lineHeight: 1.7,
      }}
    >
      {children}
    </p>
  )
}
