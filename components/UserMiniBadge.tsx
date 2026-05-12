"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import RandomPixelAvatar from "@/components/RandomPixelAvatar"

const COLORS = {
  navy: "#1E3A5F",
  muted: "#64748B",
  slate: "#526984",
  line: "#D8DDD6",
  teal: "#2A9D8F",
  tealPanel: "#E3F1EE",
}

type UserMiniBadgeProps = {
  userId: string
  email?: string | null
  userName?: string | null
  size?: "sm" | "md"
  showEmail?: boolean
}

type ProblemCountRow = {
  id: string
  reviews: { rating: number | string | null }[] | null
}

function getLevelInfo(activityScore: number) {
  const levels = [
    { level: 1, title: "はじめの投稿者", min: 0, next: 50 },
    { level: 2, title: "問題探索者", min: 50, next: 130 },
    { level: 3, title: "レビュー職人", min: 130, next: 260 },
    { level: 4, title: "数学案内人", min: 260, next: 460 },
    { level: 5, title: "問ログマスター", min: 460, next: null },
  ]

  return [...levels].reverse().find((item) => activityScore >= item.min) ?? levels[0]
}

export default function UserMiniBadge({
  userId,
  email,
  userName,
  size = "md",
  showEmail = true,
}: UserMiniBadgeProps) {
  const [resolvedUserName, setResolvedUserName] = useState<string | null>(userName ?? null)
  const [postCount, setPostCount] = useState(0)
  const [writtenReviewCount, setWrittenReviewCount] = useState(0)
  const [receivedReviewCount, setReceivedReviewCount] = useState(0)

  useEffect(() => {
    setResolvedUserName(userName ?? null)
  }, [userName])

  useEffect(() => {
    async function fetchProfileAndActivity() {
      if (!userName) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", userId)
          .maybeSingle()

        setResolvedUserName(profileData?.username ?? null)
      }

      const { data: problemsData } = await supabase
        .from("problems")
        .select(`
          id,
          reviews (
            rating
          )
        `)
        .eq("user_id", userId)

      const problemRows = (problemsData ?? []) as unknown as ProblemCountRow[]

      setPostCount(problemRows.length)
      setReceivedReviewCount(
        problemRows.reduce((sum, problem) => sum + (problem.reviews?.length ?? 0), 0)
      )

      const { count } = await supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)

      setWrittenReviewCount(count ?? 0)
    }

    fetchProfileAndActivity()
  }, [userId, userName])

  const activityScore = useMemo(() => {
    return postCount * 10 + writtenReviewCount * 5 + receivedReviewCount * 3
  }, [postCount, writtenReviewCount, receivedReviewCount])

  const levelInfo = getLevelInfo(activityScore)
  const avatarSize = size === "sm" ? 42 : 52

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size === "sm" ? "10px" : "12px",
        minWidth: 0,
      }}
    >
      <RandomPixelAvatar
        seed={userId}
        size={avatarSize}
        title={`${resolvedUserName ?? "ユーザー"}のドット絵アバター`}
      />

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              color: COLORS.navy,
              fontSize: size === "sm" ? "14px" : "15px",
              fontWeight: 900,
              lineHeight: 1.3,
            }}
          >
            {resolvedUserName ?? "ユーザー名未設定"}
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "999px",
              backgroundColor: COLORS.tealPanel,
              color: COLORS.teal,
              border: `1px solid ${COLORS.line}`,
              padding: size === "sm" ? "2px 8px" : "3px 10px",
              fontSize: size === "sm" ? "11px" : "12px",
              fontWeight: 900,
              lineHeight: 1.4,
              whiteSpace: "nowrap",
            }}
          >
            Lv.{levelInfo.level} {levelInfo.title}
          </span>
        </div>

        {showEmail && email && (
          <p
            style={{
              margin: "4px 0 0",
              color: COLORS.slate,
              fontSize: size === "sm" ? "12px" : "13px",
              fontWeight: 700,
              lineHeight: 1.4,
              wordBreak: "break-all",
            }}
          >
            {email}
          </p>
        )}
      </div>
    </div>
  )
}