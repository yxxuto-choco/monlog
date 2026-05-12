"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ProblemMarkdown from "@/components/ProblemMarkdown"
import UserMiniBadge from "@/components/UserMiniBadge"
import LatexTemplateSelector from "@/components/LatexTemplateSelector"
import PageShell from "@/components/ui/PageShell"
import SectionCard from "@/components/ui/SectionCard"
import MessageBox from "@/components/ui/MessageBox"
import StarRating from "@/components/ui/StarRating"
import { COLORS, RADII, SHADOWS } from "@/components/ui/designTokens"

type Tag = {
  id: string
  name: string
}

type TagRow = {
  name: string | null
}

type ProblemTagRow = {
  tag_id: string | null
  tags: TagRow | TagRow[] | null
}

type ReviewRow = {
  id: string
  rating: number | string | null
  comment: string | null
  created_at: string | null
  user_id?: string | null
}

type ProblemRow = {
  id: string
  title: string
  content: string | null
  created_at: string
  user_id: string | null
  problem_tags: ProblemTagRow[] | null
  reviews: ReviewRow[] | null
}

type Problem = {
  id: string
  title: string
  content: string | null
  created_at: string
  user_id: string | null
  tags: string[]
  tagIds: string[]
}

type Review = {
  id: string
  rating: number
  comment: string | null
  created_at: string | null
  user_id?: string | null
}

function BackIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CommentIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EditIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M6 6l1 15h10l1-15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function extractTagNames(problemTags: ProblemTagRow[] | null): string[] {
  return (problemTags ?? [])
    .map((pt) => {
      const tags = pt.tags
      const tag = Array.isArray(tags) ? tags[0] : tags
      return tag?.name ?? ""
    })
    .filter(Boolean)
}

function extractTagIds(problemTags: ProblemTagRow[] | null): string[] {
  return (problemTags ?? [])
    .map((pt) => pt.tag_id ?? "")
    .filter(Boolean)
}

function formatDate(value: string | null) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

function getProblemId(paramsId: string | string[] | undefined) {
  if (Array.isArray(paramsId)) return paramsId[0]
  return paramsId ?? ""
}

function ActionButton({
  children,
  onClick,
  variant = "secondary",
  disabled = false,
}: {
  children: React.ReactNode
  onClick: () => void
  variant?: "primary" | "secondary" | "danger"
  disabled?: boolean
}) {
  const isPrimary = variant === "primary"
  const isDanger = variant === "danger"

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "7px",
        minHeight: "42px",
        padding: "0 15px",
        borderRadius: RADII.md,
        border: `1px solid ${isPrimary ? COLORS.navy : isDanger ? "#FCA5A5" : COLORS.lineStrong}`,
        backgroundColor: isPrimary ? COLORS.navy : isDanger ? "#FEF2F2" : COLORS.surface,
        color: isPrimary ? "#FFFFFF" : isDanger ? COLORS.danger : COLORS.navy,
        fontSize: "14px",
        fontWeight: 900,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
      }}
    >
      {children}
    </button>
  )
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: "40px",
        padding: "0 18px",
        borderRadius: RADII.pill,
        border: `1px solid ${active ? COLORS.teal : COLORS.lineStrong}`,
        backgroundColor: active ? COLORS.teal : COLORS.surface,
        color: active ? "#FFFFFF" : COLORS.navy,
        fontSize: "15px",
        fontWeight: 900,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  )
}

function LatexHelpChips() {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        marginTop: "12px",
        color: COLORS.slate,
        fontSize: "13px",
        fontWeight: 800,
      }}
    >
      <span
        style={{
          border: `1px solid ${COLORS.line}`,
          borderRadius: RADII.sm,
          backgroundColor: COLORS.softYellow,
          padding: "5px 9px",
        }}
      >
        インライン数式：{String.raw`$ \frac{1}{2} $`}
      </span>

      <span
        style={{
          border: `1px solid ${COLORS.line}`,
          borderRadius: RADII.sm,
          backgroundColor: COLORS.softYellow,
          padding: "5px 9px",
        }}
      >
        表示数式：{String.raw`$$ \int_0^1 x^2 dx $$`}
      </span>
    </div>
  )
}

