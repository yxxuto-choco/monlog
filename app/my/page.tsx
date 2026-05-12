"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import RandomPixelAvatar from "@/components/RandomPixelAvatar"
import PageShell from "@/components/ui/PageShell"
import SectionCard from "@/components/ui/SectionCard"
import MessageBox from "@/components/ui/MessageBox"
import StarRating from "@/components/ui/StarRating"
import { COLORS, RADII, SHADOWS } from "@/components/ui/designTokens"

/* =========================================================
  型定義
========================================================= */
type MyProblem = {
  id: string
  title: string
  content: string | null
  created_at: string
  tags: string[]
  average: number
  reviewCount: number
  ratingSum: number
}

type MyReview = {
  id: string
  problem_id: string
  problem_title: string
  rating: number
  comment: string | null
  created_at: string
}

type TagRow = {
  name: string | null
}

type ProblemTagRow = {
  tags: TagRow | TagRow[] | null
}

type ReviewRatingRow = {
  rating: number | string | null
}

type ProblemRow = {
  id: string
  title: string
  content: string | null
  created_at: string
  problem_tags: ProblemTagRow[] | null
  reviews: ReviewRatingRow[] | null
}

type ReviewRow = {
  id: string
  problem_id: string
  rating: number | string | null
  comment: string | null
  created_at: string
  problems: { title: string | null } | { title: string | null }[] | null
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

function PenIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* =========================================================
  補助関数
========================================================= */
function formatDate(value: string | null) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

function truncateText(text: string | null, length: number) {
  if (!text) return ""
  return text.length > length ? `${text.slice(0, length)}...` : text
}

function getProblemTitle(problems: ReviewRow["problems"]): string {
  if (Array.isArray(problems)) {
    return problems[0]?.title ?? "問題タイトル不明"
  }

  return problems?.title ?? "問題タイトル不明"
}

function extractTagNames(problemTags: ProblemTagRow[] | null): string[] {
  return (problemTags ?? [])
    .map((pt) => {
      const tags = pt.tags
      const tag = Array.isArray(tags) ? tags[0] : tags
      return tag?.name ?? ""
    })
    .filter(Boolean)
}

function getLevelInfo(activityScore: number) {
  const levels = [
    { level: 1, title: "はじめの投稿者", min: 0, next: 50 },
    { level: 2, title: "問題探索者", min: 50, next: 130 },
    { level: 3, title: "レビュー職人", min: 130, next: 260 },
    { level: 4, title: "数学案内人", min: 260, next: 460 },
    { level: 5, title: "問ログマスター", min: 460, next: null },
  ]

  const current = [...levels].reverse().find((item) => activityScore >= item.min) ?? levels[0]

  if (current.next === null) {
    return {
      ...current,
      progress: 100,
      remaining: 0,
      maxLevel: true,
    }
  }

  const span = current.next - current.min
  const progress = Math.max(0, Math.min(100, ((activityScore - current.min) / span) * 100))
  const remaining = Math.max(0, current.next - activityScore)

  return {
    ...current,
    progress,
    remaining,
    maxLevel: false,
  }
}

/* =========================================================
  小部品
========================================================= */
function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <SectionCard
      style={{
        padding: "22px 24px",
      }}
    >
      <p
        style={{
          margin: 0,
          color: COLORS.slate,
          fontSize: "14px",
          fontWeight: 900,
        }}
      >
        {label}
      </p>

      <div
        style={{
          marginTop: "10px",
          color: COLORS.navy,
          fontSize: "34px",
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: "-0.03em",
        }}
      >
        {value}
      </div>

      {sub && (
        <p
          style={{
            margin: "10px 0 0",
            color: COLORS.muted,
            fontSize: "13px",
            fontWeight: 700,
            lineHeight: 1.6,
          }}
        >
          {sub}
        </p>
      )}
    </SectionCard>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <SectionCard
      style={{
        padding: "32px",
        color: COLORS.muted,
        fontSize: "16px",
        lineHeight: 1.8,
      }}
    >
      {children}
    </SectionCard>
  )
}

