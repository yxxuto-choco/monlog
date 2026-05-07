"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

/* =========================================================
  型定義：問題データの形
========================================================= */
type Problem = {
  id: string
  title: string
  content: string | null
  tags: string[]
  created_at: string
}

/* =========================================================
  星評価コンポーネント：平均評価を星で表示する
========================================================= */
function StarRating({ value }: { value: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px", verticalAlign: "middle" }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercent = Math.max(0, Math.min(100, (value - (star - 1)) * 100))

        return (
          <span
            key={star}
            style={{
              position: "relative",
              display: "inline-block",
              width: "16px",
              height: "16px",
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" style={{ color: "#d1d5db" }}>
              <path
                fill="currentColor"
                d="M12 2.5l2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.6l-5.8 3.1 1.1-6.6-4.8-4.7 6.6-.9L12 2.5z"
              />
            </svg>

            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${fillPercent}%`,
                height: "16px",
                overflow: "hidden",
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" style={{ color: "#f59e0b" }}>
                <path
                  fill="currentColor"
                  d="M12 2.5l2.9 6 6.6.9-4.8 4.7 1.1 6.6L12 17.6l-5.8 3.1 1.1-6.6-4.8-4.7 6.6-.9L12 2.5z"
                />
              </svg>
            </span>
          </span>
        )
      })}
    </span>
  )
}

/* =========================================================
  トップページ：問題一覧・検索・ログイン状態表示
========================================================= */
export default function Home() {
  /* ---------------------------------------------------------
    state：画面で使う状態
  --------------------------------------------------------- */
  const [problems, setProblems] = useState<Problem[]>([])
  const [stats, setStats] = useState<Record<string, { average: number; count: number }>>({})
  const [sortMode, setSortMode] = useState<"default" | "popular">("default")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") ?? ""
  const [query, setQuery] = useState(initialQuery)

  /* ---------------------------------------------------------
    URLクエリ同期：/?q=微分 のような検索条件を検索欄に反映
  --------------------------------------------------------- */
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "")
  }, [searchParams])

/* ---------------------------------------------------------
  ログイン状態取得：メールアドレスとユーザー名を表示する
--------------------------------------------------------- */
useEffect(() => {
  async function loadUserAndProfile() {
    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) {
      setUserEmail(null)
      setUserName(null)
      return
    }

    setUserEmail(user.email ?? null)

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle()

    if (error) {
      console.error("プロフィール取得エラー:", error.message)
      setUserName(null)
      return
    }

    setUserName(profile?.username ?? null)
  }

  loadUserAndProfile()

  const { data: listener } = supabase.auth.onAuthStateChange(() => {
    loadUserAndProfile()
  })

  return () => {
    listener.subscription.unsubscribe()
  }
}, [])

/* ---------------------------------------------------------
  DB取得：Supabaseから問題一覧・タグ・レビュー評価を取得
  ※ 一覧に戻った時にも最新レビュー件数を反映する
--------------------------------------------------------- */
useEffect(() => {
  async function fetchProblems() {
    const { data, error } = await supabase
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
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase取得エラー:", error.message)
      return
    }

    const nextProblems: Problem[] = (data ?? []).map((p: any) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      created_at: p.created_at,
      tags: (p.problem_tags ?? []).map((pt: any) => pt.tags.name),
    }))

    const nextStats: Record<string, { average: number; count: number }> = {}

    ;(data ?? []).forEach((p: any) => {
      const reviews = p.reviews ?? []
      const count = reviews.length

      const average =
        count === 0
          ? 0
          : reviews.reduce(
              (sum: number, r: { rating: number }) => sum + r.rating,
              0
            ) / count

      nextStats[p.id] = { average, count }
    })

    setProblems(nextProblems)
    setStats(nextStats)
  }

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

  return (
    <main className="p-10">
      {/* =====================================================
        ページタイトル
      ===================================================== */}
      <h1 className="text-3xl font-bold mb-6">学問ログ（仮）</h1>

    {/* =====================================================
      ログイン状態パネル：メール・ユーザー名・プロフィール設定・ログアウト
    ===================================================== */}
    <div className="mb-6 text-sm text-gray-700">
      {userEmail ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-transparent py-2">
          <span className="font-medium text-gray-700">ログイン中</span>

          <span className="text-gray-400">--</span>

          <span className="rounded-md bg-white px-3 py-1 font-medium text-gray-900">
            {userEmail} / {userName ?? "ユーザー名未設定"}
          </span>

          <span className="text-gray-400">--</span>

          <Link
            href="/profile"
            className="rounded-md bg-white px-3 py-1 text-blue-600 hover:bg-blue-50"
          >
            プロフィール設定
          </Link>

          <span className="text-gray-400">--</span>

          <button
            onClick={async () => {
              await supabase.auth.signOut()
              setUserEmail(null)
              setUserName(null)
            }}
            className="rounded-md bg-white px-3 py-1 text-red-600 hover:bg-red-50"
          >
            ログアウト
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-transparent py-2">
          <span className="text-gray-600">ログインしていません</span>

          <span className="text-gray-400">--</span>

          <Link
            href="/login"
            className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            ログイン / 新規登録
          </Link>
        </div>
      )}
    </div>

      {/* =====================================================
        投稿ボタン：問題投稿ページへ移動
      ===================================================== */}
      <Link href="/new" className="inline-block mb-4 bg-black text-white px-4 py-2 rounded">
        問題を投稿する
      </Link>

      {/* =====================================================
        並び替えボタン：新着順・人気順
      ===================================================== */}
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

      {/* =====================================================
        検索欄：問題名・本文・タグで検索
      ===================================================== */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="問題名・タグで検索"
        className="border rounded px-4 py-2 mb-3 w-full"
      />

      {/* =====================================================
        検索中表示：現在の絞り込み条件と解除ボタン
      ===================================================== */}
      {query.trim() && (
        <div className="mb-4 text-sm text-gray-600">
          「{query}」で絞り込み中
          <button
            onClick={() => {
              setQuery("")
              router.push("/")
            }}
            className="ml-3 text-blue-500 hover:underline"
          >
            解除
          </button>
        </div>
      )}

      {/* =====================================================
        問題一覧：検索・並び替え後の問題カードを表示
      ===================================================== */}
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
            if (sortMode === "default") {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            }

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
                  {/* 問題カード：タイトル */}
                  <h2 className="text-xl font-semibold">{p.title}</h2>

                  {/* 問題カード：平均評価 */}
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating value={average} />
                    <span className="text-sm text-gray-500">
                      {rounded.toFixed(1)}（{count}件）
                    </span>
                  </div>

                  {/* 問題カード：タグ一覧。クリックするとタグ検索 */}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {p.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setQuery(tag)
                          router.push(`/?q=${encodeURIComponent(tag)}`)
                        }}
                        className={`text-sm hover:underline ${
                          query === tag ? "text-blue-600 font-bold" : "text-gray-500"
                        }`}
                      >
                        #{tag}
                      </button>
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