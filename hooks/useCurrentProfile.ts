"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function useCurrentProfile() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

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

  useEffect(() => {
    loadUserAndProfile()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUserAndProfile()
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return {
    userId,
    userEmail,
    userName,
    reloadUserAndProfile: loadUserAndProfile,
  }
}
