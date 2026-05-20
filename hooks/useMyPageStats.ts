"use client"

import { useMemo } from "react"
import type { MyProblem, MyReview } from "@/hooks/useMyPageData"

export type MyLevelInfo = {
  level: number
  title: string
  min: number
  next: number | null
  progress: number
  remaining: number
  maxLevel: boolean
}

function getLevelInfo(activityScore: number): MyLevelInfo {
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

export default function useMyPageStats(myProblems: MyProblem[], myReviews: MyReview[]) {
  return useMemo(() => {
    const postCount = myProblems.length
    const writtenReviewCount = myReviews.length

    const simpleAverage =
      postCount === 0
        ? 0
        : myProblems.reduce((sum, problem) => sum + problem.average, 0) / postCount

    const totalReviewCount = myProblems.reduce((sum, problem) => sum + problem.reviewCount, 0)
    const totalRatingSum = myProblems.reduce((sum, problem) => sum + problem.ratingSum, 0)
    const weightedAverage = totalReviewCount === 0 ? 0 : totalRatingSum / totalReviewCount

    const roundedSimpleAverage = Math.floor(simpleAverage * 10) / 10
    const roundedWeightedAverage = Math.floor(weightedAverage * 10) / 10

    const activityScore = postCount * 10 + writtenReviewCount * 5 + totalReviewCount * 3
    const levelInfo = getLevelInfo(activityScore)

    return {
      postCount,
      writtenReviewCount,
      totalReviewCount,
      simpleAverage,
      weightedAverage,
      roundedSimpleAverage,
      roundedWeightedAverage,
      activityScore,
      levelInfo,
    }
  }, [myProblems, myReviews])
}
