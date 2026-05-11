"use client"

import type { FormEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ProblemMarkdown from "@/components/ProblemMarkdown"

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

function PlusIcon({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
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
      <path d="M7.5 7.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function ImageIcon({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        fill="currentColor"
      />
      <path
        d="M21 16l-5.2-5.2a2 2 0 0 0-2.8 0L5 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function InlineCode({ children }: { children: string }) {
  return (
    <code
      style={{
        display: "inline-block",
        border: `1px solid ${COLORS.line}`,
        backgroundColor: COLORS.softYellow,
        borderRadius: "8px",
        padding: "2px 7px",
        color: COLORS.navy,
        fontSize: "13px",
        fontWeight: 800,
      }}
    >
      {children}
    </code>
  )
}

function FormulaButton({
  label,
  onClick,
  disabled = false,
  icon,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  icon?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        height: "38px",
        padding: "0 13px",
        borderRadius: "999px",
        border: `1px solid ${COLORS.lineStrong}`,
        backgroundColor: COLORS.surface,
        color: disabled ? COLORS.muted : COLORS.navy,
        fontSize: "14px",
        fontWeight: 900,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
      }}
    >
      {icon}
      {label}
    </button>
  )
}

export default function NewProblemPage() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTagName, setNewTagName] = useState("")
  const [suggestions, setSuggestions] = useState<Tag[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write")

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
    本文へのテンプレート挿入
  --------------------------------------------------------- */
  function insertTemplate(template: string, cursorOffset?: number) {
    setEditorMode("write")

    const textarea = textareaRef.current
    const start = textarea?.selectionStart ?? content.length
    const end = textarea?.selectionEnd ?? content.length

    const before = content.slice(0, start)
    const after = content.slice(end)
    const nextContent = `${before}${template}${after}`

    setContent(nextContent)

    const nextCursorPosition = start + (cursorOffset ?? template.length)

    window.setTimeout(() => {
      const currentTextarea = textareaRef.current
      if (!currentTextarea) return

      currentTextarea.focus()
      currentTextarea.setSelectionRange(nextCursorPosition, nextCursorPosition)
    }, 0)
  }

  function insertInlineFormula(formula: string, cursorOffset?: number) {
    insertTemplate(`$ ${formula} $`, cursorOffset)
  }

  function insertDisplayFormula(formula: string, cursorOffset?: number) {
    const template = `\n$$\n${formula}\n$$\n`
    insertTemplate(template, cursorOffset)
  }

  /* ---------------------------------------------------------
    画像アップロード
  --------------------------------------------------------- */
  async function handleImageUpload(file: File) {
    setErrorMessage("")
    setMessage("")

    if (!file.type.startsWith("image/")) {
      setErrorMessage("画像ファイルを選択してください。")
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
      setErrorMessage("画像サイズは5MB以下にしてください。")
      return
    }

    setIsUploadingImage(true)

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      setErrorMessage("画像をアップロードするにはログインが必要です。")
      setIsUploadingImage(false)
      return
    }

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "png"
    const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"]

    if (!allowedExtensions.includes(extension)) {
      setErrorMessage("アップロードできる画像は jpg / jpeg / png / webp / gif です。")
      setIsUploadingImage(false)
      return
    }

    const filePath = `${userData.user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`

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

    const imageMarkdown = `\n\n![画像](${publicUrlData.publicUrl})\n\n`

    insertTemplate(imageMarkdown)
    setMessage("画像を本文に挿入しました。プレビューで確認できます。")
    setIsUploadingImage(false)
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

        {/* hidden image input */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return

            await handleImageUpload(file)
            e.target.value = ""
          }}
        />

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

            {/* =====================================================
              問題内容：入力 / プレビュー / 数式テンプレート / 画像
            ===================================================== */}
            <div>
              <FieldLabel
                title="問題内容"
                description="文章はそのまま入力できます。数式・画像も本文に挿入できます。投稿前にプレビューで確認できます。"
              />

              <div
                style={{
                  backgroundColor: COLORS.tealPanel,
                  border: `1px solid #B8DCD5`,
                  borderLeft: `5px solid ${COLORS.teal}`,
                  borderRadius: "18px",
                  padding: "18px 20px",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginBottom: "14px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: COLORS.navy,
                        fontSize: "16px",
                        fontWeight: 900,
                      }}
                    >
                      入力補助
                    </p>

                    <p
                      style={{
                        margin: "5px 0 0",
                        color: COLORS.slate,
                        fontSize: "14px",
                        lineHeight: 1.6,
                        fontWeight: 600,
                      }}
                    >
                      数式や画像を、本文のカーソル位置に挿入できます。長い数式や解説はPrismで下書きして貼り付けるのもおすすめです。
                    </p>
                  </div>

                  <a
                    href="https://prism.openai.com/"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "38px",
                      padding: "0 14px",
                      borderRadius: "999px",
                      backgroundColor: COLORS.navy,
                      color: "#FFFFFF",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: 900,
                    }}
                  >
                    Prismで下書き
                  </a>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "9px",
                  }}
                >
                  <FormulaButton
                    label={isUploadingImage ? "画像アップロード中..." : "画像を追加"}
                    disabled={isUploadingImage}
                    icon={<ImageIcon size={17} />}
                    onClick={() => imageInputRef.current?.click()}
                  />

                  <FormulaButton
                    label="分数"
                    onClick={() => insertInlineFormula(String.raw`\frac{a}{b}`, 4)}
                  />

                  <FormulaButton
                    label="平方根"
                    onClick={() => insertInlineFormula(String.raw`\sqrt{x}`, 8)}
                  />

                  <FormulaButton
                    label="指数"
                    onClick={() => insertInlineFormula(String.raw`x^{2}`, 5)}
                  />

                  <FormulaButton
                    label="添字"
                    onClick={() => insertInlineFormula(String.raw`a_{n}`, 5)}
                  />

                  <FormulaButton
                    label="積分"
                    onClick={() => insertDisplayFormula(String.raw`\int_0^1 x^2 dx`, 8)}
                  />

                  <FormulaButton
                    label="Σ"
                    onClick={() =>
                      insertDisplayFormula(String.raw`\sum_{k=1}^{n} k = \frac{n(n+1)}{2}`, 12)
                    }
                  />

                  <FormulaButton
                    label="場合分け"
                    onClick={() =>
                      insertDisplayFormula(
                        String.raw`f(x)=
\begin{cases}
x^2 & (x \ge 0) \\
-x & (x < 0)
\end{cases}`,
                        9
                      )
                    }
                  />

                  <FormulaButton
                    label="=をそろえる"
                    onClick={() =>
                      insertDisplayFormula(
                        String.raw`\begin{array}{rcl}
a &=& b + c \\
  &=& d
\end{array}`,
                        20
                      )
                    }
                  />

                  <FormulaButton
                    label="行列"
                    onClick={() =>
                      insertDisplayFormula(
                        String.raw`\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}`,
                        16
                      )
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "14px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditorMode("write")}
                  style={{
                    height: "42px",
                    padding: "0 16px",
                    borderRadius: "999px",
                    border: `1px solid ${
                      editorMode === "write" ? COLORS.teal : COLORS.lineStrong
                    }`,
                    backgroundColor: editorMode === "write" ? COLORS.teal : COLORS.surface,
                    color: editorMode === "write" ? "#FFFFFF" : COLORS.navy,
                    fontSize: "15px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  入力
                </button>

                <button
                  type="button"
                  onClick={() => setEditorMode("preview")}
                  style={{
                    height: "42px",
                    padding: "0 16px",
                    borderRadius: "999px",
                    border: `1px solid ${
                      editorMode === "preview" ? COLORS.teal : COLORS.lineStrong
                    }`,
                    backgroundColor: editorMode === "preview" ? COLORS.teal : COLORS.surface,
                    color: editorMode === "preview" ? "#FFFFFF" : COLORS.navy,
                    fontSize: "15px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  プレビュー
                </button>
              </div>

              {editorMode === "write" ? (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`ここに問題文を入力してください。

通常の文章はそのまま入力できます。

画像は「画像を追加」ボタンから挿入できます。

インライン数式：
$ \\frac{1}{2} $

表示数式：
$$
\\int_0^1 x^2 dx
$$

= をそろえる例：
$$
\\begin{array}{rcl}
a &=& b + c \\\\
  &=& d
\\end{array}
$$
`}
                  rows={12}
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
              ) : (
                <div
                  style={{
                    minHeight: "300px",
                    borderRadius: "18px",
                    border: `1px solid ${COLORS.lineStrong}`,
                    backgroundColor: COLORS.surface,
                    padding: "22px 24px",
                  }}
                >
                  {content.trim() ? (
                    <ProblemMarkdown content={content} />
                  ) : (
                    <p
                      style={{
                        margin: 0,
                        color: COLORS.muted,
                        fontSize: "16px",
                        lineHeight: 1.8,
                      }}
                    >
                      ここにプレビューが表示されます。
                    </p>
                  )}
                </div>
              )}

              <div
                style={{
                  marginTop: "12px",
                  color: COLORS.slate,
                  fontSize: "14px",
                  lineHeight: 1.8,
                  fontWeight: 600,
                }}
              >
                <span>画像：</span>{" "}
                <InlineCode>{String.raw`![画像](URL)`}</InlineCode>{" "}
                <span> / インライン数式：</span>{" "}
                <InlineCode>{String.raw`$ \frac{1}{2} $`}</InlineCode>{" "}
                <span> / 表示数式：</span>{" "}
                <InlineCode>{String.raw`$$ \int_0^1 x^2 dx $$`}</InlineCode>
              </div>
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
            disabled={isSubmitting || isUploadingImage}
            style={{
              width: "100%",
              minHeight: "72px",
              border: "none",
              borderRadius: "18px",
              backgroundColor: COLORS.navy,
              color: "#FFFFFF",
              fontSize: "24px",
              fontWeight: 900,
              cursor: isSubmitting || isUploadingImage ? "not-allowed" : "pointer",
              opacity: isSubmitting || isUploadingImage ? 0.7 : 1,
              boxShadow: "0 4px 14px rgba(30, 58, 95, 0.14)",
            }}
          >
            {isSubmitting ? "投稿中..." : isUploadingImage ? "画像アップロード中..." : "投稿する"}
          </button>
        </form>
      </div>
    </main>
  )
}