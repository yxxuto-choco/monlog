"use client"

import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Tag = {
  id: string
  name: string
}

/* =========================================================
  問ログ Design System v1.5
========================================================= */
const COLORS = {
  paper: "#FAF7F0",
  surface: "#FFFFFF",
  navy: "#1E3A5F",
  text: "#1F2937",
  muted: "#64748B",
  slate: "#526984",
  line: "#D8DDD6",
  lineStrong: "#C9D2CD",
  teal: "#2A9D8F",
  tealPanel: "#E3F1EE",
  tagBg: "#E2F1EE",
  tagText: "#158B80",
  danger: "#DC2626",
  success: "#2A9D8F",
  softYellow: "#FBF8EF",
}

/* =========================================================
  アイコン
========================================================= */
function BackIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 12H5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
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

function PlusIcon({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5v14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TagIcon({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L3 13V3h10l7.59 7.59a2 2 0 0 1 0 2.82Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 7.5h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* =========================================================
  共通小部品
========================================================= */
function FieldLabel({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label
        style={{
          display: "block",
          color: COLORS.navy,
          fontSize: "18px",
          fontWeight: 900,
          lineHeight: 1.4,
        }}
      >
        {title}
      </label>

      {description && (
        <p
          style={{
            margin: "6px 0 0",
            color: COLORS.slate,
            fontSize: "15px",
            lineHeight: 1.7,
            fontWeight: 600,
          }}
        >
          {description}
        </p>
      )}
    </div>
  )
}

export default function NewProblemPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTagName, setNewTagName] = useState("")
  const [suggestions, setSuggestions] = useState<Tag[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  /* ---------------------------------------------------------
    既存タグ取得
  --------------------------------------------------------- */
  useEffect(() => {
    async function fetchTags() {
      const { data, error } = await supabase.from("tags").select("*").order("name")

      if (error) {
        console.error("タグ取得エラー:", error.message)
        setErrorMessage("タグの取得に失敗しました。")
        return
      }

      if (data) {
        setTags(data as Tag[])
      }
    }

    fetchTags()
  }, [])

  /* ---------------------------------------------------------
    タグ選択
  --------------------------------------------------------- */
  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  /* ---------------------------------------------------------
    入力中タグ候補
  --------------------------------------------------------- */
  useEffect(() => {
    const keyword = newTagName.trim().toLowerCase()

    if (!keyword) {
      setSuggestions([])
      return
    }

    const filtered = tags.filter((tag) => tag.name.toLowerCase().includes(keyword))
    setSuggestions(filtered.slice(0, 5))
  }, [newTagName, tags])

  /* ---------------------------------------------------------
    タグ追加
  --------------------------------------------------------- */
  async function handleAddTag() {
    const name = newTagName.trim()
    if (!name) return

    setErrorMessage("")
    setMessage("")

    const existing = tags.find((tag) => tag.name.toLowerCase() === name.toLowerCase())

    if (existing) {
      setSelectedTags((prev) =>
        prev.includes(existing.id) ? prev : [...prev, existing.id]
      )
      setNewTagName("")
      setSuggestions([])
      return
    }

    const { data, error } = await supabase
      .from("tags")
      .insert({ name })
      .select()
      .single()

    if (error || !data) {
      console.error("タグ作成エラー:", error?.message)
      setErrorMessage("タグの作成に失敗しました。")
      return
    }

    const createdTag = data as Tag

    setTags((prev) => [...prev, createdTag])
    setSelectedTags((prev) => [...prev, createdTag.id])
    setNewTagName("")
    setSuggestions([])
  }

  /* ---------------------------------------------------------
    投稿
  --------------------------------------------------------- */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

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
      const errorText =
        error?.message ??
        error?.details ??
        error?.hint ??
        JSON.stringify(error)

      console.error("問題作成エラー:", errorText)
      setErrorMessage(`投稿に失敗しました：${errorText}`)
      setIsSubmitting(false)
      return
    }

    const inserts = selectedTags.map((tagId) => ({
      problem_id: problem.id,
      tag_id: tagId,
    }))

    const { error: relationError } = await supabase.from("problem_tags").insert(inserts)

    if (relationError) {
      const errorText =
        relationError.message ??
        relationError.details ??
        relationError.hint ??
        JSON.stringify(relationError)

      console.error("タグ紐付けエラー:", errorText)
      setErrorMessage(`タグの紐付けに失敗しました：${errorText}`)
      setIsSubmitting(false)
      return
    }

    setMessage("投稿しました！詳細ページへ移動します。")

    setTimeout(() => {
      router.push(`/problems/${problem.id}`)
    }, 900)
  }

  const selectedTagObjects = tags.filter((tag) => selectedTags.includes(tag.id))

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: COLORS.paper,
        color: COLORS.text,
        padding: "32px 0 72px",
      }}
    >
      <div
        style={{
          width: "min(980px, calc(100vw - 48px))",
          margin: "0 auto",
        }}
      >
        {/* =====================================================
          戻る導線・ページヘッダー
        ===================================================== */}
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
              border: "none",
              background: "transparent",
              color: COLORS.teal,
              fontSize: "17px",
              fontWeight: 900,
              cursor: "pointer",
              padding: 0,
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
            問ログ / 問題投稿
          </div>
        </nav>

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
              fontSize: "48px",
              lineHeight: 1.15,
              fontWeight: 900,
              letterSpacing: "-0.04em",
            }}
          >
            問題を投稿する
          </h1>

          <p
            style={{
              margin: "18px 0 0",
              color: COLORS.slate,
              fontSize: "18px",
              lineHeight: 1.8,
              fontWeight: 600,
            }}
          >
            問題文を登録し、タグで分類して、あとから探しやすい形に整える。
          </p>
        </header>

        {/* =====================================================
          投稿フォーム
        ===================================================== */}
        <form onSubmit={handleSubmit}>
          <section
            style={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.line}`,
              borderRadius: "24px",
              boxShadow: "0 4px 14px rgba(30, 58, 95, 0.10)",
              padding: "36px",
              marginBottom: "28px",
            }}
          >
            <div style={{ marginBottom: "30px" }}>
              <FieldLabel
                title="タイトル"
                description="一覧や詳細ページで最も目立つ名前です。問題の内容が分かる短いタイトルにしてください。"
              />

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：2026年 東大理系数学 第1問"
                style={{
                  width: "100%",
                  height: "62px",
                  borderRadius: "16px",
                  border: `1px solid ${COLORS.lineStrong}`,
                  backgroundColor: COLORS.surface,
                  color: COLORS.text,
                  fontSize: "19px",
                  padding: "0 18px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <FieldLabel
                title="問題内容"
                description="問題文、条件、図形の説明、補足情報などを入力してください。改行はそのまま反映されます。"
              />

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="ここに問題文を入力してください。"
                rows={10}
                style={{
                  width: "100%",
                  resize: "vertical",
                  borderRadius: "18px",
                  border: `1px solid ${COLORS.lineStrong}`,
                  backgroundColor: COLORS.surface,
                  color: COLORS.text,
                  fontSize: "18px",
                  lineHeight: 1.8,
                  padding: "18px 20px",
                  outline: "none",
                }}
              />
            </div>
          </section>

          {/* =====================================================
            タグカード
          ===================================================== */}
          <section
            style={{
              backgroundColor: COLORS.tealPanel,
              border: `1px solid #B8DCD5`,
              borderLeft: `6px solid ${COLORS.teal}`,
              borderRadius: "22px",
              padding: "32px 34px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "18px",
                flexWrap: "wrap",
                marginBottom: "22px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: COLORS.navy,
                    fontSize: "28px",
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <TagIcon />
                  タグ
                </h2>

                <p
                  style={{
                    margin: "10px 0 0",
                    color: COLORS.slate,
                    fontSize: "16px",
                    lineHeight: 1.7,
                    fontWeight: 600,
                  }}
                >
                  既存タグを選択するか、新しいタグを追加してください。
                </p>
              </div>

              <div
                style={{
                  color: selectedTags.length > 0 ? COLORS.teal : COLORS.muted,
                  fontSize: "15px",
                  fontWeight: 900,
                }}
              >
                選択中: {selectedTags.length}件
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: suggestions.length > 0 ? "12px" : "22px",
              }}
            >
              <input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="タグを入力"
                style={{
                  flex: "1 1 360px",
                  minWidth: "240px",
                  height: "58px",
                  borderRadius: "14px",
                  border: `1px solid ${COLORS.lineStrong}`,
                  backgroundColor: COLORS.surface,
                  color: COLORS.text,
                  fontSize: "17px",
                  padding: "0 16px",
                  outline: "none",
                }}
              />

              <button
                type="button"
                onClick={handleAddTag}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  height: "58px",
                  padding: "0 22px",
                  borderRadius: "14px",
                  border: "none",
                  backgroundColor: COLORS.teal,
                  color: "#FFFFFF",
                  fontSize: "17px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                <PlusIcon />
                追加
              </button>
            </div>

            {suggestions.length > 0 && (
              <div
                style={{
                  backgroundColor: COLORS.surface,
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: "16px",
                  overflow: "hidden",
                  marginBottom: "22px",
                  boxShadow: "0 3px 10px rgba(30, 58, 95, 0.06)",
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
                      border: "none",
                      borderBottom: `1px solid ${COLORS.line}`,
                      backgroundColor: selectedTags.includes(tag.id)
                        ? COLORS.tagBg
                        : COLORS.surface,
                      color: COLORS.navy,
                      textAlign: "left",
                      padding: "13px 18px",
                      fontSize: "16px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    #{tag.name}
                    {selectedTags.includes(tag.id) ? "　選択中" : ""}
                  </button>
                ))}
              </div>
            )}

            {selectedTagObjects.length > 0 && (
              <div
                style={{
                  backgroundColor: COLORS.surface,
                  borderRadius: "16px",
                  padding: "18px",
                  marginBottom: "22px",
                  border: `1px solid ${COLORS.line}`,
                }}
              >
                <p
                  style={{
                    margin: "0 0 12px",
                    color: COLORS.navy,
                    fontSize: "15px",
                    fontWeight: 900,
                  }}
                >
                  選択中のタグ
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  {selectedTagObjects.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      style={{
                        border: "none",
                        borderRadius: "999px",
                        backgroundColor: COLORS.teal,
                        color: "#FFFFFF",
                        padding: "9px 18px",
                        fontSize: "15px",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      #{tag.name} ×
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p
                style={{
                  margin: "0 0 14px",
                  color: COLORS.navy,
                  fontSize: "16px",
                  fontWeight: 900,
                }}
              >
                既存タグ一覧
              </p>

              {tags.length === 0 ? (
                <p
                  style={{
                    margin: 0,
                    color: COLORS.muted,
                    fontSize: "15px",
                  }}
                >
                  まだタグがありません。上の入力欄から作成できます。
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
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
                          border: "none",
                          borderRadius: "999px",
                          backgroundColor: selected ? COLORS.teal : COLORS.tagBg,
                          color: selected ? "#FFFFFF" : COLORS.tagText,
                          padding: "9px 18px",
                          fontSize: "15px",
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      >
                        #{tag.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          {/* =====================================================
            メッセージ・投稿ボタン
          ===================================================== */}
          {(errorMessage || message) && (
            <section
              style={{
                marginBottom: "22px",
                borderRadius: "18px",
                padding: "18px 20px",
                backgroundColor: errorMessage ? "#FEF2F2" : COLORS.softYellow,
                border: `1px solid ${errorMessage ? "#FCA5A5" : COLORS.line}`,
                color: errorMessage ? COLORS.danger : COLORS.success,
                fontSize: "16px",
                fontWeight: 900,
                lineHeight: 1.7,
              }}
            >
              {errorMessage || message}
            </section>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              minHeight: "72px",
              border: "none",
              borderRadius: "18px",
              backgroundColor: COLORS.navy,
              color: "#FFFFFF",
              fontSize: "24px",
              fontWeight: 900,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
              boxShadow: "0 4px 14px rgba(30, 58, 95, 0.14)",
            }}
          >
            {isSubmitting ? "投稿中..." : "投稿する"}
          </button>
        </form>
      </div>
    </main>
  )
}
