"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ProblemMarkdown from "@/components/ProblemMarkdown"

/* =========================================================
  問ログ Design System v1.5
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
  tealPanel: "#E3F1EE",
  tagBg: "#E2F1EE",
  tagText: "#158B80",
  star: "#F4A261",
  starEmpty: "#D7D3C8",
  danger: "#DC2626",
  softYellow: "#FBF8EF",
}

/* =========================================================
  型定義
========================================================= */
type Problem = {
  id: string
  title: string
  content: string | null
  created_at: string
  tags: string[]
}

type Review = {
  id: string
  rating: number
  comment: string | null
  created_at: string | null
  user_id: string | null
  username: string | null
}

type ReviewRow = {
  id: string
  rating: number | string | null
  comment?: string | null
  created_at?: string | null
  user_id?: string | null
  profiles?: { username: string | null } | { username: string | null }[] | null
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
  アイコン
========================================================= */
function BackIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 12H5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
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

/* =========================================================
  星評価：部分塗り方式
========================================================= */
function StarRating({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <span
      aria-label={`評価 ${value.toFixed(1)}`}
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

function RatingSummary({ average, count }: { average: number; count: number }) {
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
          gap: "9px",
        }}
      >
        <StarRating value={average} size={20} />
        <span
          style={{
            color: COLORS.text,
            fontSize: "22px",
            fontWeight: 900,
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
          fontWeight: 800,
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

function normalizeReviews(reviews: ReviewRow[] | null): Review[] {
  return (reviews ?? [])
    .map((review) => {
      const profile = Array.isArray(review.profiles) ? review.profiles[0] : review.profiles

      return {
        id: review.id,
        rating: Number(review.rating),
        comment: review.comment ?? null,
        created_at: review.created_at ?? null,
        user_id: review.user_id ?? null,
        username: profile?.username ?? null,
      }
    })
    .filter((review) => Number.isFinite(review.rating))
}

function calcAverage(reviews: Review[]) {
  if (reviews.length === 0) return 0
  return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
}

function formatDate(value: string | null) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

function sortReviews(reviews: Review[]) {
  return [...reviews].sort((a, b) => {
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
    return bTime - aTime
  })
}

/* =========================================================
  詳細ページ
========================================================= */
export default function ProblemDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const problemId = params?.id

  const [problem, setProblem] = useState<Problem | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  const average = useMemo(() => calcAverage(reviews), [reviews])
  const sortedReviews = useMemo(() => sortReviews(reviews), [reviews])

  /* ---------------------------------------------------------
    ログイン状態取得
  --------------------------------------------------------- */
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser()
      const user = data.user

      setUserId(user?.id ?? null)
      setUserEmail(user?.email ?? null)
    }

    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  /* ---------------------------------------------------------
    問題詳細取得
  --------------------------------------------------------- */
  useEffect(() => {
    if (!problemId) return

    async function fetchProblem() {
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
            id,
            rating,
            comment,
            created_at,
            user_id,
            profiles (
              username
            )
          )
        `)
        .eq("id", problemId)
        .maybeSingle()

      let data: unknown = primaryResult.data
      let error: { message: string } | null = primaryResult.error

      if (error) {
        console.warn(
          "reviews.comment / profiles 付き取得に失敗。rating中心で再取得します:",
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
              id,
              rating,
              comment,
              created_at,
              user_id
            )
          `)
          .eq("id", problemId)
          .maybeSingle()

        data = fallbackResult.data
        error = fallbackResult.error
      }

      if (error) {
        console.error("問題詳細取得エラー:", error.message)
        setErrorMessage("問題詳細の取得に失敗しました。")
        setIsLoading(false)
        return
      }

      if (!data) {
        setErrorMessage("問題が見つかりませんでした。")
        setIsLoading(false)
        return
      }

      const row = data as ProblemRow

      setProblem({
        id: row.id,
        title: row.title,
        content: row.content,
        created_at: row.created_at,
        tags: extractTagNames(row.problem_tags),
      })

      setReviews(normalizeReviews(row.reviews))
      setIsLoading(false)
    }

    fetchProblem()
  }, [problemId])

  /* ---------------------------------------------------------
    レビュー投稿
  --------------------------------------------------------- */
  async function handleSubmitReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!problemId || !userId) return

    setIsSubmitting(true)
    setSubmitMessage(null)
    setErrorMessage(null)

    const payload = {
      problem_id: problemId,
      user_id: userId,
      rating,
      comment: comment.trim() || null,
    }

    const { error } = await supabase.from("reviews").insert(payload)

    if (error) {
      console.error("レビュー投稿エラー:", error.message)
      setSubmitMessage("レビューの投稿に失敗しました。")
      setIsSubmitting(false)
      return
    }

    setComment("")
    setRating(5)
    setSubmitMessage("レビューを投稿しました。")

    const { data, error: refetchError } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        user_id,
        profiles (
          username
        )
      `)
      .eq("problem_id", problemId)
      .order("created_at", { ascending: false })

    if (!refetchError) {
      setReviews(normalizeReviews((data ?? []) as unknown as ReviewRow[]))
    }

    setIsSubmitting(false)
  }

  function handleTagClick(tag: string) {
    router.push(`/?q=${encodeURIComponent(tag)}`)
  }

  if (isLoading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: COLORS.paper,
          padding: "48px 0",
        }}
      >
        <div
          style={{
            width: "min(1100px, calc(100vw - 48px))",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.line}`,
              borderRadius: "22px",
              padding: "32px",
              color: COLORS.muted,
              boxShadow: "0 4px 14px rgba(30, 58, 95, 0.08)",
            }}
          >
            読み込み中...
          </div>
        </div>
      </main>
    )
  }

  if (errorMessage || !problem) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: COLORS.paper,
          padding: "48px 0",
        }}
      >
        <div
          style={{
            width: "min(1100px, calc(100vw - 48px))",
            margin: "0 auto",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: COLORS.teal,
              fontSize: "16px",
              fontWeight: 900,
              textDecoration: "none",
              marginBottom: "24px",
            }}
          >
            <BackIcon />
            問題一覧へ戻る
          </Link>

          <div
            style={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.line}`,
              borderRadius: "22px",
              padding: "32px",
              color: COLORS.danger,
              boxShadow: "0 4px 14px rgba(30, 58, 95, 0.08)",
            }}
          >
            {errorMessage ?? "問題が見つかりませんでした。"}
          </div>
        </div>
      </main>
    )
  }

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
          width: "min(1100px, calc(100vw - 48px))",
          margin: "0 auto",
        }}
      >
        {/* =====================================================
          戻る導線・パンくず
        ===================================================== */}
        <nav
          style={{
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: COLORS.teal,
              fontSize: "17px",
              fontWeight: 900,
              textDecoration: "none",
            }}
          >
            <BackIcon />
            問題一覧へ戻る
          </Link>

          <div
            style={{
              color: COLORS.slate,
              fontSize: "15px",
              fontWeight: 700,
            }}
          >
            問ログ / 問題詳細
          </div>
        </nav>

        {/* =====================================================
          問題ヘッダーカード
        ===================================================== */}
        <section
          style={{
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.line}`,
            borderRadius: "24px",
            boxShadow: "0 4px 14px rgba(30, 58, 95, 0.10)",
            padding: "36px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 620px" }}>
              <p
                style={{
                  margin: 0,
                  color: COLORS.teal,
                  fontSize: "14px",
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                }}
              >
                PROBLEM DETAIL
              </p>

              <h1
                style={{
                  margin: "14px 0 0",
                  color: COLORS.navy,
                  fontSize: "40px",
                  lineHeight: 1.35,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                }}
              >
                {problem.title}
              </h1>

              <p
                style={{
                  margin: "18px 0 0",
                  color: COLORS.slate,
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                投稿日: {formatDate(problem.created_at)}
              </p>
            </div>

            <div
              style={{
                flex: "0 0 auto",
                backgroundColor: COLORS.tealPanel,
                borderRadius: "18px",
                padding: "20px 22px",
                minWidth: "230px",
              }}
            >
              <RatingSummary average={average} count={reviews.length} />
            </div>
          </div>

          {problem.tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "30px",
              }}
            >
              {problem.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  style={{
                    border: "none",
                    borderRadius: "999px",
                    backgroundColor: COLORS.tagBg,
                    color: COLORS.tagText,
                    padding: "10px 20px",
                    fontSize: "17px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
          問題本文カード
        ===================================================== */}
        <section
          style={{
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.line}`,
            borderRadius: "24px",
            boxShadow: "0 4px 14px rgba(30, 58, 95, 0.08)",
            padding: "36px",
            marginBottom: "30px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: COLORS.navy,
              fontSize: "28px",
              fontWeight: 900,
            }}
          >
            問題内容
          </h2>

          {problem.content ? (
            <div style={{ marginTop: "24px" }}>
            <ProblemMarkdown content={problem.content} />
            </div>
          ) : (
            <p
              style={{
                margin: "24px 0 0",
                color: COLORS.muted,
                fontSize: "18px",
                lineHeight: 1.8,
              }}
            >
              本文はまだ登録されていません。
            </p>
          )}
        </section>

        {/* =====================================================
          レビュー投稿カード / ログイン誘導カード
        ===================================================== */}
        <section
          style={{
            backgroundColor: userId ? COLORS.tealPanel : COLORS.surface,
            border: `1px solid ${userId ? "#B8DCD5" : COLORS.line}`,
            borderLeft: `6px solid ${userId ? COLORS.teal : COLORS.navy}`,
            borderRadius: "20px",
            padding: "32px 34px",
            marginBottom: "38px",
          }}
        >
          {userId ? (
            <form onSubmit={handleSubmitReview}>
              <h2
                style={{
                  margin: 0,
                  color: COLORS.navy,
                  fontSize: "28px",
                  fontWeight: 900,
                }}
              >
                レビューを書く
              </h2>

              <p
                style={{
                  margin: "10px 0 0",
                  color: COLORS.slate,
                  fontSize: "16px",
                  lineHeight: 1.7,
                }}
              >
                ログイン中: {userEmail}
              </p>

              <div style={{ marginTop: "26px" }}>
                <p
                  style={{
                    margin: "0 0 12px",
                    color: COLORS.navy,
                    fontSize: "17px",
                    fontWeight: 900,
                  }}
                >
                  評価
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      style={{
                        minWidth: "58px",
                        height: "48px",
                        borderRadius: "12px",
                        border: `1px solid ${rating === value ? COLORS.teal : COLORS.lineStrong}`,
                        backgroundColor: rating === value ? COLORS.teal : COLORS.surface,
                        color: rating === value ? "#FFFFFF" : COLORS.navy,
                        fontSize: "18px",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: "14px" }}>
                  <StarRating value={rating} size={22} />
                </div>
              </div>

              <div style={{ marginTop: "24px" }}>
                <label
                  htmlFor="review-comment"
                  style={{
                    display: "block",
                    color: COLORS.navy,
                    fontSize: "17px",
                    fontWeight: 900,
                    marginBottom: "12px",
                  }}
                >
                  コメント
                </label>

                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="この問題の良さ、難しさ、解法の見どころなどを書いてください。"
                  rows={5}
                  style={{
                    width: "100%",
                    resize: "vertical",
                    borderRadius: "16px",
                    border: `1px solid ${COLORS.lineStrong}`,
                    backgroundColor: COLORS.surface,
                    color: COLORS.text,
                    fontSize: "17px",
                    lineHeight: 1.7,
                    padding: "16px 18px",
                    outline: "none",
                  }}
                />
              </div>

              {submitMessage && (
                <p
                  style={{
                    margin: "16px 0 0",
                    color: submitMessage.includes("失敗") ? COLORS.danger : COLORS.teal,
                    fontSize: "15px",
                    fontWeight: 800,
                  }}
                >
                  {submitMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  marginTop: "24px",
                  width: "100%",
                  minHeight: "64px",
                  border: "none",
                  borderRadius: "16px",
                  backgroundColor: COLORS.navy,
                  color: "#FFFFFF",
                  fontSize: "21px",
                  fontWeight: 900,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? "投稿中..." : "レビューを投稿する"}
              </button>
            </form>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "22px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: COLORS.navy,
                    fontSize: "26px",
                    fontWeight: 900,
                  }}
                >
                  レビューを書くにはログインが必要です
                </h2>

                <p
                  style={{
                    margin: "10px 0 0",
                    color: COLORS.slate,
                    fontSize: "16px",
                    lineHeight: 1.7,
                  }}
                >
                  ログインすると、この問題に評価とコメントを投稿できます。
                </p>
              </div>

              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "54px",
                  padding: "0 24px",
                  borderRadius: "14px",
                  backgroundColor: COLORS.navy,
                  color: "#FFFFFF",
                  fontSize: "16px",
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
          レビュー一覧
        ===================================================== */}
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "24px",
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
                レビュー一覧
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  color: COLORS.slate,
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                {reviews.length}件のレビュー
              </p>
            </div>

            <RatingSummary average={average} count={reviews.length} />
          </div>

          {sortedReviews.length === 0 ? (
            <div
              style={{
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.line}`,
                borderRadius: "22px",
                padding: "32px",
                color: COLORS.muted,
                fontSize: "17px",
                lineHeight: 1.8,
                boxShadow: "0 4px 14px rgba(30, 58, 95, 0.08)",
              }}
            >
              まだレビューはありません。最初のレビューを投稿してみましょう。
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "22px",
              }}
            >
              {sortedReviews.map((review) => (
                <article
                  key={review.id}
                  style={{
                    backgroundColor: COLORS.surface,
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: "22px",
                    boxShadow: "0 4px 14px rgba(30, 58, 95, 0.08)",
                    padding: "28px 30px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "18px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          color: COLORS.slate,
                          fontSize: "15px",
                          fontWeight: 800,
                        }}
                      >
                        <UserIcon size={20} />
                        <span>{review.username ?? "匿名ユーザー"}</span>
                      </div>

                      <div style={{ marginTop: "12px" }}>
                        <StarRating value={review.rating} size={19} />
                        <span
                          style={{
                            marginLeft: "10px",
                            color: COLORS.navy,
                            fontSize: "18px",
                            fontWeight: 900,
                          }}
                        >
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        color: COLORS.muted,
                        fontSize: "14px",
                        fontWeight: 700,
                      }}
                    >
                      {formatDate(review.created_at)}
                    </p>
                  </div>

                  {review.comment ? (
                    <p
                      style={{
                        margin: "20px 0 0",
                        color: COLORS.text,
                        fontSize: "18px",
                        lineHeight: 1.85,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {review.comment}
                    </p>
                  ) : (
                    <p
                      style={{
                        margin: "20px 0 0",
                        color: COLORS.muted,
                        fontSize: "16px",
                        lineHeight: 1.8,
                      }}
                    >
                      コメントなし
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
