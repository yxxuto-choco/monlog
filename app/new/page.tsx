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

  // タグ取得
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

  async function handleSubmit() {
    if (!title.trim()) return

    // ① 問題作成
    const { data: problem, error } = await supabase
      .from("problems")
      .insert({
        title,
        content,
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      return
    }

    // ② タグ紐付け
    if (selectedTags.length > 0) {
      const inserts = selectedTags.map((tagId) => ({
        problem_id: problem.id,
        tag_id: tagId,
      }))

      await supabase.from("problem_tags").insert(inserts)
    }

    // ③ 詳細ページへ
    router.push(`/problems/${problem.id}`)
  }

  return (
    <main className="p-10 max-w-2xl mx-auto">
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

      <button
        onClick={handleSubmit}
        className="bg-black text-white px-4 py-2 rounded"
      >
        投稿する
      </button>
    </main>
  )
}