"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Problem = {
  id: string
  title: string
  content: string | null
  tags: string[]
}

function StarRating({ value }: { value: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px", verticalAlign: "middle" }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercent = Math.max(0, Math.min(100, (value - (star - 1)) * 100))

        return (
          <span key={star} style={{ position: "relative", display: "inline-block", width: "16px", height: "16px" }}>
            <svg viewBox="0 0 24 24" width="16" height="16" style={{ color: "#d1d5db" }}>
              <path fill="currentColor" d="M12 2.5l2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.6l-5.8 3.1 1.1-6.6-4.8-4.7 6.6-.9L12 2.5z" />
            </svg>

            <span style={{ position: "absolute", top: 0, left: 0, width: `${fillPercent}%`, height: "16px", overflow: "hidden" }}>
              <svg viewBox="0 0 24 24" width="16" height="16" style={{ color: "#f59e0b" }}>
                <path fill="currentColor" d="M12 2.5l2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.6l-5.8 3.1 1.1-6.6-4.8-4.7 6.6-.9L12 2.5z" />
              </svg>
            </span>
          </span>
        )
      })}
    </span>
  )
}

export default function Home() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [stats, setStats] = useState<Record<string, { average: number; count: number }>>({})
  const [sortMode, setSortMode] = useState<"default" | "popular">("default")
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") ?? ""
  const [query, setQuery] = useState(initialQuery)

  useEffect(() => {
    async function fetchProblems() {
      const { data, error } = await supabase
        .from("problems")
        .select("id, title, content, created_at")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase取得エラー:", error.message)
        return
      }

      setProblems(
        (data ?? []).map((p) => ({
          id: p.id,
          title: p.title,
          content: p.content,
          tags: [],
        }))
      )
    }

    fetchProblems()
  }, [])

  useEffect(() => {
    const nextStats: Record<string, { average: number; count: number }> = {}

    problems.forEach((p) => {
      const saved = localStorage.getItem(`reviews-${p.id}`)
      const allReviews = saved ? JSON.parse(saved) : []
      const reviews = allReviews.filter((r: { problemId: string }) => r.problemId === p.id)

      const average =
        reviews.length === 0
          ? 0
          : reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length

      nextStats[p.id] = { average, count: reviews.length }
    })

    setStats(nextStats)
  }, [problems])

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">学問ログ（仮）</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSortMode("default")}
          className={`px-4 py-2 rounded border ${sortMode === "default" ? "bg-black text-white" : "bg-white"}`}
        >
          新着順
        </button>

        <button
          onClick={() => setSortMode("popular")}
          className={`px-4 py-2 rounded border ${sortMode === "popular" ? "bg-black text-white" : "bg-white"}`}
        >
          人気順
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="問題名・タグで検索"
        className="border rounded px-4 py-2 mb-6 w-full"
      />

      <div className="grid gap-4">
        {[...problems]
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
            if (sortMode === "default") return 0

            const aAvg = stats[a.id]?.average ?? 0
            const bAvg = stats[b.id]?.average ?? 0
            return bAvg - aAvg
          })
          .map((p) => {
            const average = stats[p.id]?.average ?? 0
            const count = stats[p.id]?.count ?? 0
            const rounded = Math.floor(average * 10) / 10

            return (
              <Link key={p.id} href={`/problems/${p.id}`}>
                <div className="border p-4 rounded hover:bg-gray-100 cursor-pointer">
                  <h2 className="text-xl font-semibold">{p.title}</h2>

                  <div className="flex items-center gap-2 mt-1">
                    <StarRating value={average} />
                    <span className="text-sm text-gray-500">
                      {rounded.toFixed(1)}（{count}件）
                    </span>
                  </div>

                  {p.content && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {p.content}
                    </p>
                  )}

                  <div className="flex gap-2 mt-2 flex-wrap">
                    {p.tags.map((tag) => (
                      <span key={tag} className="text-sm text-gray-500">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            )
          })}
      </div>
    </main>
  )
}