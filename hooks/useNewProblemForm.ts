"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type EditorMode = "input" | "preview"

export type NewProblemTag = {
  id: string
  name: string
}

export default function useNewProblemForm() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [contentMode, setContentMode] = useState<EditorMode>("input")

  const [tags, setTags] = useState<NewProblemTag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTagName, setNewTagName] = useState("")
  const [suggestions, setSuggestions] = useState<NewProblemTag[]>([])

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

      if (data) setTags(data as NewProblemTag[])
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

  function handleSelectSuggestion(tagId: string) {
    toggleTag(tagId)
    setNewTagName("")
    setSuggestions([])
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

    const createdTag = data as NewProblemTag

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
      const message = error?.message ?? error?.details ?? error?.hint ?? JSON.stringify(error)

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

  return {
    title,
    setTitle,
    content,
    setContent,
    contentMode,
    setContentMode,
    tags,
    selectedTags,
    newTagName,
    setNewTagName,
    suggestions,
    isSubmitting,
    isUploadingImage,
    message,
    errorMessage,
    toggleTag,
    handleSelectSuggestion,
    insertLatexTemplate,
    handleImageUpload,
    handleAddTag,
    handleSubmit,
  }
}
