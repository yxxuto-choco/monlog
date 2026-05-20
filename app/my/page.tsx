"use client"

import Link from "next/link"
import useMyPageData from "@/hooks/useMyPageData"
import useMyPageStats from "@/hooks/useMyPageStats"
import MyProblemList from "@/components/my/MyProblemList"
import MyProfileCard from "@/components/my/MyProfileCard"
import MyRatingSummary from "@/components/my/MyRatingSummary"
import MyReviewList from "@/components/my/MyReviewList"
import MyStatsGrid from "@/components/my/MyStatsGrid"
import PageShell from "@/components/ui/PageShell"
import SectionCard from "@/components/ui/SectionCard"
import MessageBox from "@/components/ui/MessageBox"
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

export default function MyPage() {
  const { userId, email, userName, myProblems, myReviews, isLoading, errorMessage } =
    useMyPageData()
  const {
    postCount,
    writtenReviewCount,
    totalReviewCount,
    simpleAverage,
    weightedAverage,
    roundedSimpleAverage,
    roundedWeightedAverage,
    activityScore,
    levelInfo,
  } = useMyPageStats(myProblems, myReviews)

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

      <MyReviewList reviews={myReviews} />
    </PageShell>
  )
}
