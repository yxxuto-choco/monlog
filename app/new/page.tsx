"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Tag = {
  id: string
  name: string
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
  
  useEffect(() => {
    async function fetchTags() {
      const { data } = await supabase.from("tags").select("*")
      if (data) setTags(data)
    }
    fetchTags()
  }, [])

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  // 🔥 入力時に候補出す
  useEffect(() => {
    const keyword = newTagName.trim().toLowerCase()

    if (!keyword) {
      setSuggestions([])
      return
    }

    const filtered = tags.filter((tag) =>
      tag.name.toLowerCase().includes(keyword)
    )

    setSuggestions(filtered.slice(0, 5))
  }, [newTagName, tags])

  async function handleAddTag() {
    const name = newTagName.trim()
    if (!name) return

    // 完全一致チェック
    const existing = tags.find(
      (tag) => tag.name.toLowerCase() === name.toLowerCase()
    )

    if (existing) {
      setSelectedTags((prev) =>
        prev.includes(existing.id) ? prev : [...prev, existing.id]
      )
      setNewTagName("")
      setSuggestions([])
      return
    }

    // 新規作成
    const { data, error } = await supabase
      .from("tags")
      .insert({ name })
      .select()
      .single()

    if (error) {
      console.error(error)
      return
    }

    setTags((prev) => [...prev, data])
    setSelectedTags((prev) => [...prev, data.id])
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
        title,
        content,
        user_id: userData.user.id,
      })
      .select("id")
      .single()
  
    if (error || !problem) {
      const message =
        error?.message ??
        error?.details ??
        error?.hint ??
        JSON.stringify(error)
  
      console.error("問題作成エラー:", message)
      setErrorMessage(`投稿に失敗しました：${message}`)
      setIsSubmitting(false)
      return
    }
  
    const inserts = selectedTags.map((tagId) => ({
      problem_id: problem.id,
      tag_id: tagId,
    }))
  
    const { error: relationError } = await supabase
      .from("problem_tags")
      .insert(inserts)
  
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
      router.push(`/problems/${problem.id}`)
    }, 900)
  }

  return (
      <main className="p-10 max-w-2xl mx-auto">

      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-500 hover:underline"
      >
        ← 戻る
      </button>

      <h1 className="text-2xl font-bold mb-6">問題を投稿する</h1>

      <div className="mb-4">
        <label className="block mb-1">タイトル</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">内容</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 w-full rounded"
          rows={4}
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2">タグ</label>

        {/* 入力欄 */}
        <div className="flex gap-2 mb-2">
          <input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="border p-2 rounded flex-1"
            placeholder="タグを入力"
          />

          <button
            onClick={handleAddTag}
            className="border px-4 py-2 rounded"
          >
            追加
          </button>
        </div>

        {/* 🔥 候補表示 */}
        {suggestions.length > 0 && (
          <div className="border rounded mb-3">
            {suggestions.map((tag) => (
              <div
                key={tag.id}
                onClick={() => {
                  toggleTag(tag.id)
                  setNewTagName("")
                  setSuggestions([])
                }}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
              >
                #{tag.name}
              </div>
            ))}
          </div>
        )}

        {/* 選択タグ */}
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1 rounded border ${
                selectedTags.includes(tag.id)
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              #{tag.name}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <p className="mb-4 text-sm text-red-500">{errorMessage}</p>
      )}

      {message && (
        <p className="mb-4 text-sm text-green-600">{message}</p>
      )}

      <button
      onClick={handleSubmit}
      disabled={isSubmitting}
      className="bg-black text-white px-4 py-2 rounded disabled:bg-gray-400"
    >
      {isSubmitting ? "投稿中..." : "投稿する"}
    </button>
    </main>
  )
}