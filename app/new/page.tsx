"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Breadcrumbs from "@/components/navigation/Breadcrumbs"
import ProblemMarkdown from "@/components/ProblemMarkdown"
import LatexTemplateSelector from "@/components/LatexTemplateSelector"
import LatexHelpChips from "@/components/editor/LatexHelpChips"
import PageShell from "@/components/ui/PageShell"
import SectionCard from "@/components/ui/SectionCard"
import MessageBox from "@/components/ui/MessageBox"
import ModeButton from "@/components/ui/ModeButton"
import { COLORS, RADII, SHADOWS } from "@/components/ui/designTokens"

type Tag = {
  id: string
  name: string
}

function ImageIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M21 16l-5-5L5 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}


export default function NewProblemPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [contentMode, setContentMode] = useState<"input" | "preview">("input")

  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTagName, setNewTagName] = useState("")
  const [suggestions, setSuggestions] = useState<Tag[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function fetchTags() {
      const { data, error } = await supabase.from("tags").select("*").order("name")

      if (error) {
        console.warn("タグ取得エラー:", error.message)
        return
      }

      if (data) setTags(data as Tag[])
    }

    fetchTags()
  }, [])

  useEffect(() => {
    const keyword = newTagName.trim().toLowerCase()

    if (!keyword) {
      setSuggestions([])
      return
    }

    const filtered = tags.filter((tag) => tag.name.toLowerCase().includes(keyword))
    setSuggestions(filtered.slice(0, 5))
  }, [newTagName, tags])

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]
    )
  }

  function insertLatexTemplate(latex: string) {
    setContent((prev) => {
      const needsNewLine = prev.trim().length > 0
      return needsNewLine ? `${prev}\n\n${latex}` : latex
    })
    setContentMode("input")
  }

  function insertImageMarkdown(url: string, fileName: string) {
    const safeName = fileName.replace(/\.[^/.]+$/, "") || "画像"
    const markdown = `![${safeName}](${url})`

    setContent((prev) => {
      const needsNewLine = prev.trim().length > 0
      return needsNewLine ? `${prev}\n\n${markdown}` : markdown
    })

    setContentMode("input")
  }

  async function handleImageUpload(file: File | null) {
    setErrorMessage("")
    setMessage("")

    if (!file) return

    if (!file.type.startsWith("image/")) {
      setErrorMessage("画像ファイルを選択してください。")
      return
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      setErrorMessage("画像をアップロードするにはログインが必要です。")
      return
    }

    setIsUploadingImage(true)

    const ext = file.name.split(".").pop() ?? "png"
    const filePath = `${userData.user.id}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("problem-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("画像アップロードエラー:", uploadError.message)
      setErrorMessage(`画像アップロードに失敗しました：${uploadError.message}`)
      setIsUploadingImage(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from("problem-images")
      .getPublicUrl(filePath)

    insertImageMarkdown(publicUrlData.publicUrl, file.name)
    setMessage("画像を本文に挿入しました。")
    setIsUploadingImage(false)
  }

  async function handleAddTag() {
    const name = newTagName.trim()
    if (!name) return

    const existing = tags.find((tag) => tag.name.toLowerCase() === name.toLowerCase())

    if (existing) {
      setSelectedTags((prev) => (prev.includes(existing.id) ? prev : [...prev, existing.id]))
      setNewTagName("")
      setSuggestions([])
      return
    }

    const { data, error } = await supabase.from("tags").insert({ name }).select().single()

    if (error) {
      console.error("タグ作成エラー:", error.message)
      setErrorMessage(`タグの作成に失敗しました：${error.message}`)
      return
    }

    const createdTag = data as Tag

    setTags((prev) => [...prev, createdTag])
    setSelectedTags((prev) => [...prev, createdTag.id])
    setNewTagName("")
    setSuggestions([])
  }

  async function handleSubmit() {
    setErrorMessage("")
    setMessage("")

    if (!title.trim()) {
      setErrorMessage("タイトルを入力してください。")
      return
    }

    if (!content.trim()) {
      setErrorMessage("本文を入力してください。")
      return
    }

    if (selectedTags.length === 0) {
      setErrorMessage("タグを1つ以上選択してください。")
      return
    }

    setIsSubmitting(true)

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      setErrorMessage("ログインしてから投稿してください。")
      setIsSubmitting(false)
      return
    }

    const { data: problem, error } = await supabase
      .from("problems")
      .insert({
        title: title.trim(),
        content: content.trim(),
        user_id: userData.user.id,
      })
      .select("id")
      .single()

    if (error || !problem) {
      const message =
        error?.message ?? error?.details ?? error?.hint ?? JSON.stringify(error)

      console.error("問題作成エラー:", message)
      setErrorMessage(`投稿に失敗しました：${message}`)
      setIsSubmitting(false)
      return
    }

    const inserts = selectedTags.map((tagId) => ({
      problem_id: problem.id,
      tag_id: tagId,
    }))

    const { error: relationError } = await supabase.from("problem_tags").insert(inserts)

    if (relationError) {
      const message =
        relationError.message ??
        relationError.details ??
        relationError.hint ??
        JSON.stringify(relationError)

      console.error("タグ紐付けエラー:", message)
      setErrorMessage(`タグの紐付けに失敗しました：${message}`)
      setIsSubmitting(false)
      return
    }

    setMessage("投稿しました！")

    setTimeout(() => {
      router.replace(`/problems/${problem.id}`)
    }, 700)
  }

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "問ログ", href: "/" },
          { label: "問題投稿" },
        ]}
      />

      <header
        style={{
          textAlign: "center",
          marginBottom: "34px",
        }}
      >
        <h1
          style={{
            margin: 0,
            color: COLORS.navy,
            fontSize: "44px",
            lineHeight: 1.15,
            fontWeight: 900,
            letterSpacing: "-0.04em",
          }}
        >
          問題を投稿する
        </h1>

        <p
          style={{
            margin: "16px 0 0",
            color: COLORS.slate,
            fontSize: "17px",
            lineHeight: 1.8,
            fontWeight: 600,
          }}
        >
          問題文、タグ、画像、LaTeX数式をまとめて登録できます。
        </p>
      </header>

      {(errorMessage || message) && (
        <div style={{ marginBottom: "22px" }}>
          {errorMessage && <MessageBox type="error">{errorMessage}</MessageBox>}
          {message && <MessageBox type="success">{message}</MessageBox>}
        </div>
      )}

      <SectionCard
        style={{
          padding: "34px 36px",
          borderRadius: RADII.xxl,
          boxShadow: SHADOWS.cardStrong,
        }}
      >
        <div style={{ marginBottom: "28px" }}>
          <label
            style={{
              display: "block",
              color: COLORS.navy,
              fontSize: "20px",
              fontWeight: 900,
              marginBottom: "8px",
            }}
          >
            タイトル
          </label>

          <p
            style={{
              margin: "0 0 14px",
              color: COLORS.slate,
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: 1.7,
            }}
          >
            一覧や詳細ページで最も目立つ名前です。問題の内容が分かる短いタイトルにしてください。
          </p>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：2026年 東大理系数学 第1問"
            style={{
              width: "100%",
              height: "62px",
              borderRadius: RADII.md,
              border: `1px solid ${COLORS.lineStrong}`,
              backgroundColor: COLORS.surface,
              color: COLORS.text,
              fontSize: "18px",
              fontWeight: 700,
              padding: "0 18px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label
            style={{
              display: "block",
              color: COLORS.navy,
              fontSize: "20px",
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
            で囲んでください。投稿前にプレビューで確認できます。
          </p>

          <LatexTemplateSelector onInsert={insertLatexTemplate} />

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "14px",
              flexWrap: "wrap",
            }}
          >
            <ModeButton active={contentMode === "input"} onClick={() => setContentMode("input")}>
              入力
            </ModeButton>

            <ModeButton
              active={contentMode === "preview"}
              onClick={() => setContentMode("preview")}
            >
              プレビュー
            </ModeButton>

            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                minHeight: "40px",
                padding: "0 18px",
                borderRadius: RADII.pill,
                border: `1px solid ${COLORS.lineStrong}`,
                backgroundColor: COLORS.surface,
                color: COLORS.navy,
                fontSize: "15px",
                fontWeight: 900,
                cursor: isUploadingImage ? "not-allowed" : "pointer",
                opacity: isUploadingImage ? 0.65 : 1,
              }}
            >
              <ImageIcon />
              {isUploadingImage ? "画像アップロード中..." : "画像を挿入"}
              <input
                type="file"
                accept="image/*"
                disabled={isUploadingImage}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  handleImageUpload(file)
                  e.currentTarget.value = ""
                }}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {contentMode === "input" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              placeholder="ここに問題文を入力してください。"
              style={{
                width: "100%",
                resize: "vertical",
                borderRadius: "16px",
                border: `1px solid ${COLORS.lineStrong}`,
                backgroundColor: COLORS.surface,
                color: COLORS.text,
                fontSize: "17px",
                lineHeight: 1.8,
                padding: "18px 20px",
                outline: "none",
              }}
            />
          ) : (
            <div
              style={{
                minHeight: "280px",
                borderRadius: "16px",
                border: `1px solid ${COLORS.lineStrong}`,
                backgroundColor: COLORS.surface,
                color: COLORS.text,
                fontSize: "17px",
                lineHeight: 1.8,
                padding: "18px 20px",
              }}
            >
              {content.trim() ? (
                <ProblemMarkdown content={content} />
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

        <div style={{ marginBottom: "30px" }}>
          <label
            style={{
              display: "block",
              color: COLORS.navy,
              fontSize: "20px",
              fontWeight: 900,
              marginBottom: "8px",
            }}
          >
            タグ
          </label>

          <p
            style={{
              margin: "0 0 14px",
              color: COLORS.slate,
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: 1.7,
            }}
          >
            分野、難易度、テーマなどをタグで整理します。既存タグを選ぶか、新しく追加できます。
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
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
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
              onClick={handleAddTag}
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

          {suggestions.length > 0 && (
            <div
              style={{
                border: `1px solid ${COLORS.line}`,
                borderRadius: RADII.md,
                backgroundColor: COLORS.surface,
                overflow: "hidden",
                marginBottom: "16px",
              }}
            >
              {suggestions.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    toggleTag(tag.id)
                    setNewTagName("")
                    setSuggestions([])
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
            {tags.map((tag) => {
              const selected = selectedTags.includes(tag.id)

              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
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

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            width: "100%",
            minHeight: "64px",
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
          {isSubmitting ? "投稿中..." : "投稿する"}
        </button>
      </SectionCard>
    </PageShell>
  )
}
