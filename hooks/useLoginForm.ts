"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function useLoginForm() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSignUp() {
    setMessage("")
    setErrorMessage("")

    if (!email.trim() || !password.trim()) {
      setErrorMessage("メールアドレスとパスワードを入力してください。")
      return
    }

    if (password.length < 6) {
      setErrorMessage("パスワードは6文字以上で入力してください。")
      return
    }

    setIsLoading(true)

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    setIsLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setMessage("登録しました。確認メールが届いている場合は、メール内のリンクを開いてください。")
  }

  async function handleSignIn() {
    setMessage("")
    setErrorMessage("")

    if (!email.trim() || !password.trim()) {
      setErrorMessage("メールアドレスとパスワードを入力してください。")
      return
    }

    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setIsLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    router.push("/")
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    message,
    errorMessage,
    isLoading,
    handleSignUp,
    handleSignIn,
  }
}
