"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

/* =========================================================
  型定義：問題データの形
========================================================= */
type Problem = {
  id: string
  title: string
  content: string | null
  tags: string[]
  user_id: string | null
  username: string | null
}

/* =========================================================
  型定義：レビュー情報の形
  ※ 現時点ではlocalStorage保存
========================================================= */
type Review = {
  problemId: string
  rating: number
  user: string
  date: string
  comment: string
}

/* =========================================================
  星評価コンポーネント：平均評価や各レビュー評価を星で表示
========================================================= */
function StarRating({ value }: { value: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px", verticalAlign: "middle" }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercent = Math.max(
          0,
          Math.min(100, (value - (star - 1)) * 100)
        )

        return (
          <span
            key={star}
            style={{
              position: "relative",
              display: "inline-block",
              width: "20px",
              height: "20px",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              style={{ color: "#d1d5db" }}
            >
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
                height: "20px",
                overflow: "hidden",
                display: "inline-block",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                style={{ color: "#f59e0b" }}
              >
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
  詳細ページ：問題本文・タグ・投稿者・レビューを表示
========================================================= */
export default function ProblemDetail() {
  /* ---------------------------------------------------------
    URLパラメータ取得：/problems/[id] の id を取得
  --------------------------------------------------------- */
  const params = useParams()
  const id = String(params.id)

  /* ---------------------------------------------------------
    state：問題データ・読み込み状態
  --------------------------------------------------------- */
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)

  /* ---------------------------------------------------------
    state：レビュー投稿フォーム・レビュー一覧
  --------------------------------------------------------- */
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  /* ---------------------------------------------------------
    DB取得：問題本体・タグ・投稿者プロフィールを取得
  --------------------------------------------------------- */
  useEffect(() => {
    async function fetchProblem() {
      const { data, error } = await supabase
        .from("problems")
        .select(`
          id,
          title,
          content,
          user_id,
          problem_tags (
            tags ( name )
          )
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("問題取得エラー:", error.message)
        setLoading(false)
        return
      }

      let username: string | null = null

      if (data.user_id) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.user_id)
          .single()

        if (profileError) {
          console.error("投稿者プロフィール取得エラー:", profileError.message)
        }

        username = profile?.username ?? null
      }

      setProblem({
        id: data.id,
        title: data.title,
        content: data.content,
        user_id: data.user_id,
        username,
        tags: (data.problem_tags ?? []).map((pt: any) => pt.tags.name),
      })

      setLoading(false)
    }

    fetchProblem()
  }, [id])

  /* ---------------------------------------------------------
    レビュー取得：localStorageからこの問題のレビューを取得
  --------------------------------------------------------- */
  useEffect(() => {
    const saved = localStorage.getItem(`reviews-${id}`)
    if (saved) {
      setReviews(JSON.parse(saved))
    } else {
      setReviews([])
    }
  }, [id])

  /* ---------------------------------------------------------
    レビュー集計：この問題のレビューだけに絞り、平均評価を計算
  --------------------------------------------------------- */
  const problemReviews = reviews.filter((r) => r.problemId === id)

  const averageRating =
    problemReviews.length === 0
      ? 0
      : problemReviews.reduce((sum, r) => sum + r.rating, 0) /
        problemReviews.length

  const roundedAverage = Math.floor(averageRating * 10) / 10

  /* =========================================================
    ローディング表示：DB取得中
  ========================================================= */
  if (loading) {
    return (
      <main className="p-10">
        {/* パンくず：読み込み中 */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:underline">
            学問ログ（仮）
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">読み込み中</span>
        </nav>

        <div>読み込み中...</div>
      </main>
    )
  }

  /* =========================================================
    エラー表示：問題が見つからない場合
  ========================================================= */
  if (!problem) {
    return (
      <main className="p-10">
        {/* パンくず：問題が見つからない */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:underline">
            学問ログ（仮）
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">問題が見つかりません</span>
        </nav>

        <div>問題が見つかりません</div>
      </main>
    )
  }

  return (
    <main className="p-10">
      {/* =====================================================
        パンくず：トップページ / 現在の問題
      ===================================================== */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          学問ログ（仮）
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{problem.title}</span>
      </nav>

      {/* =====================================================
        問題ヘッダー：タイトル・投稿者・タグ・平均評価・本文
      ===================================================== */}
      <section className="mb-10">
        {/* 問題タイトル */}
        <h1 className="text-2xl font-bold mb-2">{problem.title}</h1>

        {/* 投稿者表示：profiles.username を表示 */}
        <p className="text-sm text-gray-500 mb-2">
          投稿者：{problem.username ?? "未設定ユーザー"}
        </p>

        {/* タグ一覧：クリックするとトップページでタグ検索 */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {problem.tags.map((tag) => (
            <Link
              key={tag}
              href={`/?q=${encodeURIComponent(tag)}`}
              className="text-sm text-blue-500 hover:underline"
            >
              #{tag}
            </Link>
          ))}
        </div>

        {/* 平均評価 */}
        <div className="mb-4 text-sm">
          <span className="font-bold">平均評価：</span>
          <StarRating value={averageRating} />
          <span className="ml-2 text-gray-500">
            {roundedAverage.toFixed(1)} / 5.0（{problemReviews.length}件）
          </span>
        </div>

        {/* 問題本文 */}
        <p className="text-lg">{problem.content}</p>
      </section>

      {/* =====================================================
        レビュー一覧：この問題に投稿されたレビューを表示
      ===================================================== */}
      <section>
        <h2 className="text-xl font-bold mb-4">レビュー</h2>

        <div className="grid gap-4">
          {problemReviews.map((review, index) => (
            <div key={index} className="border rounded p-4 relative">
              {/* レビュー削除ボタン：localStorageから削除 */}
              <button
                onClick={() => {
                  const updated = reviews.filter((_, i) => i !== index)
                  setReviews(updated)
                  localStorage.setItem(`reviews-${id}`, JSON.stringify(updated))
                }}
                className="absolute top-2 right-2 text-sm text-red-500 hover:underline"
              >
                削除
              </button>

              {/* レビュー星評価 */}
              <div className="mb-2">
                <StarRating value={review.rating} />
              </div>

              {/* レビュー本文 */}
              <p className="mb-2">{review.comment}</p>

              {/* レビュー投稿者・投稿日 */}
              <p className="text-sm text-gray-500">
                {review.user}・{review.date}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
        レビュー投稿フォーム：評価とコメントを投稿
      ===================================================== */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">レビューを書く</h2>

        <div className="border rounded p-4">
          {/* 評価選択 */}
          <div className="mb-4">
            <label className="block mb-1">評価</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border p-2 rounded w-full"
            >
              <option value={5}>5</option>
              <option value={4}>4</option>
              <option value={3}>3</option>
              <option value={2}>2</option>
              <option value={1}>1</option>
            </select>
          </div>

          {/* コメント入力 */}
          <div className="mb-4">
            <label className="block mb-1">コメント</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="border p-2 rounded w-full"
              rows={3}
              placeholder="感想を書いてください"
            />
          </div>

          {/* 投稿ボタン */}
          <button
            onClick={() => {
              if (!comment.trim()) return

              const newReview: Review = {
                problemId: id,
                rating,
                user: "あなた",
                date: new Date().toISOString().slice(0, 10),
                comment,
              }

              const updated = [newReview, ...reviews]
              setReviews(updated)
              localStorage.setItem(`reviews-${id}`, JSON.stringify(updated))
              setComment("")
              setRating(5)
            }}
            className="bg-black text-white px-4 py-2 rounded"
          >
            投稿する
          </button>
        </div>
      </section>
    </main>
  )
}