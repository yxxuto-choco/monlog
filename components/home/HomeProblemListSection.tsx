"use client"

import SectionCard from "@/components/ui/SectionCard"
import MessageBox from "@/components/ui/MessageBox"
import { COLORS } from "@/components/ui/designTokens"
import ProblemListCard from "@/components/home/ProblemListCard"
import type { HomeProblem, ReviewStats } from "@/hooks/useHomeProblems"

type SortMode = "default" | "popular"

type HomeProblemListSectionProps = {
  problems: HomeProblem[]
  stats: Record<string, ReviewStats>
  sortMode: SortMode
  isLoading: boolean
  errorMessage: string | null
  isExpanded: (problemId: string) => boolean
  onToggleProblem: (problemId: string) => void
  onTagClick: (tag: string) => void
}

function formatDate(value: string | null) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

function truncateText(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length)}...` : text
}

export default function HomeProblemListSection({
  problems,
  stats,
  sortMode,
  isLoading,
  errorMessage,
  isExpanded,
  onToggleProblem,
  onTagClick,
}: HomeProblemListSectionProps) {
  return (
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
            {sortMode === "default" ? "新着順" : "人気順"}で表示中 / {problems.length}件
          </p>
        </div>
      </div>

      {errorMessage ? (
        <MessageBox type="error">{errorMessage}</MessageBox>
      ) : isLoading ? (
        <SectionCard>読み込み中...</SectionCard>
      ) : problems.length === 0 ? (
        <SectionCard>条件に一致する問題はありません。</SectionCard>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "32px",
          }}
        >
          {problems.map((problem) => {
            const average = stats[problem.id]?.average ?? 0
            const count = stats[problem.id]?.count ?? 0
            const representativeReview = stats[problem.id]?.representativeReview ?? null
            const rounded = Math.floor(average * 10) / 10
            const opened = isExpanded(problem.id)

            return (
              <ProblemListCard
                key={problem.id}
                problem={problem}
                average={average}
                roundedAverage={rounded}
                reviewCount={count}
                representativeReview={representativeReview}
                opened={opened}
                createdAtLabel={formatDate(problem.created_at)}
                representativeCommentPreview={
                  representativeReview ? truncateText(representativeReview.comment, 180) : null
                }
                onToggle={() => onToggleProblem(problem.id)}
                onTagClick={onTagClick}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
