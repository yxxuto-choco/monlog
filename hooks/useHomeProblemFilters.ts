"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { HomeProblem, ReviewStats } from "@/hooks/useHomeProblems"

type SortMode = "default" | "popular"

export default function useHomeProblemFilters(
  problems: HomeProblem[],
  stats: Record<string, ReviewStats>
) {
  const [sortMode, setSortMode] = useState<SortMode>("default")
  const [query, setQuery] = useState("")
  const [expandedProblemIds, setExpandedProblemIds] = useState<string[]>([])

  const router = useRouter()

  useEffect(() => {
    const applyQueryFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      setQuery(params.get("q") ?? "")
    }

    applyQueryFromUrl()
    window.addEventListener("popstate", applyQueryFromUrl)

    return () => {
      window.removeEventListener("popstate", applyQueryFromUrl)
    }
  }, [])

  function toggleProblem(problemId: string) {
    setExpandedProblemIds((current) =>
      current.includes(problemId)
        ? current.filter((id) => id !== problemId)
        : [...current, problemId]
    )
  }

  function isExpanded(problemId: string) {
    return expandedProblemIds.includes(problemId)
  }

  function clearQuery() {
    setQuery("")
    router.push("/")
  }

  function selectTag(tag: string) {
    setQuery(tag)
    router.push(`/?q=${encodeURIComponent(tag)}`)
  }

  const filteredProblems = [...problems]
    .filter((problem) => {
      const keyword = query.trim().toLowerCase()
      if (!keyword) return true

      return (
        problem.title.toLowerCase().includes(keyword) ||
        (problem.content ?? "").toLowerCase().includes(keyword) ||
        problem.tags.some((tag) => tag.toLowerCase().includes(keyword))
      )
    })
    .sort((a, b) => {
      if (sortMode === "default") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }

      const aAverage = stats[a.id]?.average ?? 0
      const bAverage = stats[b.id]?.average ?? 0

      if (bAverage !== aAverage) return bAverage - aAverage

      const aCount = stats[a.id]?.count ?? 0
      const bCount = stats[b.id]?.count ?? 0
      return bCount - aCount
    })

  return {
    sortMode,
    setSortMode,
    query,
    setQuery,
    filteredProblems,
    isExpanded,
    toggleProblem,
    clearQuery,
    selectTag,
  }
}
