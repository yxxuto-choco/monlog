"use client"

import Link from "next/link"
import { COLORS, RADII } from "@/components/ui/designTokens"

type TagLinkPillProps = {
  name: string
  href?: string
}

export default function TagLinkPill({
  name,
  href = `/?q=${encodeURIComponent(name)}`,
}: TagLinkPillProps) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: RADII.pill,
        backgroundColor: COLORS.tagBg,
        color: COLORS.tagText,
        padding: "9px 18px",
        fontSize: "15px",
        fontWeight: 900,
        textDecoration: "none",
      }}
    >
      #{name}
    </Link>
  )
}
