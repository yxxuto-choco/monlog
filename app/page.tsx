"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import PageShell from "@/components/ui/PageShell"
import SectionCard from "@/components/ui/SectionCard"
import MessageBox from "@/components/ui/MessageBox"
import { COLORS, RADII } from "@/components/ui/designTokens"
import HomeLoginBar from "@/components/home/HomeLoginBar"
import HomeSearchPanel from "@/components/home/HomeSearchPanel"
import ProblemListCard from "@/components/home/ProblemListCard"

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

  async function handleLogout() {
    await supabase.auth.signOut()
    setUserId(null)
    setUserEmail(null)
    setUserName(null)
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

      <HomeLoginBar
        userId={userId}
        userEmail={userEmail}
        userName={userName}
        onLogout={handleLogout}
      />

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

      <HomeSearchPanel
        sortMode={sortMode}
        onSortModeChange={setSortMode}
        query={query}
        onQueryChange={setQuery}
        onClearQuery={() => {
          setQuery("")
          router.push("/")
        }}
      />

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
                <ProblemListCard
                  key={p.id}
                  problem={p}
                  average={average}
                  roundedAverage={rounded}
                  reviewCount={count}
                  representativeReview={representativeReview}
                  opened={opened}
                  createdAtLabel={formatDate(p.created_at)}
                  representativeCommentPreview={
                    representativeReview ? truncateText(representativeReview.comment, 180) : null
                  }
                  onToggle={() => toggleProblem(p.id)}
                  onTagClick={(tag) => {
                    setQuery(tag)
                    router.push(`/?q=${encodeURIComponent(tag)}`)
                  }}
                />
              )
            })}
          </div>
        )}
      </section>
    </PageShell>
  )
}
