"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function useProfileForm() {
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [username, setUsername] = useState("")
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true)
      setMessage("")
      setErrorMessage("")

      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        setUserId(null)
        setEmail(null)
        setUsername("")
        setIsLoading(false)
        return
      }

      const user = userData.user
      setUserId(user.id)
      setEmail(user.email ?? null)

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error("プロフィール取得エラー:", profileError.message)
        setErrorMessage("プロフィールの取得に失敗しました。")
      }

      setUsername(profile?.username ?? "")
      setIsLoading(false)
    }

    fetchProfile()
  }, [])

  async function handleSave() {
    setMessage("")
    setErrorMessage("")

    if (!userId) {
      setErrorMessage("ログインしてください。")
      return
    }

    if (!username.trim()) {
      setErrorMessage("ユーザー名を入力してください。")
      return
    }

    if (username.trim().length > 40) {
      setErrorMessage("ユーザー名は40文字以内にしてください。")
      return
    }

    setIsSaving(true)

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      username: username.trim(),
      updated_at: new Date().toISOString(),
    })

    setIsSaving(false)

    if (error) {
      console.error("プロフィール保存エラー:", error.message)
      setErrorMessage("保存に失敗しました。既に使われているユーザー名の可能性があります。")
      return
    }

    setUsername(username.trim())
    setMessage("プロフィールを保存しました。")
  }

  return {
    userId,
    email,
    username,
    setUsername,
    message,
    errorMessage,
    isLoading,
    isSaving,
    handleSave,
  }
}
