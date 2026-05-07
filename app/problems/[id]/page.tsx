"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

/* =========================================================
  権限設定：サイトオーナー
  ※ MVPではメールアドレスで判定。
  ※ RLS導入時にDB側でも同じ条件を設定する。
========================================================= */
const OWNER_EMAIL = "yxxuto@gmail.com"

/* =========================================================
  型定義：タグ情報の形
========================================================= */
type Tag = {
  id: string
  name: string
}

/* =========================================================
  型定義：問題データの形
========================================================= */
type Problem = {
  id: string
  title: string
  content: string | null
  tags: Tag[]
  user_id: string | null
  username: string | null
}

/* =========================================================
  型定義：レビュー情報の形
  ※ Supabaseのreviewsテーブル保存
========================================================= */
type Review = {
  id: string
  problem_id: string
  user_id: string | null
  username: string | null
  rating: number
  comment: string
  created_at: string
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
  補助関数：Supabaseから返るprofiles情報からusernameを安全に取り出す
========================================================= */
function getProfileUsername(profiles: any): string | null {
  if (Array.isArray(profiles)) {
    return profiles[0]?.username ?? null
  }

  return profiles?.username ?? null
}

/* =========================================================
  詳細ページ：問題本文・タグ・投稿者・レビューを表示
========================================================= */
export default function ProblemDetail() {
  /* ---------------------------------------------------------
    URLパラメータ取得：/problems/[id] の id を取得
  --------------------------------------------------------- */
  const router = useRouter()
  const params = useParams()
  const id = String(params.id)

  /* ---------------------------------------------------------
    state：問題データ・読み込み状態
  --------------------------------------------------------- */
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)

  /* ---------------------------------------------------------
    state：ログイン中ユーザー
    ※ レビュー投稿・レビュー削除・問題編集・問題削除権限に使う
  --------------------------------------------------------- */
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)

  /* ---------------------------------------------------------
    state：全タグ一覧
    ※ 問題編集時のタグ選択に使う
  --------------------------------------------------------- */
  const [allTags, setAllTags] = useState<Tag[]>([])

  /* ---------------------------------------------------------
    state：問題編集フォーム
  --------------------------------------------------------- */
  const [isEditingProblem, setIsEditingProblem] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [editMessage, setEditMessage] = useState("")
  const [editErrorMessage, setEditErrorMessage] = useState("")
  const [isSavingProblem, setIsSavingProblem] = useState(false)

  /* ---------------------------------------------------------
    state：レビュー投稿フォーム・レビュー一覧
  --------------------------------------------------------- */
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [reviewMessage, setReviewMessage] = useState("")
  const [reviewErrorMessage, setReviewErrorMessage] = useState("")
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false)

  /* ---------------------------------------------------------
    ログインユーザー取得：投稿・編集・削除の権限判定に使う
  --------------------------------------------------------- */
  useEffect(() => {
    async function fetchCurrentUser() {
      const { data } = await supabase.auth.getUser()
      setCurrentUserId(data.user?.id ?? null)
      setCurrentUserEmail(data.user?.email ?? null)
    }

    fetchCurrentUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user.id ?? null)
      setCurrentUserEmail(session?.user.email ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  /* ---------------------------------------------------------
    DB取得：編集用に全タグを取得
  --------------------------------------------------------- */
  useEffect(() => {
    async function fetchAllTags() {
      const { data, error } = await supabase
        .from("tags")
        .select("id, name")
        .order("name", { ascending: true })

      if (error) {
        console.warn("タグ一覧取得エラー:", error.message)
        return
      }

      setAllTags(data ?? [])
    }

    fetchAllTags()
  }, [])

  /* ---------------------------------------------------------
    DB取得：問題本体・タグ・投稿者プロフィールを取得
  --------------------------------------------------------- */
  useEffect(() => {
    async function fetchProblem() {
      setLoading(true)

      const { data, error } = await supabase
        .from("problems")
        .select(`
          id,
          title,
          content,
          user_id,
          problem_tags (
            tag_id,
            tags ( name )
          )
        `)
        .eq("id", id)
        .maybeSingle()

      if (error || !data) {
        console.warn("問題取得エラー:", error?.message)
        setProblem(null)
        setLoading(false)
        return
      }

      let username: string | null = null

      if (data.user_id) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.user_id)
          .maybeSingle()

        if (profileError) {
          console.warn("投稿者プロフィール取得エラー:", profileError.message)
        }

        username = profile?.username ?? null
      }

      setProblem({
        id: data.id,
        title: data.title,
        content: data.content,
        user_id: data.user_id,
        username,
        tags: (data.problem_tags ?? []).map((pt: any) => ({
          id: pt.tag_id,
          name: pt.tags?.name ?? "",
        })),
      })

      setLoading(false)
    }

    fetchProblem()
  }, [id])

  /* ---------------------------------------------------------
    DB取得：reviewsテーブルからこの問題のレビュー一覧を取得
  --------------------------------------------------------- */
  useEffect(() => {
    async function fetchReviews() {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          problem_id,
          user_id,
          rating,
          comment,
          created_at,
          profiles (
            username
          )
        `)
        .eq("problem_id", id)
        .order("created_at", { ascending: false })

      if (error) {
        console.warn("レビュー取得エラー:", error.message)
        return
      }

      setReviews(
        (data ?? []).map((review: any) => ({
          id: review.id,
          problem_id: review.problem_id,
          user_id: review.user_id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          username: getProfileUsername(review.profiles),
        }))
      )
    }

    fetchReviews()
  }, [id])

  /* ---------------------------------------------------------
    レビュー集計：DBから取得したレビューで平均評価を計算
  --------------------------------------------------------- */
  const averageRating =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  const roundedAverage = Math.floor(averageRating * 10) / 10

  /* ---------------------------------------------------------
    問題管理権限：投稿者本人 or サイトオーナー
  --------------------------------------------------------- */
  const canManageProblem =
    !!problem &&
    !!currentUserId &&
    (problem.user_id === currentUserId || currentUserEmail === OWNER_EMAIL)

  /* ---------------------------------------------------------
    問題編集開始：現在の問題情報を編集フォームへコピー
  --------------------------------------------------------- */
  function handleStartEditProblem() {
    if (!problem) return

    setEditMessage("")
    setEditErrorMessage("")
    setEditTitle(problem.title)
    setEditContent(problem.content ?? "")
    setSelectedTagIds(problem.tags.map((tag) => tag.id))
    setIsEditingProblem(true)
  }

  /* ---------------------------------------------------------
    タグ選択切り替え：問題編集フォーム用
  --------------------------------------------------------- */
  function toggleEditTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }

  /* ---------------------------------------------------------
    問題編集保存：タイトル・本文・タグ紐付けを更新
    ※ 投稿者本人 or オーナーだけ実行可能
  --------------------------------------------------------- */
  async function handleSaveProblemEdit() {
    setEditMessage("")
    setEditErrorMessage("")

    if (!problem) return

    if (!canManageProblem) {
      setEditErrorMessage("この問題を編集する権限がありません。")
      return
    }

    if (!editTitle.trim()) {
      setEditErrorMessage("タイトルを入力してください。")
      return
    }

    if (selectedTagIds.length === 0) {
      setEditErrorMessage("タグを1つ以上選択してください。")
      return
    }

    setIsSavingProblem(true)

    const { error: problemUpdateError } = await supabase
      .from("problems")
      .update({
        title: editTitle.trim(),
        content: editContent.trim(),
      })
      .eq("id", problem.id)

    if (problemUpdateError) {
      console.warn("問題更新エラー:", problemUpdateError.message)
      setEditErrorMessage("問題の更新に失敗しました。")
      setIsSavingProblem(false)
      return
    }

    const { error: deleteTagError } = await supabase
      .from("problem_tags")
      .delete()
      .eq("problem_id", problem.id)

    if (deleteTagError) {
      console.warn("既存タグ紐付け削除エラー:", deleteTagError.message)
      setEditErrorMessage("既存タグの更新に失敗しました。")
      setIsSavingProblem(false)
      return
    }

    const inserts = selectedTagIds.map((tagId) => ({
      problem_id: problem.id,
      tag_id: tagId,
    }))

    const { error: insertTagError } = await supabase
      .from("problem_tags")
      .insert(inserts)

    if (insertTagError) {
      console.warn("新タグ紐付けエラー:", insertTagError.message)
      setEditErrorMessage("タグの保存に失敗しました。")
      setIsSavingProblem(false)
      return
    }

    const selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id))

    setProblem({
      ...problem,
      title: editTitle.trim(),
      content: editContent.trim(),
      tags: selectedTags,
    })

    setIsSavingProblem(false)
    setIsEditingProblem(false)
    setEditMessage("問題を更新しました。")
  }

  /* ---------------------------------------------------------
    レビュー投稿：reviewsテーブルへinsert
  --------------------------------------------------------- */
  async function handleSubmitReview() {
    setReviewMessage("")
    setReviewErrorMessage("")

    if (!currentUserId) {
      setReviewErrorMessage("レビューを書くにはログインしてください。")
      return
    }

    if (!comment.trim()) {
      setReviewErrorMessage("コメントを入力してください。")
      return
    }

    setIsReviewSubmitting(true)

    const { data: insertedReview, error } = await supabase
      .from("reviews")
      .insert({
        problem_id: id,
        user_id: currentUserId,
        rating,
        comment: comment.trim(),
      })
      .select(`
        id,
        problem_id,
        user_id,
        rating,
        comment,
        created_at,
        profiles (
          username
        )
      `)
      .maybeSingle()

    setIsReviewSubmitting(false)

    if (error || !insertedReview) {
      console.warn("レビュー投稿エラー:", error?.message)
      setReviewErrorMessage("レビューの投稿に失敗しました。")
      return
    }

    const reviewData: any = insertedReview

    const newReview: Review = {
      id: reviewData.id,
      problem_id: reviewData.problem_id,
      user_id: reviewData.user_id,
      rating: reviewData.rating,
      comment: reviewData.comment,
      created_at: reviewData.created_at,
      username: getProfileUsername(reviewData.profiles),
    }

    setReviews((prev) => [newReview, ...prev])
    setComment("")
    setRating(5)
    setReviewMessage("レビューを投稿しました。")
  }

  /* ---------------------------------------------------------
    レビュー削除：レビュー投稿者本人 or オーナーだけ削除可能
    ※ RLS導入後はDB側でも制御する
  --------------------------------------------------------- */
  async function handleDeleteReview(review: Review) {
    setReviewMessage("")
    setReviewErrorMessage("")

    const canDeleteReview =
      !!currentUserId &&
      (review.user_id === currentUserId || currentUserEmail === OWNER_EMAIL)

    if (!canDeleteReview) {
      setReviewErrorMessage("このレビューを削除する権限がありません。")
      return
    }

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", review.id)

    if (error) {
      console.warn("レビュー削除エラー:", error.message)
      setReviewErrorMessage("レビューの削除に失敗しました。")
      return
    }

    setReviews((prev) => prev.filter((r) => r.id !== review.id))
    setReviewMessage("レビューを削除しました。")
  }

  /* ---------------------------------------------------------
    問題削除：投稿者本人 or オーナーだけ削除可能
    ※ 現時点では画面上の制御。RLS導入後はDB側でも同条件を設定する。
  --------------------------------------------------------- */
  async function handleDeleteProblem() {
    if (!problem) return

    if (!canManageProblem) {
      alert("この問題を削除する権限がありません。")
      return
    }

    const confirmed = window.confirm(
      "この問題を削除しますか？関連するタグ紐付け・レビューも削除されます。"
    )

    if (!confirmed) return

    const { error: reviewDeleteError } = await supabase
      .from("reviews")
      .delete()
      .eq("problem_id", problem.id)

    if (reviewDeleteError) {
      console.warn("レビュー削除エラー:", reviewDeleteError.message)
      alert("レビューの削除に失敗しました。")
      return
    }

    const { error: tagRelationError } = await supabase
      .from("problem_tags")
      .delete()
      .eq("problem_id", problem.id)

    if (tagRelationError) {
      console.warn("タグ紐付け削除エラー:", tagRelationError.message)
      alert("タグ紐付けの削除に失敗しました。")
      return
    }

    const { error: problemDeleteError } = await supabase
      .from("problems")
      .delete()
      .eq("id", problem.id)

    if (problemDeleteError) {
      console.warn("問題削除エラー:", problemDeleteError.message)
      alert("問題の削除に失敗しました。")
      return
    }

    router.push("/")
  }

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
        問題ヘッダー：タイトル・投稿者・タグ・平均評価・本文・編集・削除
      ===================================================== */}
      <section className="mb-10">
        {/* 通常表示：編集モードでない場合 */}
        {!isEditingProblem && (
          <>
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
                  key={tag.id}
                  href={`/?q=${encodeURIComponent(tag.name)}`}
                  className="text-sm text-blue-500 hover:underline"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>

            {/* 平均評価 */}
            <div className="mb-4 text-sm">
              <span className="font-bold">平均評価：</span>
              <StarRating value={averageRating} />
              <span className="ml-2 text-gray-500">
                {roundedAverage.toFixed(1)} / 5.0（{reviews.length}件）
              </span>
            </div>

            {/* 問題本文 */}
            <p className="text-lg">{problem.content}</p>

            {/* 編集完了メッセージ */}
            {editMessage && (
              <p className="mt-4 text-sm text-green-600">{editMessage}</p>
            )}

            {/* 問題編集・削除ボタン：投稿者本人またはオーナーだけ表示 */}
            {canManageProblem && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleStartEditProblem}
                  className="rounded border px-4 py-2 text-blue-600 hover:bg-blue-50"
                >
                  この問題を編集する
                </button>

                <button
                  onClick={handleDeleteProblem}
                  className="rounded border border-red-500 px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  この問題を削除する
                </button>
              </div>
            )}
          </>
        )}

        {/* 編集フォーム：投稿者本人またはオーナーだけ利用可能 */}
        {isEditingProblem && (
          <div className="border rounded p-4">
            <h2 className="text-xl font-bold mb-4">問題を編集する</h2>

            {/* タイトル編集 */}
            <div className="mb-4">
              <label className="block mb-1">タイトル</label>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            {/* 本文編集 */}
            <div className="mb-4">
              <label className="block mb-1">内容</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="border p-2 rounded w-full"
                rows={5}
              />
            </div>

            {/* タグ編集 */}
            <div className="mb-4">
              <label className="block mb-2">タグ</label>
              <div className="flex gap-2 flex-wrap">
                {allTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleEditTag(tag.id)}
                    className={`px-3 py-1 rounded border ${
                      selectedTagIds.includes(tag.id)
                        ? "bg-black text-white"
                        : "bg-white"
                    }`}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 編集エラー・成功メッセージ */}
            {editErrorMessage && (
              <p className="mb-4 text-sm text-red-500">{editErrorMessage}</p>
            )}

            {editMessage && (
              <p className="mb-4 text-sm text-green-600">{editMessage}</p>
            )}

            {/* 編集保存・キャンセルボタン */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveProblemEdit}
                disabled={isSavingProblem}
                className="bg-black text-white px-4 py-2 rounded disabled:bg-gray-400"
              >
                {isSavingProblem ? "保存中..." : "保存する"}
              </button>

              <button
                onClick={() => {
                  setIsEditingProblem(false)
                  setEditErrorMessage("")
                }}
                className="border px-4 py-2 rounded hover:bg-gray-100"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
        レビュー一覧：DBのreviewsテーブルから取得して表示
      ===================================================== */}
      <section>
        <h2 className="text-xl font-bold mb-4">レビュー</h2>

        <div className="grid gap-4">
          {reviews.length === 0 ? (
            <div className="border rounded p-4 text-sm text-gray-500">
              まだレビューはありません。
            </div>
          ) : (
            reviews.map((review) => {
              const canDeleteReview =
                !!currentUserId &&
                (review.user_id === currentUserId || currentUserEmail === OWNER_EMAIL)

              return (
                <div key={review.id} className="border rounded p-4 relative">
                  {/* レビュー削除ボタン：レビュー投稿者本人またはオーナーだけ表示 */}
                  {canDeleteReview && (
                    <button
                      onClick={() => handleDeleteReview(review)}
                      className="absolute top-2 right-2 text-sm text-red-500 hover:underline"
                    >
                      削除
                    </button>
                  )}

                  {/* レビュー星評価 */}
                  <div className="mb-2">
                    <StarRating value={review.rating} />
                  </div>

                  {/* レビュー本文 */}
                  <p className="mb-2">{review.comment}</p>

                  {/* レビュー投稿者・投稿日 */}
                  <p className="text-sm text-gray-500">
                    {review.username ?? "未設定ユーザー"}・
                    {new Date(review.created_at).toISOString().slice(0, 10)}
                  </p>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* =====================================================
        レビュー投稿フォーム：評価とコメントをDBに投稿
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

          {/* 投稿成功・エラーメッセージ */}
          {reviewErrorMessage && (
            <p className="mb-4 text-sm text-red-500">{reviewErrorMessage}</p>
          )}

          {reviewMessage && (
            <p className="mb-4 text-sm text-green-600">{reviewMessage}</p>
          )}

          {/* 投稿ボタン */}
          <button
            onClick={handleSubmitReview}
            disabled={isReviewSubmitting}
            className="bg-black text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {isReviewSubmitting ? "投稿中..." : "投稿する"}
          </button>
        </div>
      </section>
    </main>
  )
}