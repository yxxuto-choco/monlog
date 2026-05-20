"use client"

import { supabase } from "@/lib/supabase"
import useCurrentProfile from "@/hooks/useCurrentProfile"
import useHomeProblemFilters from "@/hooks/useHomeProblemFilters"
import useHomeProblems from "@/hooks/useHomeProblems"
import PageShell from "@/components/ui/PageShell"
import HomeHero from "@/components/home/HomeHero"
import HomeLoginBar from "@/components/home/HomeLoginBar"
import HomeProblemListSection from "@/components/home/HomeProblemListSection"
import HomeSearchPanel from "@/components/home/HomeSearchPanel"
import HomeStatsBar from "@/components/home/HomeStatsBar"

export default function Home() {
  const { userId, userEmail, userName } = useCurrentProfile()
  const { problems, stats, isLoading, errorMessage } = useHomeProblems()
  const {
    sortMode,
    setSortMode,
    query,
    setQuery,
    filteredProblems,
    isExpanded,
    toggleProblem,
    clearQuery,
    selectTag,
  } = useHomeProblemFilters(problems, stats)

  async function handleLogout() {
    await supabase.auth.signOut()
  }

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
        onClearQuery={clearQuery}
      />

      <HomeProblemListSection
        problems={filteredProblems}
        stats={stats}
        sortMode={sortMode}
        isLoading={isLoading}
        errorMessage={errorMessage}
        isExpanded={isExpanded}
        onToggleProblem={toggleProblem}
        onTagClick={selectTag}
      />
    </PageShell>
  )
}
