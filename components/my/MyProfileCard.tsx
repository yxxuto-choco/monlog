"use client"

import Link from "next/link"
import RandomPixelAvatar from "@/components/RandomPixelAvatar"
import SectionCard from "@/components/ui/SectionCard"
import { COLORS, RADII, SHADOWS } from "@/components/ui/designTokens"

export type MyLevelInfo = {
  level: number
  title: string
  min: number
  next: number | null
  progress: number
  remaining: number
  maxLevel: boolean
}

type MyProfileCardProps = {
  userId: string
  email: string | null
  userName: string | null
  levelInfo: MyLevelInfo
  activityScore: number
}

export default function MyProfileCard({
  userId,
  email,
  userName,
  levelInfo,
  activityScore,
}: MyProfileCardProps) {
  return (
    <SectionCard
      style={{
        padding: "34px",
        borderRadius: RADII.xxl,
        boxShadow: SHADOWS.cardStrong,
        marginBottom: "28px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "28px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "22px",
            flexWrap: "wrap",
          }}
        >
          <RandomPixelAvatar
            seed={userId}
            size={88}
            title={`${userName ?? "ユーザー"}のドット絵アバター`}
          />

          <div>
            <p
              style={{
                margin: 0,
                color: COLORS.teal,
                fontSize: "14px",
                fontWeight: 900,
                letterSpacing: "0.14em",
              }}
            >
              MY ACTIVITY
            </p>

            <h2
              style={{
                margin: "8px 0 0",
                color: COLORS.navy,
                fontSize: "30px",
                lineHeight: 1.3,
                fontWeight: 900,
              }}
            >
              {userName ?? "ユーザー名未設定"}
            </h2>

            <p
              style={{
                margin: "8px 0 0",
                color: COLORS.slate,
                fontSize: "15px",
                fontWeight: 700,
                wordBreak: "break-all",
              }}
            >
              {email}
            </p>
          </div>
        </div>

        <Link
          href="/profile"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "48px",
            padding: "0 18px",
            borderRadius: RADII.md,
            backgroundColor: COLORS.navy,
            color: "#FFFFFF",
            textDecoration: "none",
            fontSize: "15px",
            fontWeight: 900,
          }}
        >
          プロフィール設定
        </Link>
      </div>

      <SectionCard
        variant="teal"
        style={{
          marginTop: "28px",
          padding: "22px 24px",
          borderRadius: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: COLORS.slate,
                fontSize: "14px",
                fontWeight: 900,
              }}
            >
              現在のレベル
            </p>

            <p
              style={{
                margin: "8px 0 0",
                color: COLORS.navy,
                fontSize: "28px",
                fontWeight: 900,
                lineHeight: 1.2,
              }}
            >
              Lv.{levelInfo.level} {levelInfo.title}
            </p>
          </div>

          <p
            style={{
              margin: 0,
              color: COLORS.teal,
              fontSize: "16px",
              fontWeight: 900,
            }}
          >
            活動スコア {activityScore}pt
          </p>
        </div>

        <div
          style={{
            marginTop: "18px",
            height: "14px",
            borderRadius: RADII.pill,
            backgroundColor: "rgba(255,255,255,0.78)",
            overflow: "hidden",
            border: `1px solid ${COLORS.line}`,
          }}
        >
          <div
            style={{
              width: `${levelInfo.progress}%`,
              height: "100%",
              backgroundColor: COLORS.teal,
              borderRadius: RADII.pill,
            }}
          />
        </div>

        <p
          style={{
            margin: "10px 0 0",
            color: COLORS.slate,
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          {levelInfo.maxLevel
            ? "最高レベルに到達しています。"
            : `次のレベルまであと ${levelInfo.remaining}pt`}
        </p>
      </SectionCard>
    </SectionCard>
  )
}
