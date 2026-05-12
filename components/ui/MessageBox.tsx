"use client"

import { COLORS } from "@/components/ui/designTokens"

type MessageBoxProps = {
  type: "error" | "success" | "info"
  children: React.ReactNode
}

export default function MessageBox({ type, children }: MessageBoxProps) {
  const isError = type === "error"
  const isSuccess = type === "success"

  return (
    <div
      style={{
        marginBottom: "18px",
        borderRadius: "16px",
        padding: "16px 18px",
        backgroundColor: isError
          ? "#FEF2F2"
          : isSuccess
            ? COLORS.softYellow
            : COLORS.tealPanel,
        border: `1px solid ${isError ? "#FCA5A5" : COLORS.line}`,
        color: isError ? COLORS.danger : isSuccess ? COLORS.success : COLORS.navy,
        fontSize: "15px",
        fontWeight: 900,
        lineHeight: 1.7,
      }}
    >
      {children}
    </div>
  )
}
