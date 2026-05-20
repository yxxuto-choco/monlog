"use client"

import Link from "next/link"
import UserMiniBadge from "@/components/UserMiniBadge"
import SectionCard from "@/components/ui/SectionCard"
import { COLORS, RADII } from "@/components/ui/designTokens"

type ProfileSummaryCardProps = {
  userId: string
  email: string | null
  username: string
}

export default function ProfileSummaryCard({ userId, email, username }: ProfileSummaryCardProps) {
  return (
    <SectionCard style={{ padding: "34px", borderRadius: RADII.xxl, marginBottom: "28px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
        <UserMiniBadge userId={userId} email={email} userName={username.trim() || null} size="md" showEmail />
        <Link href="/my" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: "48px", padding: "0 18px", borderRadius: RADII.md, backgroundColor: COLORS.navy, color: "#FFFFFF", textDecoration: "none", fontSize: "15px", fontWeight: 900 }}>
          マイページを見る
        </Link>
      </div>
    </SectionCard>
  )
}
