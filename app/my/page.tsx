"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

/* =========================================================
  型定義：自分の投稿した問題データ
========================================================= */
type MyProblem = {
  id: string
  title: string
  content: string | null
  created_at: string
  tags: string[]
  average: number
  reviewCount: number
  ratingSum: number
}

/* =========================================================
  型定義：自分が書いたレビューデータ
========================================================= */
type MyReview = {
  id: string
  problem_id: string
  problem_title: string
  rating: number
  comment: string
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
  補助関数：Supabaseから返るproblems情報から問題タイトルを取り出す
========================================================= */
function getProblemTitle(problems: any): string {
  if (Array.isArray(problems)) {
    return problems[0]?.title ?? "問題タイトル不明"
  }

  return problems?.title ?? "問題タイトル不明"
}

/* =========================================================
  マイページ：自分の投稿・レビュー・評価集計を表示
========================================================= */
export default function MyPage() {
  /* ---------------------------------------------------------
    state：ログインユーザー情報
  --------------------------------------------------------- */
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  /* ---------------------------------------------------------
    state：自分の投稿一覧・自分のレビュー一覧・画面状態
  --------------------------------------------------------- */
  const [myProblems, setMyProblems] = useState<MyProblem[]>([])
  const [myReviews, setMyReviews] = useState<MyReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  /* ---------------------------------------------------------
    初期表示：ログインユーザー、自分の投稿、自分のレビューを取得
  --------------------------------------------------------- */
  useEffect(() => {
    async function fetchMyPageData() {
      setIsLoading(true)
      setErrorMessage("")

      /* ---------------------------------------------------------
        Auth取得：現在ログインしているユーザーを取得
      --------------------------------------------------------- */
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        setUserId(null)
        setEmail(null)
        setMyProblems([])
        setMyReviews([])
        setIsLoading(false)
        return
      }

      const user = userData.user
      setUserId(user.id)
      setEmail(user.email ?? null)

      /* ---------------------------------------------------------
        DB取得：自分が投稿した問題・タグ・レビュー評価を取得
      --------------------------------------------------------- */
      const { data: problemsData, error: problemsError } = await supabase
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
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (problemsError) {
        console.warn("自分の投稿取得エラー:", problemsError.message)
        setErrorMessage("自分の投稿一覧の取得に失敗しました。")
        setIsLoading(false)
        return
      }

      const nextProblems: MyProblem[] = (problemsData ?? []).map((p: any) => {
        const reviews = p.reviews ?? []
        const reviewCount = reviews.length

        const ratingSum = reviews.reduce(
          (sum: number, r: { rating: number }) => sum + r.rating,
          0
        )

        const average = reviewCount === 0 ? 0 : ratingSum / reviewCount

        return {
          id: p.id,
          title: p.title,
          content: p.content,
          created_at: p.created_at,
          tags: (p.problem_tags ?? []).map((pt: any) => pt.tags.name),
          average,
          reviewCount,
          ratingSum,
        }
      })

      setMyProblems(nextProblems)

      /* ---------------------------------------------------------
        DB取得：自分が書いたレビュー一覧を取得
      --------------------------------------------------------- */
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          id,
          problem_id,
          rating,
          comment,
          created_at,
          problems (
            title
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (reviewsError) {
        console.warn("自分のレビュー取得エラー:", reviewsError.message)
        setErrorMessage("自分のレビュー一覧の取得に失敗しました。")
        setIsLoading(false)
        return
      }

      const nextReviews: MyReview[] = (reviewsData ?? []).map((review: any) => ({
        id: review.id,
        problem_id: review.problem_id,
        problem_title: getProblemTitle(review.problems),
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
      }))

      setMyReviews(nextReviews)
      setIsLoading(false)
    }

    fetchMyPageData()
  }, [])

  /* ---------------------------------------------------------
    投稿問題全体の評価集計
    単純平均：各投稿問題の平均評価を投稿数で割る
    加重平均：全レビュー評価合計を全レビュー件数で割る
  --------------------------------------------------------- */
  const postCount = myProblems.length

  const simpleAverage =
    postCount === 0
      ? 0
      : myProblems.reduce((sum, problem) => sum + problem.average, 0) / postCount

  const totalReviewCount = myProblems.reduce(
    (sum, problem) => sum + problem.reviewCount,
    0
  )

  const totalRatingSum = myProblems.reduce(
    (sum, problem) => sum + problem.ratingSum,
    0
  )

  const weightedAverage =
    totalReviewCount === 0 ? 0 : totalRatingSum / totalReviewCount

  const roundedSimpleAverage = Math.floor(simpleAverage * 10) / 10
  const roundedWeightedAverage = Math.floor(weightedAverage * 10) / 10

  /* =========================================================
    ローディング表示：マイページ取得中
  ========================================================= */
  if (isLoading) {
    return (
      <main className="p-10">
        {/* =====================================================
          パンくず：トップページ / マイページ
        ===================================================== */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:underline">
            学問ログ（仮）
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">マイページ</span>
        </nav>

        <p>読み込み中...</p>
      </main>
    )
  }

  /* =========================================================
    未ログイン表示：マイページにはログインが必要
  ========================================================= */
  if (!userId) {
    return (
      <main className="p-10">
        {/* =====================================================
          パンくず：トップページ / マイページ
        ===================================================== */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:underline">
            学問ログ（仮）
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">マイページ</span>
        </nav>

        <h1 className="text-2xl font-bold mb-4">マイページ</h1>

        <p className="mb-4">マイページを見るにはログインしてください。</p>

        <Link href="/login" className="text-blue-500 hover:underline">
          ログイン / 新規登録へ
        </Link>
      </main>
    )
  }

  return (
    <main className="p-10">
      {/* =====================================================
        パンくず：トップページ / マイページ
      ===================================================== */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          学問ログ（仮）
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">マイページ</span>
      </nav>

      {/* =====================================================
        ページヘッダー：ログイン中ユーザーとマイページ概要
      ===================================================== */}
      <section className="mb-8">
        <h1 className="text-2xl font-bold mb-2">マイページ</h1>

        <p className="text-sm text-gray-500">
          ログイン中：{email}
        </p>
      </section>

      {/* =====================================================
        投稿問題の評価サマリー
      ===================================================== */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">投稿した問題の評価サマリー</h2>

        <div className="grid gap-4 md:grid-cols-3">
          {/* 投稿数 */}
          <div className="border rounded p-4">
            <p className="text-sm text-gray-500 mb-1">投稿数</p>
            <p className="text-2xl font-bold">{postCount}件</p>
          </div>

          {/* 単純平均評価 */}
          <div className="border rounded p-4">
            <p className="text-sm text-gray-500 mb-1">
              単純平均評価
            </p>
            <div className="flex items-center gap-2">
              <StarRating value={simpleAverage} />
              <span className="text-lg font-bold">
                {roundedSimpleAverage.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              各投稿問題の平均評価を投稿数で割った値
            </p>
          </div>

          {/* 加重平均評価 */}
          <div className="border rounded p-4">
            <p className="text-sm text-gray-500 mb-1">
              加重平均評価
            </p>
            <div className="flex items-center gap-2">
              <StarRating value={weightedAverage} />
              <span className="text-lg font-bold">
                {roundedWeightedAverage.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              全レビュー評価をレビュー件数{totalReviewCount}件で割った値
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
        自分の投稿一覧
      ===================================================== */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">自分の投稿した問題</h2>

        {errorMessage && (
          <p className="mb-4 text-sm text-red-500">{errorMessage}</p>
        )}

        {myProblems.length === 0 ? (
          <div className="border rounded p-4 text-sm text-gray-500">
            まだ投稿した問題はありません。
          </div>
        ) : (
          <div className="grid gap-4">
            {myProblems.map((p) => {
              const rounded = Math.floor(p.average * 10) / 10

              return (
                <Link key={p.id} href={`/problems/${p.id}`}>
                  <div className="border p-4 rounded hover:bg-gray-100 cursor-pointer">
                    {/* 投稿問題カード：タイトル */}
                    <h3 className="text-xl font-semibold">{p.title}</h3>

                    {/* 投稿問題カード：投稿日 */}
                    <p className="text-sm text-gray-500 mt-1">
                      投稿日：{new Date(p.created_at).toISOString().slice(0, 10)}
                    </p>

                    {/* 投稿問題カード：平均評価 */}
                    <div className="flex items-center gap-2 mt-2">
                      <StarRating value={p.average} />
                      <span className="text-sm text-gray-500">
                        {rounded.toFixed(1)}（{p.reviewCount}件）
                      </span>
                    </div>

                    {/* 投稿問題カード：本文抜粋 */}
                    {p.content && (
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                        {p.content}
                      </p>
                    )}

                    {/* 投稿問題カード：タグ一覧 */}
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
        )}
      </section>

      {/* =====================================================
        自分が書いたレビュー一覧
      ===================================================== */}
      <section>
        <h2 className="text-xl font-bold mb-4">自分が書いたレビュー</h2>

        {myReviews.length === 0 ? (
          <div className="border rounded p-4 text-sm text-gray-500">
            まだレビューを書いていません。
          </div>
        ) : (
          <div className="grid gap-4">
            {myReviews.map((review) => (
              <Link key={review.id} href={`/problems/${review.problem_id}`}>
                <div className="border p-4 rounded hover:bg-gray-100 cursor-pointer">
                  {/* レビューカード：対象問題 */}
                  <h3 className="text-lg font-semibold">
                    {review.problem_title}
                  </h3>

                  {/* レビューカード：投稿日 */}
                  <p className="text-sm text-gray-500 mt-1">
                    投稿日：{new Date(review.created_at).toISOString().slice(0, 10)}
                  </p>

                  {/* レビューカード：評価 */}
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating value={review.rating} />
                    <span className="text-sm text-gray-500">
                      {review.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* レビューカード：コメント */}
                  <p className="text-sm text-gray-700 mt-2">
                    {review.comment}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}