export default function ProblemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const problemId = getProblemId(params.id as string | string[] | undefined)

  const [problem, setProblem] = useState<Problem | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  const [rating, setRating] = useState("5")
  const [comment, setComment] = useState("")
  const [commentMode, setCommentMode] = useState<"input" | "preview">("input")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isEditingProblem, setIsEditingProblem] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editContentMode, setEditContentMode] = useState<"input" | "preview">("input")
  const [isUpdatingProblem, setIsUpdatingProblem] = useState(false)
  const [isDeletingProblem, setIsDeletingProblem] = useState(false)

  const [allTags, setAllTags] = useState<Tag[]>([])
  const [selectedEditTagIds, setSelectedEditTagIds] = useState<string[]>([])
  const [newEditTagName, setNewEditTagName] = useState("")
  const [editTagSuggestions, setEditTagSuggestions] = useState<Tag[]>([])

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editReviewRating, setEditReviewRating] = useState("5")
  const [editReviewComment, setEditReviewComment] = useState("")
  const [editReviewMode, setEditReviewMode] = useState<"input" | "preview">("input")
  const [isUpdatingReviewId, setIsUpdatingReviewId] = useState<string | null>(null)
  const [isDeletingReviewId, setIsDeletingReviewId] = useState<string | null>(null)

  useEffect(() => {
    const keyword = newEditTagName.trim().toLowerCase()

    if (!keyword) {
      setEditTagSuggestions([])
      return
    }

    const filtered = allTags.filter((tag) => tag.name.toLowerCase().includes(keyword))
    setEditTagSuggestions(filtered.slice(0, 5))
  }, [newEditTagName, allTags])

  function insertCommentLatexTemplate(latex: string) {
    setComment((prev) => {
      const needsNewLine = prev.trim().length > 0
      return needsNewLine ? `${prev}\n\n${latex}` : latex
    })
    setCommentMode("input")
  }

  function insertEditReviewLatexTemplate(latex: string) {
    setEditReviewComment((prev) => {
      const needsNewLine = prev.trim().length > 0
      return needsNewLine ? `${prev}\n\n${latex}` : latex
    })
    setEditReviewMode("input")
  }

  function insertEditProblemLatexTemplate(latex: string) {
    setEditContent((prev) => {
      const needsNewLine = prev.trim().length > 0
      return needsNewLine ? `${prev}\n\n${latex}` : latex
    })
    setEditContentMode("input")
  }

  function toggleEditTag(tagId: string) {
    setSelectedEditTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  async function fetchAllTags() {
    const { data, error } = await supabase.from("tags").select("*").order("name")

    if (error) {
      console.warn("タグ一覧取得エラー:", error.message)
      return
    }

    setAllTags((data ?? []) as Tag[])
  }

  async function handleAddEditTag() {
    setErrorMessage("")
    setSuccessMessage("")

    const name = newEditTagName.trim()
    if (!name) return

    const existing = allTags.find((tag) => tag.name.toLowerCase() === name.toLowerCase())

    if (existing) {
      setSelectedEditTagIds((prev) =>
        prev.includes(existing.id) ? prev : [...prev, existing.id]
      )
      setNewEditTagName("")
      setEditTagSuggestions([])
      return
    }

    const { data, error } = await supabase.from("tags").insert({ name }).select().single()

    if (error) {
      console.error("タグ作成エラー:", error.message)
      setErrorMessage(`タグの作成に失敗しました：${error.message}`)
      return
    }

    const createdTag = data as Tag

    setAllTags((prev) => [...prev, createdTag].sort((a, b) => a.name.localeCompare(b.name)))
    setSelectedEditTagIds((prev) => [...prev, createdTag.id])
    setNewEditTagName("")
    setEditTagSuggestions([])
  }

  async function loadUserAndProfile() {
    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) {
      setUserId(null)
      setUserEmail(null)
      setUserName(null)
      return
    }

    setUserId(user.id)
    setUserEmail(user.email ?? null)

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle()

    if (error) {
      console.warn("プロフィール取得エラー:", error.message)
      setUserName(null)
      return
    }

    setUserName(profile?.username ?? null)
  }

  async function fetchProblem() {
    if (!problemId) return

    setIsLoading(true)
    setErrorMessage("")

    const { data, error } = await supabase
      .from("problems")
      .select(`
        id,
        title,
        content,
        created_at,
        user_id,
        problem_tags (
          tag_id,
          tags ( name )
        ),
        reviews (
          id,
          rating,
          comment,
          created_at,
          user_id
        )
      `)
      .eq("id", problemId)
      .maybeSingle()

    if (error) {
      console.error("問題詳細取得エラー:", error.message)
      setErrorMessage("問題詳細の取得に失敗しました。")
      setIsLoading(false)
      return
    }

    if (!data) {
      setProblem(null)
      setReviews([])
      setErrorMessage("問題が見つかりませんでした。")
      setIsLoading(false)
      return
    }

    const row = data as unknown as ProblemRow
    const tagNames = extractTagNames(row.problem_tags)
    const tagIds = extractTagIds(row.problem_tags)

    setProblem({
      id: row.id,
      title: row.title,
      content: row.content,
      created_at: row.created_at,
      user_id: row.user_id,
      tags: tagNames,
      tagIds,
    })

    setEditTitle(row.title)
    setEditContent(row.content ?? "")
    setSelectedEditTagIds(tagIds)

    const nextReviews: Review[] = (row.reviews ?? [])
      .map((review) => ({
        id: review.id,
        rating: Number(review.rating),
        comment: review.comment,
        created_at: review.created_at,
        user_id: review.user_id,
      }))
      .filter((review) => Number.isFinite(review.rating))
      .sort((a, b) => {
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
        return bTime - aTime
      })

    setReviews(nextReviews)
    setIsLoading(false)
  }

  useEffect(() => {
    loadUserAndProfile()
    fetchAllTags()
    fetchProblem()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUserAndProfile()
    })

    return () => {
      listener.subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId])

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }, [reviews])

  const roundedAverage = Math.floor(averageRating * 10) / 10
  const isProblemOwner = Boolean(userId && problem?.user_id === userId)

  async function handleUpdateProblem() {
    setErrorMessage("")
    setSuccessMessage("")

    if (!problem || !userId) return

    if (!editTitle.trim()) {
      setErrorMessage("タイトルを入力してください。")
      return
    }

    if (!editContent.trim()) {
      setErrorMessage("本文を入力してください。")
      return
    }

    if (selectedEditTagIds.length === 0) {
      setErrorMessage("タグを1つ以上選択してください。")
      return
    }

    setIsUpdatingProblem(true)

    const { error } = await supabase
      .from("problems")
      .update({
        title: editTitle.trim(),
        content: editContent.trim(),
      })
      .eq("id", problem.id)
      .eq("user_id", userId)

    if (error) {
      console.error("問題更新エラー:", error.message)
      setErrorMessage(`問題の更新に失敗しました：${error.message}`)
      setIsUpdatingProblem(false)
      return
    }

    const { error: deleteTagError } = await supabase
      .from("problem_tags")
      .delete()
      .eq("problem_id", problem.id)

    if (deleteTagError) {
      console.error("タグ紐付け削除エラー:", deleteTagError.message)
      setErrorMessage(`タグの更新に失敗しました：${deleteTagError.message}`)
      setIsUpdatingProblem(false)
      return
    }

    const inserts = selectedEditTagIds.map((tagId) => ({
      problem_id: problem.id,
      tag_id: tagId,
    }))

    const { error: insertTagError } = await supabase.from("problem_tags").insert(inserts)

    if (insertTagError) {
      console.error("タグ紐付け作成エラー:", insertTagError.message)
      setErrorMessage(`タグの保存に失敗しました：${insertTagError.message}`)
      setIsUpdatingProblem(false)
      return
    }

    setSuccessMessage("問題を更新しました。")
    setIsEditingProblem(false)
    setIsUpdatingProblem(false)

    await fetchProblem()
  }

  async function handleDeleteProblem() {
    setErrorMessage("")
    setSuccessMessage("")

    if (!problem || !userId) return

    const ok = window.confirm(
      "この問題を削除します。レビューやタグ紐付けも削除されます。よろしいですか？"
    )

    if (!ok) return

    setIsDeletingProblem(true)

    const { error: reviewDeleteError } = await supabase
      .from("reviews")
      .delete()
      .eq("problem_id", problem.id)

    if (reviewDeleteError) {
      console.error("レビュー削除エラー:", reviewDeleteError.message)
      setErrorMessage(`関連レビューの削除に失敗しました：${reviewDeleteError.message}`)
      setIsDeletingProblem(false)
      return
    }

    const { error: tagDeleteError } = await supabase
      .from("problem_tags")
      .delete()
      .eq("problem_id", problem.id)

    if (tagDeleteError) {
      console.error("タグ紐付け削除エラー:", tagDeleteError.message)
      setErrorMessage(`タグ紐付けの削除に失敗しました：${tagDeleteError.message}`)
      setIsDeletingProblem(false)
      return
    }

    const { error } = await supabase
      .from("problems")
      .delete()
      .eq("id", problem.id)
      .eq("user_id", userId)

    if (error) {
      console.error("問題削除エラー:", error.message)
      setErrorMessage(`問題の削除に失敗しました：${error.message}`)
      setIsDeletingProblem(false)
      return
    }

    router.push("/")
  }

  async function handleSubmitReview() {
    setErrorMessage("")
    setSuccessMessage("")

    if (!problem) return

    const parsedRating = Number(rating)

    if (
      !Number.isFinite(parsedRating) ||
      !Number.isInteger(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      setErrorMessage("評価は1〜5の整数で選択してください。")
      return
    }

    if (!comment.trim()) {
      setErrorMessage("コメントを入力してください。")
      return
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      setErrorMessage("レビューするにはログインが必要です。")
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase.from("reviews").insert({
      problem_id: problem.id,
      user_id: userData.user.id,
      rating: parsedRating,
      comment: comment.trim(),
    })

    if (error) {
      console.error("レビュー投稿エラー:", error.message)
      setErrorMessage(`レビュー投稿に失敗しました：${error.message}`)
      setIsSubmitting(false)
      return
    }

    setComment("")
    setRating("5")
    setCommentMode("input")
    setSuccessMessage("レビューを投稿しました。")
    setIsSubmitting(false)

    await fetchProblem()
  }

  function startEditReview(review: Review) {
    setEditingReviewId(review.id)
    setEditReviewRating(String(Math.round(review.rating)))
    setEditReviewComment(review.comment ?? "")
    setEditReviewMode("input")
  }

  async function handleUpdateReview(reviewId: string) {
    setErrorMessage("")
    setSuccessMessage("")

    if (!userId) return

    const parsedRating = Number(editReviewRating)

    if (
      !Number.isFinite(parsedRating) ||
      !Number.isInteger(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      setErrorMessage("評価は1〜5の整数で選択してください。")
      return
    }

    if (!editReviewComment.trim()) {
      setErrorMessage("コメントを入力してください。")
      return
    }

    setIsUpdatingReviewId(reviewId)

    const { error } = await supabase
      .from("reviews")
      .update({
        rating: parsedRating,
        comment: editReviewComment.trim(),
      })
      .eq("id", reviewId)
      .eq("user_id", userId)

    if (error) {
      console.error("レビュー更新エラー:", error.message)
      setErrorMessage(`レビューの更新に失敗しました：${error.message}`)
      setIsUpdatingReviewId(null)
      return
    }

    setSuccessMessage("レビューを更新しました。")
    setEditingReviewId(null)
    setIsUpdatingReviewId(null)

    await fetchProblem()
  }

  async function handleDeleteReview(reviewId: string) {
    setErrorMessage("")
    setSuccessMessage("")

    if (!userId) return

    const ok = window.confirm("このレビューを削除します。よろしいですか？")

    if (!ok) return

    setIsDeletingReviewId(reviewId)

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", userId)

    if (error) {
      console.error("レビュー削除エラー:", error.message)
      setErrorMessage(`レビューの削除に失敗しました：${error.message}`)
      setIsDeletingReviewId(null)
      return
    }

    setSuccessMessage("レビューを削除しました。")
    setIsDeletingReviewId(null)

    await fetchProblem()
  }

  if (isLoading) {
    return (
      <PageShell>
        <SectionCard>読み込み中...</SectionCard>
      </PageShell>
    )
  }

  if (!problem) {
    return (
      <PageShell>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: COLORS.teal,
            fontSize: "17px",
            fontWeight: 900,
            textDecoration: "none",
            marginBottom: "28px",
          }}
        >
          <BackIcon />
          一覧へ戻る
        </Link>

        <MessageBox type="error">{errorMessage || "問題が見つかりませんでした。"}</MessageBox>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <nav
        style={{
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: COLORS.teal,
            fontSize: "17px",
            fontWeight: 900,
            textDecoration: "none",
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <BackIcon />
          戻る
        </button>

        <div
          style={{
            color: COLORS.slate,
            fontSize: "15px",
            fontWeight: 700,
          }}
        >
          問ログ / 問題詳細
        </div>
      </nav>

      {(errorMessage || successMessage) && (
        <div style={{ marginBottom: "22px" }}>
          {errorMessage && <MessageBox type="error">{errorMessage}</MessageBox>}
          {successMessage && <MessageBox type="success">{successMessage}</MessageBox>}
        </div>
      )}

      <SectionCard
        style={{
          padding: "36px",
          borderRadius: RADII.xxl,
          boxShadow: SHADOWS.cardStrong,
          marginBottom: "28px",
        }}
      >
        {problem.user_id && (
          <div style={{ marginBottom: "24px" }}>
            <UserMiniBadge userId={problem.user_id} size="md" showEmail={false} />
          </div>
        )}

        {isEditingProblem ? (
          <div>
            <div style={{ marginBottom: "18px" }}>
              <label
                style={{
                  display: "block",
                  color: COLORS.navy,
                  fontSize: "16px",
                  fontWeight: 900,
                  marginBottom: "8px",
                }}
              >
                タイトル
              </label>

              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{
                  width: "100%",
                  height: "52px",
                  borderRadius: RADII.md,
                  border: `1px solid ${COLORS.lineStrong}`,
                  backgroundColor: COLORS.surface,
                  color: COLORS.text,
                  fontSize: "17px",
                  fontWeight: 800,
                  padding: "0 16px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label
                style={{
                  display: "block",
                  color: COLORS.navy,
                  fontSize: "16px",
                  fontWeight: 900,
                  marginBottom: "8px",
                }}
              >
                問題内容
              </label>

              <p
                style={{
                  margin: "0 0 12px",
                  color: COLORS.slate,
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: 1.7,
                }}
              >
                文章はそのまま入力できます。数式を使いたい場合は $...$ や $$...$$
                で囲んでください。保存前にプレビューで確認できます。
              </p>

              <LatexTemplateSelector onInsert={insertEditProblemLatexTemplate} />

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "14px",
                  flexWrap: "wrap",
                }}
              >
                <ModeButton
                  active={editContentMode === "input"}
                  onClick={() => setEditContentMode("input")}
                >
                  入力
                </ModeButton>

                <ModeButton
                  active={editContentMode === "preview"}
                  onClick={() => setEditContentMode("preview")}
                >
                  プレビュー
                </ModeButton>
              </div>

              {editContentMode === "input" ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={8}
                  style={{
                    width: "100%",
                    resize: "vertical",
                    borderRadius: "16px",
                    border: `1px solid ${COLORS.lineStrong}`,
                    backgroundColor: COLORS.surface,
                    color: COLORS.text,
                    fontSize: "17px",
                    lineHeight: 1.8,
                    padding: "16px 18px",
                    outline: "none",
                  }}
                />
              ) : (
                <div
                  style={{
                    minHeight: "210px",
                    borderRadius: "16px",
                    border: `1px solid ${COLORS.lineStrong}`,
                    backgroundColor: COLORS.surface,
                    color: COLORS.text,
                    fontSize: "17px",
                    lineHeight: 1.8,
                    padding: "16px 18px",
                  }}
                >
                  {editContent.trim() ? (
                    <ProblemMarkdown content={editContent} />
                  ) : (
                    <p
                      style={{
                        margin: 0,
                        color: COLORS.muted,
                        fontSize: "15px",
                        lineHeight: 1.8,
                      }}
                    >
                      ここに問題内容のプレビューが表示されます。
                    </p>
                  )}
                </div>
              )}

              <LatexHelpChips />
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  color: COLORS.navy,
                  fontSize: "16px",
                  fontWeight: 900,
                  marginBottom: "8px",
                }}
              >
                タグ
              </label>

              <p
                style={{
                  margin: "0 0 12px",
                  color: COLORS.slate,
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: 1.7,
                }}
              >
                既存タグを選択するか、新しいタグを追加できます。タグは1つ以上選択してください。
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <input
                  value={newEditTagName}
                  onChange={(e) => setNewEditTagName(e.target.value)}
                  placeholder="タグを入力"
                  style={{
                    flex: "1 1 260px",
                    height: "48px",
                    borderRadius: RADII.md,
                    border: `1px solid ${COLORS.lineStrong}`,
                    backgroundColor: COLORS.surface,
                    color: COLORS.text,
                    fontSize: "16px",
                    fontWeight: 700,
                    padding: "0 14px",
                    outline: "none",
                  }}
                />

                <button
                  type="button"
                  onClick={handleAddEditTag}
                  style={{
                    minHeight: "48px",
                    padding: "0 20px",
                    borderRadius: RADII.md,
                    border: "none",
                    backgroundColor: COLORS.navy,
                    color: "#FFFFFF",
                    fontSize: "15px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  追加
                </button>
              </div>

              {editTagSuggestions.length > 0 && (
                <div
                  style={{
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: RADII.md,
                    backgroundColor: COLORS.surface,
                    overflow: "hidden",
                    marginBottom: "16px",
                  }}
                >
                  {editTagSuggestions.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        setSelectedEditTagIds((prev) =>
                          prev.includes(tag.id) ? prev : [...prev, tag.id]
                        )
                        setNewEditTagName("")
                        setEditTagSuggestions([])
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        border: "none",
                        borderBottom: `1px solid ${COLORS.line}`,
                        backgroundColor: COLORS.surface,
                        color: COLORS.navy,
                        padding: "12px 14px",
                        fontSize: "15px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {allTags.map((tag) => {
                  const selected = selectedEditTagIds.includes(tag.id)

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleEditTag(tag.id)}
                      style={{
                        border: `1px solid ${selected ? COLORS.teal : COLORS.line}`,
                        borderRadius: RADII.pill,
                        backgroundColor: selected ? COLORS.teal : COLORS.tagBg,
                        color: selected ? "#FFFFFF" : COLORS.tagText,
                        padding: "8px 15px",
                        fontSize: "14px",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      #{tag.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <ActionButton
                onClick={() => {
                  setIsEditingProblem(false)
                  setEditTitle(problem.title)
                  setEditContent(problem.content ?? "")
                  setSelectedEditTagIds(problem.tagIds)
                  setNewEditTagName("")
                  setEditTagSuggestions([])
                  setEditContentMode("input")
                }}
              >
                キャンセル
              </ActionButton>

              <ActionButton
                variant="primary"
                onClick={handleUpdateProblem}
                disabled={isUpdatingProblem}
              >
                {isUpdatingProblem ? "保存中..." : "保存する"}
              </ActionButton>
            </div>
          </div>
        ) : (
          <>
            <h1
              style={{
                margin: 0,
                color: COLORS.navy,
                fontSize: "40px",
                lineHeight: 1.35,
                fontWeight: 900,
                letterSpacing: "-0.03em",
              }}
            >
              {problem.title}
            </h1>

            <div
              style={{
                marginTop: "22px",
                display: "flex",
                alignItems: "center",
                gap: "18px",
                flexWrap: "wrap",
                color: COLORS.slate,
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              <span>投稿日: {formatDate(problem.created_at)}</span>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <StarRating value={averageRating} size={22} />
                <strong style={{ color: COLORS.navy, fontSize: "22px" }}>
                  {roundedAverage.toFixed(1)}
                </strong>
              </span>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <CommentIcon size={21} />
                {reviews.length}件
              </span>
            </div>

            {problem.tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: "24px",
                }}
              >
                {problem.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/?q=${encodeURIComponent(tag)}`}
                    style={{
                      borderRadius: RADII.pill,
                      backgroundColor: COLORS.tagBg,
                      color: COLORS.tagText,
                      padding: "9px 18px",
                      fontSize: "15px",
                      fontWeight: 900,
                      textDecoration: "none",
                    }}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {isProblemOwner && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "26px",
                  justifyContent: "flex-end",
                }}
              >
                <ActionButton
                  onClick={() => {
                    setEditTitle(problem.title)
                    setEditContent(problem.content ?? "")
                    setSelectedEditTagIds(problem.tagIds)
                    setEditContentMode("input")
                    setNewEditTagName("")
                    setEditTagSuggestions([])
                    setIsEditingProblem(true)
                  }}
                >
                  <EditIcon />
                  問題を編集
                </ActionButton>

                <ActionButton
                  variant="danger"
                  onClick={handleDeleteProblem}
                  disabled={isDeletingProblem}
                >
                  <TrashIcon />
                  {isDeletingProblem ? "削除中..." : "問題を削除"}
                </ActionButton>
              </div>
            )}
          </>
        )}
      </SectionCard>

      {!isEditingProblem && (
        <SectionCard
          style={{
            padding: "34px 36px",
            marginBottom: "28px",
          }}
        >
          <h2
            style={{
              margin: "0 0 22px",
              color: COLORS.navy,
              fontSize: "28px",
              fontWeight: 900,
            }}
          >
            問題内容
          </h2>

          {problem.content ? (
            <ProblemMarkdown content={problem.content} />
          ) : (
            <p
              style={{
                margin: 0,
                color: COLORS.muted,
                fontSize: "17px",
                lineHeight: 1.8,
              }}
            >
              本文はまだ登録されていません。
            </p>
          )}
        </SectionCard>
      )}

      <SectionCard
        variant="teal"
        style={{
          borderLeft: `6px solid ${COLORS.teal}`,
          borderRadius: RADII.xl,
          padding: "30px 34px",
          marginBottom: "32px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: COLORS.navy,
            fontSize: "28px",
            fontWeight: 900,
          }}
        >
          レビューを書く
        </h2>

        {userId ? (
          <>
            <SectionCard
              style={{
                marginTop: "18px",
                marginBottom: "22px",
                padding: "16px 18px",
                borderRadius: RADII.lg,
                boxShadow: "none",
              }}
            >
              <UserMiniBadge
                userId={userId}
                email={userEmail}
                userName={userName}
                size="md"
                showEmail
              />
            </SectionCard>

            <div style={{ marginBottom: "18px" }}>
              <label
                style={{
                  display: "block",
                  color: COLORS.navy,
                  fontSize: "16px",
                  fontWeight: 900,
                  marginBottom: "8px",
                }}
              >
                評価
              </label>

              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                style={{
                  width: "160px",
                  height: "48px",
                  borderRadius: RADII.sm,
                  border: `1px solid ${COLORS.lineStrong}`,
                  backgroundColor: COLORS.surface,
                  color: COLORS.navy,
                  fontSize: "17px",
                  fontWeight: 900,
                  padding: "0 12px",
                  outline: "none",
                }}
              >
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label
                style={{
                  display: "block",
                  color: COLORS.navy,
                  fontSize: "16px",
                  fontWeight: 900,
                  marginBottom: "8px",
                }}
              >
                コメント
              </label>

              <p
                style={{
                  margin: "0 0 12px",
                  color: COLORS.slate,
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: 1.7,
                }}
              >
                文章はそのまま入力できます。数式を使いたい場合は $...$ や $$...$$
                で囲んでください。投稿前にプレビューで確認できます。
              </p>

              <LatexTemplateSelector onInsert={insertCommentLatexTemplate} />

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "14px",
                  flexWrap: "wrap",
                }}
              >
                <ModeButton active={commentMode === "input"} onClick={() => setCommentMode("input")}>
                  入力
                </ModeButton>

                <ModeButton
                  active={commentMode === "preview"}
                  onClick={() => setCommentMode("preview")}
                >
                  プレビュー
                </ModeButton>
              </div>

              {commentMode === "input" ? (
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  placeholder="解法の美しさ、難易度、学習効果などをレビューしてください。"
                  style={{
                    width: "100%",
                    resize: "vertical",
                    borderRadius: "16px",
                    border: `1px solid ${COLORS.lineStrong}`,
                    backgroundColor: COLORS.surface,
                    color: COLORS.text,
                    fontSize: "17px",
                    lineHeight: 1.8,
                    padding: "16px 18px",
                    outline: "none",
                  }}
                />
              ) : (
                <div
                  style={{
                    minHeight: "150px",
                    borderRadius: "16px",
                    border: `1px solid ${COLORS.lineStrong}`,
                    backgroundColor: COLORS.surface,
                    color: COLORS.text,
                    fontSize: "17px",
                    lineHeight: 1.8,
                    padding: "16px 18px",
                  }}
                >
                  {comment.trim() ? (
                    <ProblemMarkdown content={comment} />
                  ) : (
                    <p
                      style={{
                        margin: 0,
                        color: COLORS.muted,
                        fontSize: "15px",
                        lineHeight: 1.8,
                      }}
                    >
                      ここにコメントのプレビューが表示されます。
                    </p>
                  )}
                </div>
              )}

              <LatexHelpChips />
            </div>

            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              style={{
                width: "100%",
                minHeight: "62px",
                border: "none",
                borderRadius: RADII.md,
                backgroundColor: COLORS.navy,
                color: "#FFFFFF",
                fontSize: "20px",
                fontWeight: 900,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "投稿中..." : "レビューを投稿する"}
            </button>
          </>
        ) : (
          <SectionCard
            style={{
              marginTop: "18px",
              padding: "24px",
              borderRadius: RADII.lg,
              boxShadow: "none",
            }}
          >
            <p
              style={{
                margin: 0,
                color: COLORS.slate,
                fontSize: "16px",
                lineHeight: 1.8,
                fontWeight: 700,
              }}
            >
              レビューを書くにはログインが必要です。
            </p>

            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "50px",
                padding: "0 20px",
                marginTop: "18px",
                borderRadius: RADII.md,
                backgroundColor: COLORS.navy,
                color: "#FFFFFF",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: 900,
              }}
            >
              ログイン / 新規登録
            </Link>
          </SectionCard>
        )}
      </SectionCard>

      <section>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "22px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: COLORS.navy,
                fontSize: "30px",
                fontWeight: 900,
              }}
            >
              レビュー一覧
            </h2>

            <p
              style={{
                margin: "8px 0 0",
                color: COLORS.slate,
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              {reviews.length}件のレビュー
            </p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <SectionCard
            style={{
              padding: "30px",
              color: COLORS.muted,
              fontSize: "16px",
              lineHeight: 1.8,
            }}
          >
            まだレビューはありません。最初のレビューを書いてみましょう。
          </SectionCard>
        ) : (
          <div style={{ display: "grid", gap: "18px" }}>
            {reviews.map((review) => {
              const isReviewOwner = Boolean(userId && review.user_id === userId)
              const isEditingThisReview = editingReviewId === review.id

              return (
                <SectionCard
                  key={review.id}
                  style={{
                    padding: "24px 26px",
                    borderRadius: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                      }}
                    >
                      {review.user_id && (
                        <UserMiniBadge userId={review.user_id} size="sm" showEmail={false} />
                      )}

                      {!isEditingThisReview && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <StarRating value={review.rating} size={20} />
                          <span
                            style={{
                              color: COLORS.navy,
                              fontSize: "20px",
                              fontWeight: 900,
                            }}
                          >
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: COLORS.muted,
                          fontSize: "14px",
                          fontWeight: 700,
                        }}
                      >
                        {formatDate(review.created_at)}
                      </p>

                      {isReviewOwner && !isEditingThisReview && (
                        <>
                          <ActionButton onClick={() => startEditReview(review)}>
                            <EditIcon />
                            編集
                          </ActionButton>

                          <ActionButton
                            variant="danger"
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={isDeletingReviewId === review.id}
                          >
                            <TrashIcon />
                            {isDeletingReviewId === review.id ? "削除中..." : "削除"}
                          </ActionButton>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditingThisReview ? (
                    <div style={{ marginTop: "20px" }}>
                      <div style={{ marginBottom: "18px" }}>
                        <label
                          style={{
                            display: "block",
                            color: COLORS.navy,
                            fontSize: "16px",
                            fontWeight: 900,
                            marginBottom: "8px",
                          }}
                        >
                          評価
                        </label>

                        <select
                          value={editReviewRating}
                          onChange={(e) => setEditReviewRating(e.target.value)}
                          style={{
                            width: "160px",
                            height: "48px",
                            borderRadius: RADII.sm,
                            border: `1px solid ${COLORS.lineStrong}`,
                            backgroundColor: COLORS.surface,
                            color: COLORS.navy,
                            fontSize: "17px",
                            fontWeight: 900,
                            padding: "0 12px",
                            outline: "none",
                          }}
                        >
                          <option value="5">5</option>
                          <option value="4">4</option>
                          <option value="3">3</option>
                          <option value="2">2</option>
                          <option value="1">1</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: "18px" }}>
                        <label
                          style={{
                            display: "block",
                            color: COLORS.navy,
                            fontSize: "16px",
                            fontWeight: 900,
                            marginBottom: "8px",
                          }}
                        >
                          コメント
                        </label>

                        <LatexTemplateSelector onInsert={insertEditReviewLatexTemplate} />

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            marginBottom: "14px",
                            flexWrap: "wrap",
                          }}
                        >
                          <ModeButton
                            active={editReviewMode === "input"}
                            onClick={() => setEditReviewMode("input")}
                          >
                            入力
                          </ModeButton>

                          <ModeButton
                            active={editReviewMode === "preview"}
                            onClick={() => setEditReviewMode("preview")}
                          >
                            プレビュー
                          </ModeButton>
                        </div>

                        {editReviewMode === "input" ? (
                          <textarea
                            value={editReviewComment}
                            onChange={(e) => setEditReviewComment(e.target.value)}
                            rows={5}
                            placeholder="解法の美しさ、難易度、学習効果などをレビューしてください。"
                            style={{
                              width: "100%",
                              resize: "vertical",
                              borderRadius: "16px",
                              border: `1px solid ${COLORS.lineStrong}`,
                              backgroundColor: COLORS.surface,
                              color: COLORS.text,
                              fontSize: "17px",
                              lineHeight: 1.8,
                              padding: "16px 18px",
                              outline: "none",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              minHeight: "150px",
                              borderRadius: "16px",
                              border: `1px solid ${COLORS.lineStrong}`,
                              backgroundColor: COLORS.surface,
                              color: COLORS.text,
                              fontSize: "17px",
                              lineHeight: 1.8,
                              padding: "16px 18px",
                            }}
                          >
                            {editReviewComment.trim() ? (
                              <ProblemMarkdown content={editReviewComment} />
                            ) : (
                              <p
                                style={{
                                  margin: 0,
                                  color: COLORS.muted,
                                  fontSize: "15px",
                                  lineHeight: 1.8,
                                }}
                              >
                                ここにコメントのプレビューが表示されます。
                              </p>
                            )}
                          </div>
                        )}

                        <LatexHelpChips />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                          justifyContent: "flex-end",
                        }}
                      >
                        <ActionButton
                          onClick={() => {
                            setEditingReviewId(null)
                            setEditReviewComment("")
                            setEditReviewRating("5")
                            setEditReviewMode("input")
                          }}
                        >
                          キャンセル
                        </ActionButton>

                        <ActionButton
                          variant="primary"
                          onClick={() => handleUpdateReview(review.id)}
                          disabled={isUpdatingReviewId === review.id}
                        >
                          {isUpdatingReviewId === review.id ? "保存中..." : "保存する"}
                        </ActionButton>
                      </div>
                    </div>
                  ) : review.comment ? (
                    <div
                      style={{
                        marginTop: "18px",
                        color: COLORS.text,
                        fontSize: "17px",
                        lineHeight: 1.8,
                      }}
                    >
                      <ProblemMarkdown content={review.comment} />
                    </div>
                  ) : (
                    <p
                      style={{
                        margin: "18px 0 0",
                        color: COLORS.muted,
                        fontSize: "15px",
                        lineHeight: 1.8,
                      }}
                    >
                      コメントなし
                    </p>
                  )}
                </SectionCard>
              )
            })}
          </div>
        )}
      </section>
    </PageShell>
  )
}