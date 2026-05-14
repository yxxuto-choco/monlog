"use client"

import type { ChangeEventHandler } from "react"
import { COLORS } from "@/components/ui/designTokens"

type TextAreaProps = {
  value: string
  onChange: ChangeEventHandler<HTMLTextAreaElement>
  rows?: number
  placeholder?: string
  minHeight?: string
}

export default function TextArea({
  value,
  onChange,
  rows = 8,
  placeholder,
  minHeight,
}: TextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      style={{
        width: "100%",
        minHeight,
        resize: "vertical",
        borderRadius: "16px",
        border: `1px solid ${COLORS.lineStrong}`,
        backgroundColor: COLORS.surface,
        color: COLORS.text,
        fontSize: "17px",
        lineHeight: 1.8,
        padding: "16px 18px",
        outline: "none",
      }}
    />
  )
}
