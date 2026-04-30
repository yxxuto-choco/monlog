"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Problem = {
  id: string
  title: string
  content: string | null
}

type Review = {
  problemId: string
  rating: number
  comment: string
  createdAt: string
}

function StarRating({ value }: { value: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px", verticalAlign: "middle" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= value ? "#f59e0b" : "#d1d5db" }}>
          ★
        </span>
      ))}
    </span>
  )
}

export default function ProblemDetailPage() {
  const params = useParams()
  const id = String(params.id)

  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    async function fetchProblem() {
      const { data, error } = await supabase
        .from("problems")
        .select("id, title, content")
        .eq("id", id)
        .single()

      if (error) {
        console.error("問題取得エラー:", error.message)
      }

      setProblem(data ?? null)
      setLoading(false)
    }

    fetchProblem()
  }, [id])

  useEffect(() => {
    const saved = localStorage.getItem(`reviews-${id}`)
    if (saved) {
      setReviews(JSON.parse(saved))
    }
  }, [id])

  function handleSubmit() {
    const nextReview: Review = {
      problemId: id,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    }

    const nextReviews = [nextReview, ...reviews]
    setReviews(nextReviews)
    localStorage.setItem(`reviews-${id}`, JSON.stringify(nextReviews))

    setRating(5)
    setComment("")
  }

  const average =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  if (loading) {
    return (
      <main className="p-10">
        <Link href="/" className="text-blue-600 underline">
          ← 問題一覧に戻る
        </Link>
        <p className="mt-6">読み込み中...</p>
      </main>
    )
  }

  if (!problem) {
    return (
      <main className="p-10">
        <Link href="/" className="text-blue-600 underline">
          ← 問題一覧に戻る
        </Link>

        <h1 className="text-2xl font-bold mt-6">問題が見つかりません</h1>
        <p className="text-gray-600 mt-2">
          指定された問題は存在しないか、削除された可能性があります。
        </p>
      </main>
    )
  }

  return (
    <main className="p-10">
      <Link href="/" className="text-blue-600 underline">
        ← 問題一覧に戻る
      </Link>

      <h1 className="text-3xl font-bold mt-6">{problem.title}</h1>

      {problem.content && (
        <div className="border rounded p-4 mt-4 whitespace-pre-wrap">
          {problem.content}
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-bold">評価</h2>

        <div className="flex items-center gap-2 mt-2">
          <StarRating value={Math.round(average)} />
          <span className="text-gray-600">
            {average.toFixed(1)}（{reviews.length}件）
          </span>
        </div>
      </section>

      <section className="mt-8 border rounded p-4">
        <h2 className="text-xl font-bold mb-4">レビューを書く</h2>

        <label className="block mb-2">評価</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border rounded px-3 py-2 mb-4"
        >
          <option value={5}>5</option>
          <option value={4}>4</option>
          <option value={3}>3</option>
          <option value={2}>2</option>
          <option value={1}>1</option>
        </select>

        <label className="block mb-2">コメント</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border rounded w-full p-3 h-28"
          placeholder="この問題の解法・難易度・良かった点など"
        />

        <button
          onClick={handleSubmit}
          className="mt-4 bg-black text-white px-4 py-2 rounded"
        >
          投稿する
        </button>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">コメント一覧</h2>

        {reviews.length === 0 ? (
          <p className="text-gray-500">まだコメントはありません。</p>
        ) : (
          <div className="grid gap-4">
            {reviews.map((review, index) => (
              <div key={index} className="border rounded p-4">
                <div className="flex items-center gap-2">
                  <StarRating value={review.rating} />
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="mt-2 whitespace-pre-wrap">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}