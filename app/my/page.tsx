"use client"

import useMyPageData from "@/hooks/useMyPageData"
import useMyPageStats from "@/hooks/useMyPageStats"
import LoginRequiredCard from "@/components/my/LoginRequiredCard"
import MyPageHeader from "@/components/my/MyPageHeader"
import MyProblemList from "@/components/my/MyProblemList"
import MyProfileCard from "@/components/my/MyProfileCard"
import MyRatingSummary from "@/components/my/MyRatingSummary"
import MyReviewList from "@/components/my/MyReviewList"
import MyStatsGrid from "@/components/my/MyStatsGrid"
import PageShell from "@/components/ui/PageShell"
import SectionCard from "@/components/ui/SectionCard"
import MessageBox from "@/components/ui/MessageBox"

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
        <LoginRequiredCard />
      </PageShell>
    )
  }

  return (
    <PageShell wide>
      <MyPageHeader />

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
