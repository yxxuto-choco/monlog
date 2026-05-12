/*app/components/ui/PageShell.tsx*/
"use client"

import type { ReactNode } from "react"
import { COLORS, LAYOUT } from "@/components/ui/designTokens"

type PageShellProps = {
  children: ReactNode
  wide?: boolean
}

export default function PageShell({ children, wide = false }: PageShellProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: COLORS.paper,
        color: COLORS.text,
        padding: "32px 0 72px",
      }}
    >
      <div
        style={{
          width: wide ? LAYOUT.widePageWidth : LAYOUT.pageWidth,
          margin: "0 auto",
        }}
      >
        {children}
      </div>
    </main>
  )
}
