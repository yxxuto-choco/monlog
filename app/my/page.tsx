"use client"

import Link from "next/link"
import { useMemo } from "react"
import useMyPageData from "@/hooks/useMyPageData"
import MyProblemList from "@/components/my/MyProblemList"
import MyProfileCard from "@/components/my/MyProfileCard"
import MyRatingSummary from "@/components/my/MyRatingSummary"
import MyStatsGrid from "@/components/my/MyStatsGrid"
import PageShell from "@/components/ui/PageShell"
import SectionCard from "@/components/ui/SectionCard"
import MessageBox from "@/components/ui/MessageBox"
import StarRating from "@/components/ui/StarRating"
import { COLORS, RADII } from "@/components/ui/designTokens"

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

function formatDate(value: string | null) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
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

export default function MyPage() {
  const { userId, email, userName, myProblems, myReviews, isLoading, errorMessage } =
    useMyPageData()

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

        <SectionCard style={{ padding: "36px" }}>
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

      <MyProfileCard
        userId={userId}
        email={email}
        userName={userName}
        levelInfo={levelInfo}
        activityScore={activityScore}
      />

      <MyStatsGrid
        postCount={postCount}
        totalReviewCount={totalReviewCount}
        writtenReviewCount={writtenReviewCount}
        roundedWeightedAverage={roundedWeightedAverage}
      />

      <MyRatingSummary
        simpleAverage={simpleAverage}
        weightedAverage={weightedAverage}
        roundedSimpleAverage={roundedSimpleAverage}
        roundedWeightedAverage={roundedWeightedAverage}
      />

      <MyProblemList problems={myProblems} />

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
                      style={{ color: COLORS.navy, textDecoration: "none" }}
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
