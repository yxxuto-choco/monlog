"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export type MyProblem = {
  id: string
  title: string
  content: string | null
  created_at: string
  tags: string[]
  average: number
  reviewCount: number
  ratingSum: number
}

export type MyReview = {
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

export default function useMyPageData() {
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [myProblems, setMyProblems] = useState<MyProblem[]>([])
  const [myReviews, setMyReviews] = useState<MyReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

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
      (problem) => {
        const reviews = problem.reviews ?? []
        const ratings = reviews
          .map((review) => Number(review.rating))
          .filter((rating) => Number.isFinite(rating))

        const reviewCount = ratings.length
        const ratingSum = ratings.reduce((sum, rating) => sum + rating, 0)
        const average = reviewCount === 0 ? 0 : ratingSum / reviewCount

        return {
          id: problem.id,
          title: problem.title,
          content: problem.content,
          created_at: problem.created_at,
          tags: extractTagNames(problem.problem_tags),
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

  useEffect(() => {
    fetchMyPageData()
  }, [])

  return {
    userId,
    email,
    userName,
    myProblems,
    myReviews,
    isLoading,
    errorMessage,
    reloadMyPageData: fetchMyPageData,
  }
}
