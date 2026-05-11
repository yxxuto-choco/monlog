"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ProblemMarkdown from "@/components/ProblemMarkdown"
import UserMiniBadge from "@/components/UserMiniBadge"

/* =========================================================
  問ログ Design System
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
  success: "#2A9D8F",
  softYellow: "#FBF8EF",
}

/* =========================================================
  型定義
========================================================= */
type TagRow = {
  name: string | null
}

type ProblemTagRow = {
  tags: TagRow | TagRow[] | null
}

type ReviewRow = {
  id: string
  rating: number | string | null
  comment: string | null
  created_at: string | null
  user_id?: string | null
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

type Problem = {
  id: string
  title: string
  content: string | null
  created_at: string
  user_id: string | null
  tags: string[]
}

type Review = {
  id: string
  rating: number
  comment: string | null
  created_at: string | null
  user_id?: string | null
}

/* =========================================================
  アイコン
========================================================= */
function BackIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

/* =========================================================
  星評価
========================================================= */
function StarRating({ value, size = 22 }: { value: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px", verticalAlign: "middle" }}>
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

function formatDate(value: string | null) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

function getProblemId(paramsId: string | string[] | undefined) {
  if (Array.isArray(paramsId)) return paramsId[0]
  return paramsId ?? ""
}

/* =========================================================
  詳細ページ
========================================================= */
export default function ProblemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const problemId = getProblemId(params.id as string | string[] | undefined)

  const [problem, setProblem] = useState<Problem | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  const [rating, setRating] = useState("5")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  async function fetchProblem() {
    if (!problemId) return

    setIsLoading(true)
    setErrorMessage("")

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
          id,
          rating,
          comment,
          created_at,
          user_id
        )
      `)
      .eq("id", problemId)
      .maybeSingle()

    if (error) {
      console.error("問題詳細取得エラー:", error.message)
      setErrorMessage("問題詳細の取得に失敗しました。")
      setIsLoading(false)
      return
    }

    if (!data) {
      setProblem(null)
      setReviews([])
      setErrorMessage("問題が見つかりませんでした。")
      setIsLoading(false)
      return
    }

    const row = data as unknown as ProblemRow

    setProblem({
      id: row.id,
      title: row.title,
      content: row.content,
      created_at: row.created_at,
      user_id: row.user_id,
      tags: extractTagNames(row.problem_tags),
    })

    const nextReviews: Review[] = (row.reviews ?? [])
      .map((review) => ({
        id: review.id,
        rating: Number(review.rating),
        comment: review.comment,
        created_at: review.created_at,
        user_id: review.user_id,
      }))
      .filter((review) => Number.isFinite(review.rating))
      .sort((a, b) => {
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
        return bTime - aTime
      })

    setReviews(nextReviews)
    setIsLoading(false)
  }

  useEffect(() => {
    loadUserAndProfile()
    fetchProblem()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUserAndProfile()
    })

    return () => {
      listener.subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId])

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }, [reviews])

  const roundedAverage = Math.floor(averageRating * 10) / 10

  async function handleSubmitReview() {
    setErrorMessage("")
    setSuccessMessage("")

    if (!problem) return

    const parsedRating = Number(rating)

    if (
      !Number.isFinite(parsedRating) ||
      !Number.isInteger(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      setErrorMessage("評価は1〜5の整数で選択してください。")
      return
    }

    if (!comment.trim()) {
      setErrorMessage("コメントを入力してください。")
      return
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      setErrorMessage("レビューするにはログインが必要です。")
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase.from("reviews").insert({
      problem_id: problem.id,
      user_id: userData.user.id,
      rating: parsedRating,
      comment: comment.trim(),
    })

    if (error) {
      console.error("レビュー投稿エラー:", error.message)
      setErrorMessage(`レビュー投稿に失敗しました：${error.message}`)
      setIsSubmitting(false)
      return
    }

    setComment("")
    setRating("5")
    setSuccessMessage("レビューを投稿しました。")
    setIsSubmitting(false)

    await fetchProblem()
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
        <div style={{ width: "min(980px, calc(100vw - 48px))", margin: "0 auto" }}>
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

  if (!problem) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: COLORS.paper,
          padding: "48px 0",
        }}
      >
        <div style={{ width: "min(980px, calc(100vw - 48px))", margin: "0 auto" }}>
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
              marginBottom: "28px",
            }}
          >
            <BackIcon />
            一覧へ戻る
          </Link>

          <div
            style={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.line}`,
              borderRadius: "22px",
              padding: "32px",
              color: COLORS.danger,
              boxShadow: "0 4px 14px rgba(30, 58, 95, 0.08)",
              fontWeight: 900,
            }}
          >
            {errorMessage || "問題が見つかりませんでした。"}
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
          width: "min(980px, calc(100vw - 48px))",
          margin: "0 auto",
        }}
      >
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
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: COLORS.teal,
              fontSize: "17px",
              fontWeight: 900,
              textDecoration: "none",
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <BackIcon />
            戻る
          </button>

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

        <section
          style={{
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.line}`,
            borderRadius: "26px",
            padding: "36px",
            boxShadow: "0 4px 14px rgba(30, 58, 95, 0.10)",
            marginBottom: "28px",
          }}
        >
          {problem.user_id && (
            <div style={{ marginBottom: "24px" }}>
              <UserMiniBadge userId={problem.user_id} size="md" showEmail={false} />
            </div>
          )}

          <h1
            style={{
              margin: 0,
              color: COLORS.navy,
              fontSize: "40px",
              lineHeight: 1.35,
              fontWeight: 900,
              letterSpacing: "-0.03em",
            }}
          >
            {problem.title}
          </h1>

          <div
            style={{
              marginTop: "22px",
              display: "flex",
              alignItems: "center",
              gap: "18px",
              flexWrap: "wrap",
              color: COLORS.slate,
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            <span>投稿日: {formatDate(problem.created_at)}</span>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <StarRating value={averageRating} size={22} />
              <strong style={{ color: COLORS.navy, fontSize: "22px" }}>
                {roundedAverage.toFixed(1)}
              </strong>
            </span>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
              }}
            >
              <CommentIcon size={21} />
              {reviews.length}件
            </span>
          </div>

          {problem.tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "24px",
              }}
            >
              {problem.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/?q=${encodeURIComponent(tag)}`}
                  style={{
                    borderRadius: "999px",
                    backgroundColor: COLORS.tagBg,
                    color: COLORS.tagText,
                    padding: "9px 18px",
                    fontSize: "15px",
                    fontWeight: 900,
                    textDecoration: "none",
                  }}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </section>

        <section
          style={{
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.line}`,
            borderRadius: "24px",
            padding: "34px 36px",
            boxShadow: "0 4px 14px rgba(30, 58, 95, 0.08)",
            marginBottom: "28px",
          }}
        >
          <h2
            style={{
              margin: "0 0 22px",
              color: COLORS.navy,
              fontSize: "28px",
              fontWeight: 900,
            }}
          >
            問題内容
          </h2>

          {problem.content ? (
            <ProblemMarkdown content={problem.content} />
          ) : (
            <p
              style={{
                margin: 0,
                color: COLORS.muted,
                fontSize: "17px",
                lineHeight: 1.8,
              }}
            >
              本文はまだ登録されていません。
            </p>
          )}
        </section>

        <section
          style={{
            backgroundColor: COLORS.tealPanel,
            border: "1px solid #B8DCD5",
            borderLeft: `6px solid ${COLORS.teal}`,
            borderRadius: "22px",
            padding: "30px 34px",
            marginBottom: "32px",
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
            レビューを書く
          </h2>

          {userId ? (
            <>
              <div
                style={{
                  marginTop: "18px",
                  marginBottom: "22px",
                  padding: "16px 18px",
                  borderRadius: "18px",
                  backgroundColor: COLORS.surface,
                  border: `1px solid ${COLORS.line}`,
                }}
              >
                <UserMiniBadge
                  userId={userId}
                  email={userEmail}
                  userName={userName}
                  size="md"
                  showEmail
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    color: COLORS.navy,
                    fontSize: "16px",
                    fontWeight: 900,
                    marginBottom: "8px",
                  }}
                >
                  評価
                </label>

                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  style={{
                    width: "160px",
                    height: "48px",
                    borderRadius: "12px",
                    border: `1px solid ${COLORS.lineStrong}`,
                    backgroundColor: COLORS.surface,
                    color: COLORS.navy,
                    fontSize: "17px",
                    fontWeight: 900,
                    padding: "0 12px",
                    outline: "none",
                  }}
                >
                  <option value="5">5</option>
                  <option value="4">4</option>
                  <option value="3">3</option>
                  <option value="2">2</option>
                  <option value="1">1</option>
                </select>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    color: COLORS.navy,
                    fontSize: "16px",
                    fontWeight: 900,
                    marginBottom: "8px",
                  }}
                >
                  コメント
                </label>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  placeholder="解法の美しさ、難易度、学習効果などをレビューしてください。"
                  style={{
                    width: "100%",
                    resize: "vertical",
                    borderRadius: "16px",
                    border: `1px solid ${COLORS.lineStrong}`,
                    backgroundColor: COLORS.surface,
                    color: COLORS.text,
                    fontSize: "17px",
                    lineHeight: 1.8,
                    padding: "16px 18px",
                    outline: "none",
                  }}
                />
              </div>

              {(errorMessage || successMessage) && (
                <div
                  style={{
                    marginBottom: "18px",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    backgroundColor: errorMessage ? "#FEF2F2" : COLORS.softYellow,
                    border: `1px solid ${errorMessage ? "#FCA5A5" : COLORS.line}`,
                    color: errorMessage ? COLORS.danger : COLORS.success,
                    fontSize: "15px",
                    fontWeight: 900,
                  }}
                >
                  {errorMessage || successMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  minHeight: "62px",
                  border: "none",
                  borderRadius: "14px",
                  backgroundColor: COLORS.navy,
                  color: "#FFFFFF",
                  fontSize: "20px",
                  fontWeight: 900,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? "投稿中..." : "レビューを投稿する"}
              </button>
            </>
          ) : (
            <div
              style={{
                marginTop: "18px",
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.line}`,
                borderRadius: "18px",
                padding: "24px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: COLORS.slate,
                  fontSize: "16px",
                  lineHeight: 1.8,
                  fontWeight: 700,
                }}
              >
                レビューを書くにはログインが必要です。
              </p>

              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "50px",
                  padding: "0 20px",
                  marginTop: "18px",
                  borderRadius: "14px",
                  backgroundColor: COLORS.navy,
                  color: "#FFFFFF",
                  textDecoration: "none",
                  fontSize: "16px",
                  fontWeight: 900,
                }}
              >
                ログイン / 新規登録
              </Link>
            </div>
          )}
        </section>

        <section>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "22px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: COLORS.navy,
                  fontSize: "30px",
                  fontWeight: 900,
                }}
              >
                レビュー一覧
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  color: COLORS.slate,
                  fontSize: "15px",
                  fontWeight: 700,
                }}
              >
                {reviews.length}件のレビュー
              </p>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div
              style={{
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.line}`,
                borderRadius: "22px",
                padding: "30px",
                color: COLORS.muted,
                fontSize: "16px",
                lineHeight: 1.8,
                boxShadow: "0 4px 14px rgba(30, 58, 95, 0.08)",
              }}
            >
              まだレビューはありません。最初のレビューを書いてみましょう。
            </div>
          ) : (
            <div style={{ display: "grid", gap: "18px" }}>
              {reviews.map((review) => (
                <article
                  key={review.id}
                  style={{
                    backgroundColor: COLORS.surface,
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: "20px",
                    padding: "24px 26px",
                    boxShadow: "0 4px 14px rgba(30, 58, 95, 0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                      }}
                    >
                      {review.user_id && (
                        <UserMiniBadge userId={review.user_id} size="sm" showEmail={false} />
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <StarRating value={review.rating} size={20} />
                        <span
                          style={{
                            color: COLORS.navy,
                            fontSize: "20px",
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
                        margin: "18px 0 0",
                        color: COLORS.text,
                        fontSize: "17px",
                        lineHeight: 1.8,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {review.comment}
                    </p>
                  ) : (
                    <p
                      style={{
                        margin: "18px 0 0",
                        color: COLORS.muted,
                        fontSize: "15px",
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