/* =========================================================
  マイページ
========================================================= */
export default function MyPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  const [myProblems, setMyProblems] = useState<MyProblem[]>([])
  const [myReviews, setMyReviews] = useState<MyReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function fetchMyPageData() {
      setIsLoading(true)
      setErrorMessage("")

      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        setUserId(null)
        setEmail(null)
        setUserName(null)
        setMyProblems([])
        setMyReviews([])
        setIsLoading(false)
        return
      }

      const user = userData.user
      setUserId(user.id)
      setEmail(user.email ?? null)

      const { data: profileData } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle()

      setUserName(profileData?.username ?? null)

      const { data: problemsData, error: problemsError } = await supabase
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
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (problemsError) {
        console.warn("自分の投稿取得エラー:", problemsError.message)
        setErrorMessage("自分の投稿一覧の取得に失敗しました。")
        setIsLoading(false)
        return
      }

      const nextProblems: MyProblem[] = ((problemsData ?? []) as unknown as ProblemRow[]).map(
        (p) => {
          const reviews = p.reviews ?? []
          const ratings = reviews
            .map((r) => Number(r.rating))
            .filter((rating) => Number.isFinite(rating))

          const reviewCount = ratings.length
          const ratingSum = ratings.reduce((sum, rating) => sum + rating, 0)
          const average = reviewCount === 0 ? 0 : ratingSum / reviewCount

          return {
            id: p.id,
            title: p.title,
            content: p.content,
            created_at: p.created_at,
            tags: extractTagNames(p.problem_tags),
            average,
            reviewCount,
            ratingSum,
          }
        }
      )

      setMyProblems(nextProblems)

      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          id,
          problem_id,
          rating,
          comment,
          created_at,
          problems (
            title
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (reviewsError) {
        console.warn("自分のレビュー取得エラー:", reviewsError.message)
        setErrorMessage("自分のレビュー一覧の取得に失敗しました。")
        setIsLoading(false)
        return
      }

      const nextReviews: MyReview[] = ((reviewsData ?? []) as unknown as ReviewRow[])
        .map((review) => ({
          id: review.id,
          problem_id: review.problem_id,
          problem_title: getProblemTitle(review.problems),
          rating: Number(review.rating),
          comment: review.comment,
          created_at: review.created_at,
        }))
        .filter((review) => Number.isFinite(review.rating))

      setMyReviews(nextReviews)
      setIsLoading(false)
    }

    fetchMyPageData()
  }, [])

  const postCount = myProblems.length

  const simpleAverage = useMemo(() => {
    if (postCount === 0) return 0
    return myProblems.reduce((sum, problem) => sum + problem.average, 0) / postCount
  }, [myProblems, postCount])

  const totalReviewCount = myProblems.reduce((sum, problem) => sum + problem.reviewCount, 0)
  const totalRatingSum = myProblems.reduce((sum, problem) => sum + problem.ratingSum, 0)
  const weightedAverage = totalReviewCount === 0 ? 0 : totalRatingSum / totalReviewCount

  const roundedSimpleAverage = Math.floor(simpleAverage * 10) / 10
  const roundedWeightedAverage = Math.floor(weightedAverage * 10) / 10

  const writtenReviewCount = myReviews.length
  const activityScore = postCount * 10 + writtenReviewCount * 5 + totalReviewCount * 3
  const levelInfo = getLevelInfo(activityScore)

  if (isLoading) {
    return (
      <PageShell wide>
        <SectionCard>読み込み中...</SectionCard>
      </PageShell>
    )
  }

  if (!userId) {
    return (
      <PageShell>
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
          トップへ戻る
        </Link>

        <SectionCard
          style={{
            padding: "36px",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: COLORS.navy,
              fontSize: "36px",
              fontWeight: 900,
            }}
          >
            マイページを見るにはログインが必要です
          </h1>

          <p
            style={{
              margin: "16px 0 0",
              color: COLORS.slate,
              fontSize: "17px",
              lineHeight: 1.8,
              fontWeight: 600,
            }}
          >
            ログインすると、自分の投稿・レビュー・活動スコアを確認できます。
          </p>

          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "56px",
              padding: "0 24px",
              marginTop: "28px",
              borderRadius: RADII.md,
              backgroundColor: COLORS.navy,
              color: "#FFFFFF",
              textDecoration: "none",
              fontSize: "17px",
              fontWeight: 900,
            }}
          >
            ログイン / 新規登録
          </Link>
        </SectionCard>
      </PageShell>
    )
  }

  return (
    <PageShell wide>
      {/* =====================================================
        戻る導線
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
          トップへ戻る
        </Link>

        <div
          style={{
            color: COLORS.slate,
            fontSize: "15px",
            fontWeight: 700,
          }}
        >
          問ログ / マイページ
        </div>
      </nav>

      {/* =====================================================
        ページヘッダー
      ===================================================== */}
      <header
        style={{
          textAlign: "center",
          marginBottom: "34px",
        }}
      >
        <h1
          style={{
            margin: 0,
            color: COLORS.navy,
            fontSize: "48px",
            lineHeight: 1.15,
            fontWeight: 900,
            letterSpacing: "-0.04em",
          }}
        >
          マイページ
        </h1>

        <p
          style={{
            margin: "18px 0 0",
            color: COLORS.slate,
            fontSize: "18px",
            lineHeight: 1.8,
            fontWeight: 600,
          }}
        >
          自分の投稿・レビュー・活動の蓄積を確認する。
        </p>
      </header>

      {errorMessage && <MessageBox type="error">{errorMessage}</MessageBox>}

      {/* =====================================================
        プロフィールカード
      ===================================================== */}
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

      {/* =====================================================
        活動サマリー
      ===================================================== */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "18px",
          marginBottom: "34px",
        }}
      >
        <StatCard label="投稿問題数" value={postCount} sub="あなたが投稿した問題数" />
        <StatCard label="受け取ったレビュー数" value={totalReviewCount} sub="自分の投稿に付いたレビュー" />
        <StatCard label="自分が書いたレビュー" value={writtenReviewCount} sub="他の問題へのレビュー数" />
        <StatCard
          label="加重平均評価"
          value={roundedWeightedAverage.toFixed(1)}
          sub="全レビューをまとめた平均"
        />
      </section>

      {/* =====================================================
        評価サマリー
      ===================================================== */}
      <SectionCard
        style={{
          padding: "28px 30px",
          marginBottom: "36px",
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
          評価サマリー
        </h2>

        <div
          style={{
            marginTop: "22px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          <SectionCard
            variant="yellow"
            style={{
              padding: "22px",
              borderRadius: RADII.lg,
              boxShadow: "none",
            }}
          >
            <p
              style={{
                margin: 0,
                color: COLORS.slate,
                fontSize: "14px",
                fontWeight: 900,
              }}
            >
              単純平均評価
            </p>

            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
              <StarRating value={simpleAverage} size={20} />
              <span style={{ color: COLORS.navy, fontSize: "24px", fontWeight: 900 }}>
                {roundedSimpleAverage.toFixed(1)}
              </span>
            </div>

            <p
              style={{
                margin: "12px 0 0",
                color: COLORS.muted,
                fontSize: "13px",
                lineHeight: 1.7,
                fontWeight: 700,
              }}
            >
              各投稿問題の平均評価を、投稿数で割った値。
            </p>
          </SectionCard>

          <SectionCard
            variant="teal"
            style={{
              padding: "22px",
              borderRadius: RADII.lg,
            }}
          >
            <p
              style={{
                margin: 0,
                color: COLORS.slate,
                fontSize: "14px",
                fontWeight: 900,
              }}
            >
              加重平均評価
            </p>

            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
              <StarRating value={weightedAverage} size={20} />
              <span style={{ color: COLORS.navy, fontSize: "24px", fontWeight: 900 }}>
                {roundedWeightedAverage.toFixed(1)}
              </span>
            </div>

            <p
              style={{
                margin: "12px 0 0",
                color: COLORS.muted,
                fontSize: "13px",
                lineHeight: 1.7,
                fontWeight: 700,
              }}
            >
              すべてのレビュー評価をまとめて計算した値。
            </p>
          </SectionCard>
        </div>
      </SectionCard>

      {/* =====================================================
        自分の投稿一覧
      ===================================================== */}
      <section style={{ marginBottom: "42px" }}>
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
              自分の投稿
            </h2>

            <p
              style={{
                margin: "8px 0 0",
                color: COLORS.slate,
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              投稿した問題の評価とレビュー状況
            </p>
          </div>

          <Link
            href="/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              minHeight: "48px",
              padding: "0 18px",
              borderRadius: RADII.md,
              backgroundColor: COLORS.teal,
              color: "#FFFFFF",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: 900,
            }}
          >
            <PenIcon size={18} />
            問題を投稿する
          </Link>
        </div>

        {myProblems.length === 0 ? (
          <EmptyState>まだ投稿した問題はありません。まずは1問投稿してみましょう。</EmptyState>
        ) : (
          <div style={{ display: "grid", gap: "22px" }}>
            {myProblems.map((problem) => {
              const roundedAverage = Math.floor(problem.average * 10) / 10

              return (
                <SectionCard
                  key={problem.id}
                  style={{
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
                    <div style={{ flex: "1 1 560px" }}>
                      <Link
                        href={`/problems/${problem.id}`}
                        style={{
                          color: COLORS.navy,
                          textDecoration: "none",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            color: COLORS.navy,
                            fontSize: "24px",
                            lineHeight: 1.45,
                            fontWeight: 900,
                          }}
                        >
                          {problem.title}
                        </h3>
                      </Link>

                      <p
                        style={{
                          margin: "12px 0 0",
                          color: COLORS.slate,
                          fontSize: "15px",
                          fontWeight: 700,
                        }}
                      >
                        投稿日: {formatDate(problem.created_at)}
                      </p>

                      {problem.content && (
                        <p
                          style={{
                            margin: "16px 0 0",
                            color: COLORS.text,
                            fontSize: "16px",
                            lineHeight: 1.8,
                          }}
                        >
                          {truncateText(problem.content, 120)}
                        </p>
                      )}
                    </div>

                    <SectionCard
                      variant="teal"
                      style={{
                        minWidth: "180px",
                        padding: "16px",
                        borderRadius: "16px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <StarRating value={problem.average} size={18} />
                        <span style={{ color: COLORS.navy, fontSize: "19px", fontWeight: 900 }}>
                          {roundedAverage.toFixed(1)}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: "10px 0 0",
                          color: COLORS.slate,
                          fontSize: "14px",
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                        }}
                      >
                        <CommentIcon size={18} />
                        {problem.reviewCount}件
                      </p>
                    </SectionCard>
                  </div>

                  {problem.tags.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                        marginTop: "20px",
                      }}
                    >
                      {problem.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/?q=${encodeURIComponent(tag)}`}
                          style={{
                            borderRadius: RADII.pill,
                            backgroundColor: COLORS.tagBg,
                            color: COLORS.tagText,
                            padding: "8px 16px",
                            fontSize: "14px",
                            fontWeight: 900,
                            textDecoration: "none",
                          }}
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/problems/${problem.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      minHeight: "54px",
                      marginTop: "22px",
                      borderRadius: RADII.md,
                      backgroundColor: COLORS.navy,
                      color: "#FFFFFF",
                      textDecoration: "none",
                      fontSize: "16px",
                      fontWeight: 900,
                    }}
                  >
                    詳細を見る
                  </Link>
                </SectionCard>
              )
            })}
          </div>
        )}
      </section>

      {/* =====================================================
        自分が書いたレビュー一覧
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
              自分が書いたレビュー
            </h2>

            <p
              style={{
                margin: "8px 0 0",
                color: COLORS.slate,
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              他の問題に残した評価とコメント
            </p>
          </div>
        </div>

        {myReviews.length === 0 ? (
          <EmptyState>まだレビューを書いていません。気になる問題にレビューを残してみましょう。</EmptyState>
        ) : (
          <div style={{ display: "grid", gap: "18px" }}>
            {myReviews.map((review) => (
              <SectionCard
                key={review.id}
                style={{
                  padding: "24px 26px",
                  borderRadius: "20px",
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
                  <div>
                    <Link
                      href={`/problems/${review.problem_id}`}
                      style={{
                        color: COLORS.navy,
                        textDecoration: "none",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          color: COLORS.navy,
                          fontSize: "20px",
                          lineHeight: 1.45,
                          fontWeight: 900,
                        }}
                      >
                        {review.problem_title}
                      </h3>
                    </Link>

                    <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <StarRating value={review.rating} size={18} />
                      <span style={{ color: COLORS.navy, fontSize: "17px", fontWeight: 900 }}>
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
                      fontSize: "16px",
                      lineHeight: 1.8,
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
              </SectionCard>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}