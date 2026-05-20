"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Breadcrumbs from "@/components/navigation/Breadcrumbs"
import ProblemMarkdown from "@/components/ProblemMarkdown"
import UserMiniBadge from "@/components/UserMiniBadge"
import MarkdownEditor from "@/components/editor/MarkdownEditor"
import PageShell from "@/components/ui/PageShell"
import SectionCard from "@/components/ui/SectionCard"
import MessageBox from "@/components/ui/MessageBox"
import ActionButton from "@/components/ui/ActionButton"
import PrimarySubmitButton from "@/components/ui/PrimarySubmitButton"
import TextInput from "@/components/ui/TextInput"
import FieldLabel from "@/components/ui/FieldLabel"
import FieldDescription from "@/components/ui/FieldDescription"
import TagButton from "@/components/tags/TagButton"
import { COLORS, RADII, SHADOWS } from "@/components/ui/designTokens"
import EditIcon from "@/components/icons/EditIcon"
import TrashIcon from "@/components/icons/TrashIcon"
import RatingField from "@/components/reviews/RatingField"
import ReviewCommentBody from "@/components/reviews/ReviewCommentBody"
import ReviewSummary from "@/components/reviews/ReviewSummary"
import ProblemHeader from "@/components/problems/ProblemHeader"

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
        <Breadcrumbs
          items={[
            { label: "問ログ", href: "/" },
            { label: "問題一覧", href: "/" },
            { label: "問題詳細" },
          ]}
        />
        <SectionCard>読み込み中...</SectionCard>
      </PageShell>
    )
  }

  if (!problem) {
    return (
      <PageShell>
        <Breadcrumbs
        items={[
          { label: "問ログ", href: "/" },
          { label: "問題一覧", href: "/" },
          { label: "問題詳細" },
        ]}
      />

        <MessageBox type="error">{errorMessage || "問題が見つかりませんでした。"}</MessageBox>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "問ログ", href: "/" },
          { label: "問題一覧", href: "/" },
          { label: "問題詳細" },
        ]}
      />

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
              <FieldLabel size="16px">タイトル</FieldLabel>

              <TextInput
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <FieldLabel size="16px">問題内容</FieldLabel>

              <div style={{ marginBottom: "12px" }}>
                <FieldDescription>
                  文章はそのまま入力できます。数式を使いたい場合は $...$ や $$...$$
                  で囲んでください。保存前にプレビューで確認できます。
                </FieldDescription>
              </div>

              <MarkdownEditor
                value={editContent}
                onChange={setEditContent}
                mode={editContentMode}
                onModeChange={setEditContentMode}
                onInsertLatex={insertEditProblemLatexTemplate}
                rows={8}
                previewMinHeight="210px"
                placeholder="ここに問題内容を入力してください。"
                emptyPreviewText="ここに問題内容のプレビューが表示されます。"
              />
            </div>

            <div style={{ marginBottom: "22px" }}>
              <FieldLabel size="16px">タグ</FieldLabel>

              <div style={{ marginBottom: "12px" }}>
                <FieldDescription>
                  既存タグを選択するか、新しいタグを追加できます。タグは1つ以上選択してください。
                </FieldDescription>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 260px" }}>
                  <TextInput
                    value={newEditTagName}
                    onChange={(e) => setNewEditTagName(e.target.value)}
                    placeholder="タグを入力"
                    height="48px"
                    fontSize="16px"
                    fontWeight={700}
                  />
                </div>

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
                    <TagButton
                      key={tag.id}
                      name={tag.name}
                      selected={selected}
                      onClick={() => toggleEditTag(tag.id)}
                    />
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
        <ProblemHeader
          title={problem.title}
          createdAtLabel={formatDate(problem.created_at)}
          averageRating={roundedAverage}
          reviewCount={reviews.length}
          tags={problem.tags}
          ownerUserId={problem.user_id}
          isProblemOwner={isProblemOwner}
          isDeletingProblem={isDeletingProblem}
          onStartEdit={() => {
            setEditTitle(problem.title)
            setEditContent(problem.content ?? "")
            setSelectedEditTagIds(problem.tagIds)
            setEditContentMode("input")
            setNewEditTagName("")
            setEditTagSuggestions([])
            setIsEditingProblem(true)
          }}
          onDeleteProblem={handleDeleteProblem}
        />
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

            <RatingField value={rating} onChange={setRating} />

            <div style={{ marginBottom: "18px" }}>
              <FieldLabel size="16px">コメント</FieldLabel>

              <div style={{ marginBottom: "12px" }}>
                <FieldDescription>
                  文章はそのまま入力できます。数式を使いたい場合は $...$ や $$...$$
                  で囲んでください。投稿前にプレビューで確認できます。
                </FieldDescription>
              </div>

              <MarkdownEditor
                value={comment}
                onChange={setComment}
                mode={commentMode}
                onModeChange={setCommentMode}
                onInsertLatex={insertCommentLatexTemplate}
                rows={5}
                previewMinHeight="150px"
                placeholder="解法の美しさ、難易度、学習効果などをレビューしてください。"
                emptyPreviewText="ここにコメントのプレビューが表示されます。"
              />
            </div>

            <PrimarySubmitButton onClick={handleSubmitReview} disabled={isSubmitting}>
              {isSubmitting ? "投稿中..." : "レビューを投稿する"}
            </PrimarySubmitButton>
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
                        <ReviewSummary rating={review.rating} />
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
                    <RatingField value={editReviewRating} onChange={setEditReviewRating} />

                      <div style={{ marginBottom: "18px" }}>
                        <FieldLabel size="16px">コメント</FieldLabel>

                        <div style={{ marginBottom: "12px" }}>
                          <FieldDescription>
                            文章はそのまま入力できます。数式を使いたい場合は $...$ や $$...$$
                            で囲んでください。保存前にプレビューで確認できます。
                          </FieldDescription>
                        </div>

                        <MarkdownEditor
                          value={editReviewComment}
                          onChange={setEditReviewComment}
                          mode={editReviewMode}
                          onModeChange={setEditReviewMode}
                          onInsertLatex={insertEditReviewLatexTemplate}
                          rows={5}
                          previewMinHeight="150px"
                          placeholder="解法の美しさ、難易度、学習効果などをレビューしてください。"
                          emptyPreviewText="ここにコメントのプレビューが表示されます。"
                        />
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
                ) : (
                  <ReviewCommentBody comment={review.comment} />
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
