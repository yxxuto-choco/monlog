"use client"

import type { ChangeEventHandler } from "react"
import { COLORS, RADII } from "@/components/ui/designTokens"

type TextInputProps = {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  height?: string
  fontSize?: string
  fontWeight?: number
  type?: string
}

export default function TextInput({
  value,
  onChange,
  placeholder,
  height = "52px",
  fontSize = "17px",
  fontWeight = 800,
  type = "text",
}: TextInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: "100%",
        height,
        borderRadius: RADII.md,
        border: `1px solid ${COLORS.lineStrong}`,
        backgroundColor: COLORS.surface,
        color: COLORS.text,
        fontSize,
        fontWeight,
        padding: "0 16px",
        outline: "none",
      }}
    />
  )
}
