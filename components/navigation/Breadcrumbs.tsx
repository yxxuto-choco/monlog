"use client"

import Link from "next/link"
import { COLORS } from "@/components/ui/designTokens"

type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="パンくずリスト"
      style={{
        marginBottom: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "8px",
        flexWrap: "wrap",
        color: COLORS.slate,
        fontSize: "15px",
        fontWeight: 800,
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <span
            key={`${item.label}-${index}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {item.href && !isLast ? (
              <Link
                href={item.href}
                style={{
                  color: COLORS.teal,
                  textDecoration: "none",
                  fontWeight: 900,
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{ color: COLORS.navy, fontWeight: 900 }}>{item.label}</span>
            )}

            {!isLast && <span style={{ color: COLORS.slate }}>/</span>}
          </span>
        )
      })}
    </nav>
  )
}
