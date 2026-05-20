"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import useCurrentProfile from "@/hooks/useCurrentProfile"
import useHomeProblems from "@/hooks/useHomeProblems"
import PageShell from "@/components/ui/PageShell"
import SectionCard from "@/components/ui/SectionCard"
import MessageBox from "@/components/ui/MessageBox"
import { COLORS } from "@/components/ui/designTokens"
import HomeHero from "@/components/home/HomeHero"
import HomeLoginBar from "@/components/home/HomeLoginBar"
import HomeSearchPanel from "@/components/home/HomeSearchPanel"
import HomeStatsBar from "@/components/home/HomeStatsBar"
import ProblemListCard from "@/components/home/ProblemListCard"

function formatDate(value: string | null) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

function truncateText(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length)}...` : text
}

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
    .filter((p) => {
      const keyword = query.trim().toLowerCase()
      if (!keyword) return true

      return (
        p.title.toLowerCase().includes(keyword) ||
        (p.content ?? "").toLowerCase().includes(keyword) ||
        p.tags.some((tag) => tag.toLowerCase().includes(keyword))
      )
    })
    .sort((a, b) => {
      if (sortMode === "default") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }

      const aAvg = stats[a.id]?.average ?? 0
      const bAvg = stats[b.id]?.average ?? 0

      if (bAvg !== aAvg) return bAvg - aAvg

      const aCount = stats[a.id]?.count ?? 0
      const bCount = stats[b.id]?.count ?? 0
      return bCount - aCount
    })

  const totalReviews = Object.values(stats).reduce((sum, s) => sum + s.count, 0)

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

      <section>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "28px",
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
              問題一覧
            </h2>

            <p
              style={{
                margin: "8px 0 0",
                color: COLORS.slate,
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              {sortMode === "default" ? "新着順" : "人気順"}で表示中 /{" "}
              {filteredProblems.length}件
            </p>
          </div>
        </div>

        {errorMessage ? (
          <MessageBox type="error">{errorMessage}</MessageBox>
        ) : isLoading ? (
          <SectionCard>読み込み中...</SectionCard>
        ) : filteredProblems.length === 0 ? (
          <SectionCard>条件に一致する問題はありません。</SectionCard>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "32px",
            }}
          >
            {filteredProblems.map((p) => {
              const average = stats[p.id]?.average ?? 0
              const count = stats[p.id]?.count ?? 0
              const representativeReview = stats[p.id]?.representativeReview ?? null
              const rounded = Math.floor(average * 10) / 10
              const opened = isExpanded(p.id)

              return (
                <ProblemListCard
                  key={p.id}
                  problem={p}
                  average={average}
                  roundedAverage={rounded}
                  reviewCount={count}
                  representativeReview={representativeReview}
                  opened={opened}
                  createdAtLabel={formatDate(p.created_at)}
                  representativeCommentPreview={
                    representativeReview ? truncateText(representativeReview.comment, 180) : null
                  }
                  onToggle={() => toggleProblem(p.id)}
                  onTagClick={(tag) => {
                    setQuery(tag)
                    router.push(`/?q=${encodeURIComponent(tag)}`)
                  }}
                />
              )
            })}
          </div>
        )}
      </section>
    </PageShell>
  )
}
