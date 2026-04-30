"use client"

import Link from "next/link"
import { use, useEffect, useState } from "react"

const problems = [
  {
    id: "1",
    title: "東大2023 第1問",
    tags: ["微分", "最大値", "グラフ"],
    content: "関数 f(x) の最大値を求めよ。",
  },
  {
    id: "2",
    title: "東大2022 第3問",
    tags: ["確率", "サイコロ"],
    content: "サイコロを投げる試行について考える。",
  },
  {
    id: "3",
    title: "東大2021 第2問",
    tags: ["整数", "証明"],
    content: "整数の性質を証明せよ。",
  },
]

const initialReviews = [
  {
    problemId: "1",
    rating: 5,
    user: "優斗",
    date: "2026-04-30",
    comment: "微分の典型問題だが、最大値の存在条件まで意識できる良問。",
  },
  {
    problemId: "1",
    rating: 4,
    user: "友人A",
    date: "2026-04-30",
    comment: "計算だけでなくグラフの見方も問われていて勉強になる。",
  },
]

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

export default function ProblemDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [reviews, setReviews] = useState(initialReviews)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  const problem = problems.find((p) => p.id === id)
  const problemReviews = reviews.filter((r) => r.problemId === id)

  const averageRating =
    problemReviews.length === 0
      ? 0
      : problemReviews.reduce((sum, r) => sum + r.rating, 0) /
        problemReviews.length

  const roundedAverage = Math.floor(averageRating * 10) / 10

  useEffect(() => {
    const saved = localStorage.getItem(`reviews-${id}`)
    if (saved) {
      setReviews(JSON.parse(saved))
    }
  }, [id])

  if (!problem) {
    return <div>問題が見つかりません</div>
  }

  return (
    <main className="p-10">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          学問ログ（仮）
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{problem.title}</span>
      </nav>

      <section className="mb-10">
        <h1 className="text-2xl font-bold mb-2">{problem.title}</h1>

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

        <div className="mb-4 text-sm">
          <span className="font-bold">平均評価：</span>
          <StarRating value={averageRating} />
          <span className="ml-2 text-gray-500">
            {roundedAverage.toFixed(1)} / 5.0（{problemReviews.length}件）
          </span>
        </div>

        <p className="text-lg">{problem.content}</p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">レビュー</h2>

        <div className="grid gap-4">
          {problemReviews.map((review, index) => (
            <div key={index} className="border rounded p-4 relative">
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

              <div className="mb-2">
                <StarRating value={review.rating} />
              </div>

              <p className="mb-2">{review.comment}</p>

              <p className="text-sm text-gray-500">
                {review.user}・{review.date}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">レビューを書く</h2>

        <div className="border rounded p-4">
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

          <button
            onClick={() => {
              if (!comment.trim()) return

              const newReview = {
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