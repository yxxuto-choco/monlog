"use client"

import Link from "next/link"
import { Suspence, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

/* =========================================================
  問ログ Design System v1.4
========================================================= */
const COLORS = {
  paper: "#FAF7F0",
  surface: "#FFFFFF",
  navy: "#1E3A5F",
  text: "#1F2937",
  muted: "#64748B",
  slate: "#526984",
  line: "#D8DDD6",
  lineStrong: "#C9D2CD",
  teal: "#2A9D8F",
  tealSoft: "#E7F2EF",
  tealPanel: "#E3F1EE",
  tagBg: "#E2F1EE",
  tagText: "#158B80",
  star: "#F4A261",
  starEmpty: "#D7D3C8",
  danger: "#DC2626",
}

/* =========================================================
  型定義
========================================================= */
type Problem = {
  id: string
  title: string
  content: string | null
  tags: string[]
  created_at: string
}

type RepresentativeReview = {
  rating: number
  comment: string
  created_at: string | null
}

type ReviewStats = {
  average: number
  count: number
  representativeReview: RepresentativeReview | null
}

type ReviewRow = {
  rating: number | string | null
  comment?: string | null
  created_at?: string | null
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
  problem_tags: ProblemTagRow[] | null
  reviews: ReviewRow[] | null
}

/* =========================================================
  SVGアイコン
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

function GearIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82V22a2 2 0 1 1-4 0v-.18A1.65 1.65 0 0 0 8.6 20a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.82-.33H2a2 2 0 1 1 0-4h.18A1.65 1.65 0 0 0 4 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.44 3.9l.06.06A1.65 1.65 0 0 0 8.6 4.6a1.65 1.65 0 0 0 1-.6A1.65 1.65 0 0 0 9.93 2.18V2a2 2 0 1 1 4 0v.18A1.65 1.65 0 0 0 15 4a1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8.6a1.65 1.65 0 0 0 .6 1 1.65 1.65 0 0 0 1.82.33H22a2 2 0 1 1 0 4h-.18A1.65 1.65 0 0 0 19.4 15Z"
        stroke="currentColor"
        strokeWidth="1.6"
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

function SearchIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m21 21-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
        stroke="currentColor"
        strokeWidth="2"
      />
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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={open ? "M18 15 12 9 6 15" : "M6 9l6 6 6-6"}
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* =========================================================
  星評価：既存の部分塗り方式を維持
========================================================= */
function StarRating({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <span
      aria-label={`平均評価 ${value.toFixed(1)}`}
      style={{
        display: "inline-flex",
        gap: "2px",
        verticalAlign: "middle",
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercent = Math.max(0, Math.min(100, (value - (star - 1)) * 100))

        return (
          <span
            key={star}
            style={{
              position: "relative",
              display: "inline-block",
              width: `${size}px`,
              height: `${size}px`,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width={size}
              height={size}
              style={{ color: COLORS.starEmpty }}
            >
              <path
                fill="currentColor"
                d="M12 2.5l2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.6l-5.8 3.1 1.1-6.6-4.8-4.7 6.6-.9L12 2.5z"
              />
            </svg>

            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${fillPercent}%`,
                height: `${size}px`,
                overflow: "hidden",
              }}
            >
              <svg viewBox="0 0 24 24" width={size} height={size} style={{ color: COLORS.star }}>
                <path
                  fill="currentColor"
                  d="M12 2.5l2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.6l-5.8 3.1 1.1-6.6-4.8-4.7 6.6-.9L12 2.5z"
                />
              </svg>
            </span>
          </span>
        )
      })}
    </span>
  )
}

function RatingRow({ average, count }: { average: number; count: number }) {
  const rounded = Math.floor(average * 10) / 10

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "14px",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <StarRating value={average} size={18} />
        <span
          style={{
            color: COLORS.text,
            fontSize: "20px",
            fontWeight: 800,
          }}
        >
          {rounded.toFixed(1)}
        </span>
      </span>

      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: COLORS.slate,
          fontSize: "18px",
          fontWeight: 700,
        }}
      >
        <CommentIcon size={21} />
        <span>{count}件</span>
      </span>
    </div>
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
      created_at: review.created_at ?? null,
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
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [stats, setStats] = useState<Record<string, ReviewStats>>({})
  const [sortMode, setSortMode] = useState<"default" | "popular">("default")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [expandedProblemIds, setExpandedProblemIds] = useState<string[]>([])

  const router = useRouter()

  /* ---------------------------------------------------------
    URLクエリ取得
  --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
    ログイン状態取得
  --------------------------------------------------------- */
  useEffect(() => {
    async function loadUserAndProfile() {
      const { data } = await supabase.auth.getUser()
      const user = data.user

      if (!user) {
        setUserEmail(null)
        setUserName(null)
        return
      }

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

  /* ---------------------------------------------------------
    DB取得
    reviews.comment / created_at がない環境でも落ちにくいように fallback
  --------------------------------------------------------- */
  useEffect(() => {
    async function fetchProblems() {
      setIsLoading(true)
      setErrorMessage(null)

      const primaryResult = await supabase
        .from("problems")
        .select(`
          id,
          title,
          content,
          created_at,
          problem_tags (
            tags ( name )
          ),
          reviews (
            rating,
            comment,
            created_at
          )
        `)
        .order("created_at", { ascending: false })

      let data: unknown = primaryResult.data
      let error: { message: string } | null = primaryResult.error

      if (error) {
        console.warn(
          "reviews.comment / created_at 付き取得に失敗。ratingのみで再取得します:",
          error.message
        )

        const fallbackResult = await supabase
          .from("problems")
          .select(`
            id,
            title,
            content,
            created_at,
            problem_tags (
              tags ( name )
            ),
            reviews (
              rating
            )
          `)
          .order("created_at", { ascending: false })

        data = fallbackResult.data
        error = fallbackResult.error
      }

      if (error) {
        console.error("Supabase取得エラー:", error.message)
        setErrorMessage("問題一覧の取得に失敗しました。")
        setIsLoading(false)
        return
      }

      const rows = (Array.isArray(data) ? data : []) as unknown as ProblemRow[]

      const nextProblems: Problem[] = rows.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        created_at: p.created_at,
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

  /* ---------------------------------------------------------
    開閉・タグクリック
  --------------------------------------------------------- */
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

  function handleTagClick(tag: string) {
    setQuery(tag)
    router.push(`/?q=${encodeURIComponent(tag)}`)
  }

  /* ---------------------------------------------------------
    検索・並び替え
  --------------------------------------------------------- */
  const filteredProblems = useMemo(() => {
    return [...problems]
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
  }, [problems, query, sortMode, stats])

  const totalReviews = Object.values(stats).reduce((sum, s) => sum + s.count, 0)

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: COLORS.paper,
        color: COLORS.text,
        padding: "28px 0 64px",
      }}
    >
      <div
        style={{
          width: "min(1220px, calc(100vw - 48px))",
          margin: "0 auto",
        }}
      >
        {/* =====================================================
          ページ上部：Figma寄せ
        ===================================================== */}
        <header
          style={{
            textAlign: "center",
            paddingTop: "4px",
            paddingBottom: "48px",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: COLORS.navy,
              fontSize: "64px",
              lineHeight: 1.08,
              fontWeight: 900,
              letterSpacing: "-0.04em",
            }}
          >
            問ログ
          </h1>

          <p
            style={{
              margin: "24px 0 0",
              color: COLORS.slate,
              fontSize: "24px",
              fontWeight: 600,
              lineHeight: 1.6,
            }}
          >
            学問の問題を投稿・レビューするプラットフォーム
          </p>

          <div style={{ marginTop: "30px" }}>
            <Link
              href="/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "224px",
                height: "72px",
                padding: "0 34px",
                borderRadius: "16px",
                backgroundColor: COLORS.teal,
                color: "#FFFFFF",
                fontSize: "22px",
                fontWeight: 900,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(42, 157, 143, 0.18)",
              }}
            >
              問題を投稿する
            </Link>
          </div>
        </header>

        {/* =====================================================
          ログインバー
        ===================================================== */}
        <section
          style={{
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.line}`,
            borderRadius: "16px",
            boxShadow: "0 4px 14px rgba(30, 58, 95, 0.08)",
            padding: "20px 28px",
            marginBottom: "38px",
          }}
        >
          {userEmail ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  color: COLORS.slate,
                  fontSize: "18px",
                  flexWrap: "wrap",
                }}
              >
                <UserIcon />
                <span>{userEmail}</span>
                <span style={{ color: COLORS.muted }}>/</span>
                <span style={{ fontSize: "15px" }}>{userName ?? "ユーザー名未設定"}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "28px",
                  flexWrap: "wrap",
                  color: COLORS.slate,
                  fontSize: "16px",
                  fontWeight: 800,
                }}
              >
                <Link
                  href="/my"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
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
                    gap: "8px",
                    color: COLORS.slate,
                    textDecoration: "none",
                  }}
                >
                  <GearIcon size={21} />
                  設定
                </Link>

                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut()
                    setUserEmail(null)
                    setUserName(null)
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
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
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  color: COLORS.slate,
                  fontSize: "18px",
                }}
              >
                <UserIcon />
                <span>ログインしていません</span>
              </div>

              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  backgroundColor: COLORS.navy,
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: 900,
                  textDecoration: "none",
                }}
              >
                ログイン / 新規登録
              </Link>
            </div>
          )}
        </section>

        {/* =====================================================
          サマリー
        ===================================================== */}
        <section
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "28px 40px",
            color: COLORS.slate,
            fontSize: "18px",
            marginBottom: "48px",
            paddingLeft: "24px",
          }}
        >
          <span>
            投稿問題数:{" "}
            <strong style={{ color: COLORS.navy, fontWeight: 500 }}>{problems.length}</strong>
          </span>
          <span>
            レビュー数:{" "}
            <strong style={{ color: COLORS.navy, fontWeight: 500 }}>{totalReviews}</strong>
          </span>
          <span>
            表示件数:{" "}
            <strong style={{ color: COLORS.navy, fontWeight: 500 }}>
              {filteredProblems.length}
            </strong>
          </span>
        </section>

        {/* =====================================================
          検索パネル
        ===================================================== */}
        <section
          style={{
            backgroundColor: COLORS.tealPanel,
            borderLeft: `6px solid ${COLORS.teal}`,
            borderRadius: "16px",
            padding: "36px 42px",
            marginBottom: "42px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: COLORS.navy,
              fontSize: "34px",
              fontWeight: 900,
              lineHeight: 1.2,
            }}
          >
            問題を探す
          </h2>

          <div
            style={{
              marginTop: "30px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => setSortMode("default")}
              style={{
                height: "64px",
                padding: "0 24px",
                borderRadius: "12px",
                border: `1px solid ${sortMode === "default" ? COLORS.teal : COLORS.lineStrong}`,
                backgroundColor: sortMode === "default" ? COLORS.teal : COLORS.surface,
                color: sortMode === "default" ? "#FFFFFF" : COLORS.navy,
                fontSize: "22px",
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
                height: "64px",
                padding: "0 24px",
                borderRadius: "12px",
                border: `1px solid ${sortMode === "popular" ? COLORS.teal : COLORS.lineStrong}`,
                backgroundColor: sortMode === "popular" ? COLORS.teal : COLORS.surface,
                color: sortMode === "popular" ? "#FFFFFF" : COLORS.navy,
                fontSize: "22px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              人気順
            </button>

            <div
              style={{
                position: "relative",
                flex: "1 1 520px",
                minWidth: "260px",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "18px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: COLORS.slate,
                  display: "inline-flex",
                }}
              >
                <SearchIcon size={25} />
              </span>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="問題を検索..."
                style={{
                  width: "100%",
                  height: "64px",
                  borderRadius: "12px",
                  border: `1px solid ${COLORS.lineStrong}`,
                  backgroundColor: COLORS.surface,
                  color: COLORS.text,
                  fontSize: "20px",
                  outline: "none",
                  padding: "0 18px 0 60px",
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
                  height: "64px",
                  padding: "0 20px",
                  borderRadius: "12px",
                  border: `1px solid ${COLORS.lineStrong}`,
                  backgroundColor: COLORS.surface,
                  color: COLORS.teal,
                  fontSize: "17px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                解除
              </button>
            )}
          </div>
        </section>

        {/* =====================================================
          問題一覧
        ===================================================== */}
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "34px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: COLORS.navy,
                fontSize: "34px",
                fontWeight: 900,
                lineHeight: 1.2,
              }}
            >
              問題一覧
            </h2>

            <p
              style={{
                margin: 0,
                color: COLORS.teal,
                fontSize: "16px",
                fontWeight: 900,
              }}
            >
              {sortMode === "default" ? "新着順で表示中" : "人気順で表示中"} /{" "}
              {filteredProblems.length}件
            </p>
          </div>

          {errorMessage ? (
            <div
              style={{
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.line}`,
                borderRadius: "20px",
                padding: "28px",
                color: COLORS.danger,
                boxShadow: "0 4px 14px rgba(30, 58, 95, 0.08)",
              }}
            >
              {errorMessage}
            </div>
          ) : isLoading ? (
            <div
              style={{
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.line}`,
                borderRadius: "20px",
                padding: "28px",
                color: COLORS.muted,
                boxShadow: "0 4px 14px rgba(30, 58, 95, 0.08)",
              }}
            >
              読み込み中...
            </div>
          ) : filteredProblems.length === 0 ? (
            <div
              style={{
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.line}`,
                borderRadius: "20px",
                padding: "28px",
                color: COLORS.muted,
                boxShadow: "0 4px 14px rgba(30, 58, 95, 0.08)",
              }}
            >
              条件に一致する問題はありません。
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "34px",
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
                      position: "relative",
                      backgroundColor: COLORS.surface,
                      border: `1px solid ${opened ? "#9FD4CA" : COLORS.line}`,
                      borderRadius: "22px",
                      boxShadow: "0 4px 14px rgba(30, 58, 95, 0.10)",
                      overflow: "hidden",
                    }}
                  >
                    {!opened ? (
                      <div
                        style={{
                          position: "relative",
                          padding: "36px 36px 34px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleProblem(p.id)}
                          aria-expanded={opened}
                          aria-label={`${p.title}を開く`}
                          style={{
                            position: "absolute",
                            top: "34px",
                            right: "34px",
                            border: "none",
                            background: "transparent",
                            color: COLORS.slate,
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <ChevronIcon open={false} />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleProblem(p.id)}
                          aria-expanded={opened}
                          style={{
                            display: "block",
                            width: "calc(100% - 56px)",
                            border: "none",
                            background: "transparent",
                            padding: 0,
                            margin: 0,
                            textAlign: "left",
                            cursor: "pointer",
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              color: COLORS.navy,
                              fontSize: "28px",
                              lineHeight: 1.45,
                              fontWeight: 900,
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {p.title}
                          </h3>
                        </button>

                        <div style={{ marginTop: "24px" }}>
                          <RatingRow average={average} count={count} />
                        </div>

                        {p.tags.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "12px",
                              marginTop: "26px",
                            }}
                          >
                            {p.tags.map((tag) => {
                              const isActive = query.trim().toLowerCase() === tag.toLowerCase()

                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => handleTagClick(tag)}
                                  style={{
                                    border: "none",
                                    borderRadius: "999px",
                                    backgroundColor: isActive ? COLORS.teal : COLORS.tagBg,
                                    color: isActive ? "#FFFFFF" : COLORS.tagText,
                                    padding: "10px 20px",
                                    fontSize: "18px",
                                    fontWeight: 900,
                                    cursor: "pointer",
                                  }}
                                >
                                  {tag}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ padding: "16px" }}>
                        <div
                          style={{
                            border: "2px solid #9FD4CA",
                            borderRadius: "6px",
                            padding: "28px 36px 28px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: "18px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => toggleProblem(p.id)}
                              aria-expanded={opened}
                              style={{
                                border: "none",
                                background: "transparent",
                                padding: 0,
                                textAlign: "left",
                                cursor: "pointer",
                              }}
                            >
                              <h3
                                style={{
                                  margin: 0,
                                  color: COLORS.navy,
                                  fontSize: "28px",
                                  lineHeight: 1.45,
                                  fontWeight: 900,
                                }}
                              >
                                {p.title}
                              </h3>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleProblem(p.id)}
                              aria-expanded={opened}
                              aria-label={`${p.title}を閉じる`}
                              style={{
                                border: "none",
                                background: "transparent",
                                color: COLORS.slate,
                                cursor: "pointer",
                                padding: 0,
                              }}
                            >
                              <ChevronIcon open={true} />
                            </button>
                          </div>

                          <div style={{ marginTop: "24px" }}>
                            <RatingRow average={average} count={count} />
                          </div>
                        </div>

                        <div style={{ padding: "30px 22px 22px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: "18px 26px",
                              color: COLORS.slate,
                              fontSize: "19px",
                              lineHeight: 1.7,
                            }}
                          >
                            <span>投稿日: {formatDate(p.created_at)}</span>

                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <StarRating value={average} size={18} />
                              <strong style={{ color: COLORS.navy }}>{rounded.toFixed(1)}</strong>
                            </span>
                          </div>

                          <h4
                            style={{
                              margin: "28px 0 0",
                              color: COLORS.navy,
                              fontSize: "24px",
                              fontWeight: 900,
                            }}
                          >
                            問題内容
                          </h4>

                          {p.content ? (
                            <p
                              style={{
                                margin: "20px 0 0",
                                color: COLORS.text,
                                fontSize: "22px",
                                lineHeight: 1.85,
                              }}
                            >
                              {truncateText(p.content, 420)}
                            </p>
                          ) : (
                            <p
                              style={{
                                margin: "20px 0 0",
                                color: COLORS.muted,
                                fontSize: "20px",
                                lineHeight: 1.8,
                              }}
                            >
                              本文はまだ登録されていません。
                            </p>
                          )}

                          {representativeReview && (
                            <div
                              style={{
                                marginTop: "30px",
                                backgroundColor: "#FBF8EF",
                                borderRadius: "18px",
                                padding: "26px 28px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  color: COLORS.teal,
                                  fontSize: "19px",
                                  fontWeight: 900,
                                  marginBottom: "14px",
                                }}
                              >
                                <CommentIcon size={22} />
                                <span>最も評価が高いコメント</span>
                              </div>

                              <p
                                style={{
                                  margin: 0,
                                  color: COLORS.text,
                                  fontSize: "19px",
                                  lineHeight: 1.8,
                                }}
                              >
                                {truncateText(representativeReview.comment, 220)}
                              </p>
                            </div>
                          )}

                          {p.tags.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "12px",
                                marginTop: "28px",
                              }}
                            >
                              {p.tags.map((tag) => {
                                const isActive = query.trim().toLowerCase() === tag.toLowerCase()

                                return (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagClick(tag)}
                                    style={{
                                      border: "none",
                                      borderRadius: "999px",
                                      backgroundColor: isActive ? COLORS.teal : COLORS.tagBg,
                                      color: isActive ? "#FFFFFF" : COLORS.tagText,
                                      padding: "10px 20px",
                                      fontSize: "18px",
                                      fontWeight: 900,
                                      cursor: "pointer",
                                    }}
                                  >
                                    {tag}
                                  </button>
                                )
                              })}
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
                              marginTop: "30px",
                              borderRadius: "16px",
                              backgroundColor: COLORS.navy,
                              color: "#FFFFFF",
                              fontSize: "24px",
                              fontWeight: 900,
                              textDecoration: "none",
                            }}
                          >
                            詳細を見る
                          </Link>
                        </div>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}