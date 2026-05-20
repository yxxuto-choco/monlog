"use client"

import Link from "next/link"
import { useMemo } from "react"
import useMyPageData from "@/hooks/useMyPageData"
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

function formatDate(value: string | null) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

function truncateText(text: string | null, length: number) {
  if (!text) return ""
  return text.length > length ? `${text.slice(0, length)}...` : text
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
                <SectionCard key={problem.id} style={{ padding: "28px 30px" }}>
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
                        style={{ color: COLORS.navy, textDecoration: "none" }}
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
