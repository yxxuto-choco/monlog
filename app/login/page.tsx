"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
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

    setIsLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
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
      email,
      password,
    })

    setIsLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    router.push("/")
  }

  return (
    <main className="p-10 max-w-md mx-auto">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          学問ログ（仮）
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">ログイン</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">ログイン / 新規登録</h1>

      <div className="border rounded p-4">
        <div className="mb-4">
          <label className="block mb-1">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="example@example.com"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="6文字以上"
          />
        </div>

        {errorMessage && (
          <p className="mb-4 text-sm text-red-500">{errorMessage}</p>
        )}

        {message && (
          <p className="mb-4 text-sm text-green-600">{message}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="bg-black text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            ログイン
          </button>

          <button
            onClick={handleSignUp}
            disabled={isLoading}
            className="border px-4 py-2 rounded disabled:bg-gray-200"
          >
            新規登録
          </button>
        </div>
      </div>
    </main>
  )
}