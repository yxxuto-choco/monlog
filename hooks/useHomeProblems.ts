"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export type HomeProblem = {
  id: string
  title: string
  content: string | null
  tags: string[]
  created_at: string
  user_id: string | null
}

export type RepresentativeReview = {
  rating: number
  comment: string
  created_at: string | null
  user_id: string | null
}

export type ReviewStats = {
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

export default function useHomeProblems() {
  const [problems, setProblems] = useState<HomeProblem[]>([])
  const [stats, setStats] = useState<Record<string, ReviewStats>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

    const nextProblems: HomeProblem[] = rows.map((p) => ({
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

  useEffect(() => {
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

  return {
    problems,
    stats,
    isLoading,
    errorMessage,
    reloadProblems: fetchProblems,
  }
}
