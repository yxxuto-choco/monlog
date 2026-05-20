"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import useCurrentProfile from "@/hooks/useCurrentProfile"
import useHomeProblems from "@/hooks/useHomeProblems"
import PageShell from "@/components/ui/PageShell"
import HomeHero from "@/components/home/HomeHero"
import HomeLoginBar from "@/components/home/HomeLoginBar"
import HomeProblemListSection from "@/components/home/HomeProblemListSection"
import HomeSearchPanel from "@/components/home/HomeSearchPanel"
import HomeStatsBar from "@/components/home/HomeStatsBar"

export default function Home() {
  const [sortMode, setSortMode] = useState<"default" | "popular">("default")
  const [query, setQuery] = useState("")
  const [expandedProblemIds, setExpandedProblemIds] = useState<string[]>([])

  const router = useRouter()
  const { userId, userEmail, userName } = useCurrentProfile()
  const { problems, stats, isLoading, errorMessage } = useHomeProblems()

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

  async function handleLogout() {
    await supabase.auth.signOut()
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

  const totalReviews = Object.values(stats).reduce((sum, stat) => sum + stat.count, 0)

  return (
    <PageShell wide>
      <HomeHero />

      <HomeLoginBar
        userId={userId}
        userEmail={userEmail}
        userName={userName}
        onLogout={handleLogout}
      />

      <HomeStatsBar
        problemCount={problems.length}
        reviewCount={totalReviews}
        visibleCount={filteredProblems.length}
      />

      <HomeSearchPanel
        sortMode={sortMode}
        onSortModeChange={setSortMode}
        query={query}
        onQueryChange={setQuery}
        onClearQuery={() => {
          setQuery("")
          router.push("/")
        }}
      />

      <HomeProblemListSection
        problems={filteredProblems}
        stats={stats}
        sortMode={sortMode}
        isLoading={isLoading}
        errorMessage={errorMessage}
        isExpanded={isExpanded}
        onToggleProblem={toggleProblem}
        onTagClick={(tag) => {
          setQuery(tag)
          router.push(`/?q=${encodeURIComponent(tag)}`)
        }}
      />
    </PageShell>
  )
}
