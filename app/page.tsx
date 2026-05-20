"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import UserMiniBadge from "@/components/UserMiniBadge"
import ProblemMarkdown from "@/components/ProblemMarkdown"
import PageShell from "@/components/ui/PageShell"
import SectionCard from "@/components/ui/SectionCard"
import MessageBox from "@/components/ui/MessageBox"
import StarRating from "@/components/ui/StarRating"
import { COLORS, RADII, SHADOWS } from "@/components/ui/designTokens"
import RepresentativeReviewCard from "@/components/home/RepresentativeReviewCard"
import ProblemPreviewContent from "@/components/home/ProblemPreviewContent"

/* =========================================================
  型定義
========================================================= */
type Problem = {
  id: string
  title: string
  content: string | null
  tags: string[]
  created_at: string
  user_id: string | null
}

type RepresentativeReview = {
  rating: number
  comment: string
  created_at: string | null
  user_id: string | null
}

type ReviewStats = {
  average: number
  count: number
  representativeReview: RepresentativeReview | null
}

type ReviewRow = {
  rating: number | string | null
  comment: string | null
  created_at: string | null
  user_id: string | null
}

type TagRow = {
  name: string | null
}

type ProblemTagRow = {
  tags: TagRow | TagRow[] | null
}

type ProblemRow = {
  id: string
  title: string
  content: string | null
  created_at: string
  user_id: string | null
  problem_tags: ProblemTagRow[] | null
  reviews: ReviewRow[] | null
}

/* =========================================================
  アイコン
========================================================= */
function UserIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 21a8 8 0 0 0-16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

function SettingsIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.4 1.07V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8.6 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.07-.4H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6A1.65 1.65 0 0 0 10.4 3V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15.4 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.4.18.74.48 1 .86.25.38.39.82.4 1.27V12a2 2 0 0 1-2 2h-.09A1.65 1.65 0 0 0 19.4 15Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LogoutIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 17l5-5-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CommentIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronIcon({ opened }: { opened: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={opened ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* =========================================================
  補助関数
========================================================= */
function extractTagNames(problemTags: ProblemTagRow[] | null): string[] {
  return (problemTags ?? [])
    .map((pt) => {
      const tags = pt.tags
      const tag = Array.isArray(tags) ? tags[0] : tags
      return tag?.name ?? ""
    })
    .filter(Boolean)
}

function pickRepresentativeReview(reviews: ReviewRow[] | null): RepresentativeReview | null {
  const candidates = (reviews ?? [])
    .map((review) => ({
      rating: Number(review.rating),
      comment: review.comment?.trim() ?? "",
      created_at: review.created_at,
      user_id: review.user_id ?? null,
    }))
    .filter((review) => Number.isFinite(review.rating) && review.comment.length > 0)

  if (candidates.length === 0) return null

  return candidates.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating

    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0

    return bTime - aTime
  })[0]
}

function calcReviewStats(reviews: ReviewRow[] | null): ReviewStats {
  const ratings = (reviews ?? [])
    .map((review) => Number(review.rating))
    .filter((rating) => Number.isFinite(rating))

  const count = ratings.length
  const average = count === 0 ? 0 : ratings.reduce((sum, rating) => sum + rating, 0) / count

  return {
    average,
    count,
    representativeReview: pickRepresentativeReview(reviews),
  }
}

function formatDate(value: string | null) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

function truncateText(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length)}...` : text
}

/* =========================================================
  トップページ
========================================================= */
export default function Home() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [stats, setStats] = useState<Record<string, ReviewStats>>({})
  const [sortMode, setSortMode] = useState<"default" | "popular">("default")
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [expandedProblemIds, setExpandedProblemIds] = useState<string[]>([])

  const router = useRouter()

  useEffect(() => {
    const applyQueryFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      setQuery(params.get("q") ?? "")
    }

    applyQueryFromUrl()
    window.addEventListener("popstate", applyQueryFromUrl)

    return () => {
      window.removeEventListener("popstate", applyQueryFromUrl)
    }
  }, [])

  useEffect(() => {
    async function loadUserAndProfile() {
      const { data } = await supabase.auth.getUser()
      const user = data.user

      if (!user) {
        setUserId(null)
        setUserEmail(null)
        setUserName(null)
        return
      }

      setUserId(user.id)
      setUserEmail(user.email ?? null)

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle()

      if (error) {
        console.warn("プロフィール取得エラー:", error.message)
        setUserName(null)
        return
      }

      setUserName(profile?.username ?? null)
    }

    loadUserAndProfile()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUserAndProfile()
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    async function fetchProblems() {
      setIsLoading(true)
      setErrorMessage(null)

      const { data, error } = await supabase
        .from("problems")
        .select(`
          id,
          title,
          content,
          created_at,
          user_id,
          problem_tags (
            tags ( name )
          ),
          reviews (
            rating,
            comment,
            created_at,
            user_id
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase取得エラー:", error.message)
        setErrorMessage("問題一覧の取得に失敗しました。")
        setIsLoading(false)
        return
      }

      const rows = (data ?? []) as unknown as ProblemRow[]

      const nextProblems: Problem[] = rows.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        created_at: p.created_at,
        user_id: p.user_id,
        tags: extractTagNames(p.problem_tags),
      }))

      const nextStats: Record<string, ReviewStats> = {}

      rows.forEach((p) => {
        nextStats[p.id] = calcReviewStats(p.reviews)
      })

      setProblems(nextProblems)
      setStats(nextStats)
      setIsLoading(false)
    }

    fetchProblems()

    const handleFocus = () => {
      fetchProblems()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchProblems()
      }
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  function toggleProblem(problemId: string) {
    setExpandedProblemIds((current) =>
      current.includes(problemId)
        ? current.filter((id) => id !== problemId)
        : [...current, problemId]
    )
  }

  function isExpanded(problemId: string) {
    return expandedProblemIds.includes(problemId)
  }

  const filteredProblems = [...problems]
    .filter((p) => {
      const keyword = query.trim().toLowerCase()
      if (!keyword) return true

      return (
        p.title.toLowerCase().includes(keyword) ||
        (p.content ?? "").toLowerCase().includes(keyword) ||
        p.tags.some((tag) => tag.toLowerCase().includes(keyword))
      )
    })
    .sort((a, b) => {
      if (sortMode === "default") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }

      const aAvg = stats[a.id]?.average ?? 0
      const bAvg = stats[b.id]?.average ?? 0

      if (bAvg !== aAvg) return bAvg - aAvg

      const aCount = stats[a.id]?.count ?? 0
      const bCount = stats[b.id]?.count ?? 0
      return bCount - aCount
    })

  const totalReviews = Object.values(stats).reduce((sum, s) => sum + s.count, 0)

  return (
    <PageShell wide>
      <header
        style={{
          textAlign: "center",
          marginBottom: "46px",
        }}
      >
        <h1
          style={{
            margin: 0,
            color: COLORS.navy,
            fontSize: "56px",
            lineHeight: 1.1,
            fontWeight: 900,
            letterSpacing: "-0.05em",
          }}
        >
          問ログ
        </h1>

        <p
          style={{
            margin: "18px 0 0",
            color: COLORS.slate,
            fontSize: "20px",
            lineHeight: 1.7,
            fontWeight: 600,
          }}
        >
          学問の問題を投稿・レビューするプラットフォーム
        </p>

        <Link
          href="/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "70px",
            padding: "0 38px",
            marginTop: "26px",
            borderRadius: RADII.md,
            backgroundColor: COLORS.teal,
            color: "#FFFFFF",
            fontSize: "24px",
            fontWeight: 900,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(42, 157, 143, 0.22)",
          }}
        >
          問題を投稿する
        </Link>
      </header>

      <SectionCard
        style={{
          padding: "18px 24px",
          marginBottom: "30px",
          borderRadius: RADII.md,
        }}
      >
        {userEmail ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            {userId && (
              <UserMiniBadge
                userId={userId}
                email={userEmail}
                userName={userName}
                size="sm"
                showEmail
              />
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                flexWrap: "wrap",
                color: COLORS.slate,
                fontSize: "17px",
                fontWeight: 800,
              }}
            >
              <Link
                href="/my"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  color: COLORS.slate,
                  textDecoration: "none",
                }}
              >
                <UserIcon size={21} />
                マイページ
              </Link>

              <Link
                href="/profile"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  color: COLORS.slate,
                  textDecoration: "none",
                }}
              >
                <SettingsIcon size={21} />
                設定
              </Link>

              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut()
                  setUserId(null)
                  setUserEmail(null)
                  setUserName(null)
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  border: "none",
                  background: "transparent",
                  color: COLORS.slate,
                  font: "inherit",
                  fontWeight: 800,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <LogoutIcon size={21} />
                ログアウト
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                color: COLORS.slate,
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              ログインしていません
            </span>

            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "42px",
                padding: "0 18px",
                borderRadius: RADII.pill,
                backgroundColor: COLORS.navy,
                color: "#FFFFFF",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: 900,
              }}
            >
              ログイン / 新規登録
            </Link>
          </div>
        )}
      </SectionCard>

      <section
        style={{
          display: "flex",
          gap: "34px",
          flexWrap: "wrap",
          marginBottom: "44px",
          padding: "0 24px",
          color: COLORS.slate,
          fontSize: "17px",
          fontWeight: 700,
        }}
      >
        <span>
          投稿問題数:{" "}
          <strong style={{ color: COLORS.navy, marginLeft: "8px" }}>{problems.length}</strong>
        </span>

        <span>
          レビュー数:{" "}
          <strong style={{ color: COLORS.navy, marginLeft: "8px" }}>{totalReviews}</strong>
        </span>

        <span>
          表示件数:{" "}
          <strong style={{ color: COLORS.navy, marginLeft: "8px" }}>
            {filteredProblems.length}
          </strong>
        </span>
      </section>

      <SectionCard
        variant="teal"
        style={{
          borderLeft: `6px solid ${COLORS.teal}`,
          borderRadius: RADII.md,
          padding: "34px 38px",
          marginBottom: "44px",
        }}
      >
        <h2
          style={{
            margin: "0 0 26px",
            color: COLORS.navy,
            fontSize: "30px",
            fontWeight: 900,
          }}
        >
          問題を探す
        </h2>

        <div
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => setSortMode("default")}
              style={{
                minHeight: "62px",
                padding: "0 22px",
                borderRadius: RADII.sm,
                border: `1px solid ${sortMode === "default" ? COLORS.teal : COLORS.line}`,
                backgroundColor: sortMode === "default" ? COLORS.teal : COLORS.surface,
                color: sortMode === "default" ? "#FFFFFF" : COLORS.navy,
                fontSize: "20px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              新着順
            </button>

            <button
              type="button"
              onClick={() => setSortMode("popular")}
              style={{
                minHeight: "62px",
                padding: "0 22px",
                borderRadius: RADII.sm,
                border: `1px solid ${sortMode === "popular" ? COLORS.teal : COLORS.line}`,
                backgroundColor: sortMode === "popular" ? COLORS.teal : COLORS.surface,
                color: sortMode === "popular" ? "#FFFFFF" : COLORS.navy,
                fontSize: "20px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              人気順
            </button>
          </div>

          <div
            style={{
              flex: "1 1 420px",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "50%",
                left: "18px",
                transform: "translateY(-50%)",
                color: COLORS.slate,
                display: "inline-flex",
              }}
            >
              <SearchIcon />
            </span>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="問題を検索..."
              style={{
                width: "100%",
                height: "62px",
                borderRadius: RADII.sm,
                border: `1px solid ${COLORS.line}`,
                backgroundColor: COLORS.surface,
                color: COLORS.text,
                fontSize: "19px",
                padding: "0 18px 0 58px",
                outline: "none",
              }}
            />
          </div>

          {query.trim() && (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                router.push("/")
              }}
              style={{
                minHeight: "50px",
                border: `1px solid ${COLORS.tealLine}`,
                backgroundColor: COLORS.surface,
                color: COLORS.teal,
                borderRadius: RADII.pill,
                padding: "0 18px",
                fontSize: "15px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              解除
            </button>
          )}
        </div>
      </SectionCard>

      <section>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: COLORS.navy,
                fontSize: "32px",
                fontWeight: 900,
              }}
            >
              問題一覧
            </h2>

            <p
              style={{
                margin: "8px 0 0",
                color: COLORS.slate,
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              {sortMode === "default" ? "新着順" : "人気順"}で表示中 /{" "}
              {filteredProblems.length}件
            </p>
          </div>
        </div>

        {errorMessage ? (
          <MessageBox type="error">{errorMessage}</MessageBox>
        ) : isLoading ? (
          <SectionCard>読み込み中...</SectionCard>
        ) : filteredProblems.length === 0 ? (
          <SectionCard>条件に一致する問題はありません。</SectionCard>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "32px",
            }}
          >
            {filteredProblems.map((p) => {
              const average = stats[p.id]?.average ?? 0
              const count = stats[p.id]?.count ?? 0
              const representativeReview = stats[p.id]?.representativeReview ?? null
              const rounded = Math.floor(average * 10) / 10
              const opened = isExpanded(p.id)

              return (
                <article
                  key={p.id}
                  style={{
                    backgroundColor: COLORS.surface,
                    border: `1px solid ${
                      opened ? "rgba(42, 157, 143, 0.48)" : COLORS.cardLine
                    }`,
                    borderRadius: RADII.xl,
                    boxShadow: SHADOWS.cardStrong,
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleProblem(p.id)}
                    aria-expanded={opened}
                    style={{
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      padding: opened ? "30px 36px" : "34px 36px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "22px",
                      }}
                    >
                      <div style={{ minWidth: 0, flex: "1 1 auto" }}>
                        {p.user_id && (
                          <div style={{ marginBottom: "18px" }}>
                            <UserMiniBadge userId={p.user_id} size="sm" showEmail={false} />
                          </div>
                        )}

                        <h3
                          style={{
                            margin: 0,
                            color: COLORS.navy,
                            fontSize: "26px",
                            lineHeight: 1.45,
                            fontWeight: 900,
                          }}
                        >
                          {p.title}
                        </h3>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            flexWrap: "wrap",
                            marginTop: "20px",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              color: COLORS.navy,
                              fontSize: "20px",
                              fontWeight: 900,
                            }}
                          >
                            <StarRating value={average} />
                            {rounded.toFixed(1)}
                          </span>

                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "7px",
                              color: COLORS.slate,
                              fontSize: "18px",
                              fontWeight: 700,
                            }}
                          >
                            <CommentIcon size={22} />
                            {count}件
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          color: COLORS.slate,
                          marginTop: "8px",
                          flex: "0 0 auto",
                        }}
                      >
                        <ChevronIcon opened={opened} />
                      </span>
                    </div>

                    {!opened && p.tags.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "12px",
                          marginTop: "22px",
                        }}
                      >
                        {p.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              borderRadius: RADII.pill,
                              backgroundColor: COLORS.tagBg,
                              color: COLORS.tagText,
                              padding: "8px 18px",
                              fontSize: "18px",
                              fontWeight: 900,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>

                  {opened && (
                    <div
                      style={{
                        borderTop: `1px solid ${COLORS.line}`,
                        padding: "28px 36px 36px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          flexWrap: "wrap",
                          color: COLORS.slate,
                          fontSize: "17px",
                          fontWeight: 700,
                          marginBottom: "24px",
                        }}
                      >
                        <span>投稿日: {formatDate(p.created_at)}</span>
                      </div>

                      <ProblemPreviewContent content={p.content} />

                      {representativeReview && (
                        <RepresentativeReviewCard
                          review={representativeReview}
                          commentPreview={truncateText(representativeReview.comment, 180)}
                        />
                      )}

                      {p.tags.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "12px",
                            marginBottom: "26px",
                          }}
                        >
                          {p.tags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                setQuery(tag)
                                router.push(`/?q=${encodeURIComponent(tag)}`)
                              }}
                              style={{
                                border: "none",
                                borderRadius: RADII.pill,
                                backgroundColor: COLORS.tagBg,
                                color: COLORS.tagText,
                                padding: "9px 18px",
                                fontSize: "18px",
                                fontWeight: 900,
                                cursor: "pointer",
                              }}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}

                      <Link
                        href={`/problems/${p.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          minHeight: "72px",
                          borderRadius: RADII.md,
                          backgroundColor: COLORS.navy,
                          color: "#FFFFFF",
                          textDecoration: "none",
                          fontSize: "24px",
                          fontWeight: 900,
                        }}
                      >
                        詳細を見る
                      </Link>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </PageShell>
  )
}