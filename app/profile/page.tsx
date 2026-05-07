"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

/* =========================================================
  プロフィールページ：ユーザー名の表示・編集
========================================================= */
export default function ProfilePage() {
  /* ---------------------------------------------------------
    state：ログインユーザー情報
  --------------------------------------------------------- */
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  /* ---------------------------------------------------------
    state：プロフィール編集フォーム
  --------------------------------------------------------- */
  const [username, setUsername] = useState("")

  /* ---------------------------------------------------------
    state：メッセージ・読み込み状態
  --------------------------------------------------------- */
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  /* ---------------------------------------------------------
    初期表示：ログイン中ユーザーとプロフィールを取得
  --------------------------------------------------------- */
  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true)

      /* ---------------------------------------------------------
        Auth取得：現在ログインしているユーザーを取得
      --------------------------------------------------------- */
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        setUserId(null)
        setEmail(null)
        setIsLoading(false)
        return
      }

      const user = userData.user
      setUserId(user.id)
      setEmail(user.email ?? null)

      /* ---------------------------------------------------------
        DB取得：profilesテーブルからユーザー名を取得
        ※ 新規ユーザーではprofiles行がまだ無い可能性があるのでmaybeSingle()を使う
      --------------------------------------------------------- */
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error("プロフィール取得エラー:", profileError.message)
      }

      setUsername(profile?.username ?? "")
      setIsLoading(false)
    }

    fetchProfile()
  }, [])

  /* ---------------------------------------------------------
    保存処理：profilesテーブルにユーザー名を保存
    ※ 既存行があれば更新、なければ作成するためupsertを使う
  --------------------------------------------------------- */
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

    setIsSaving(true)

    const { error } = await supabase
      .from("profiles")
      .upsert({
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

    setMessage("プロフィールを保存しました。")
  }

  /* =========================================================
    ローディング表示：プロフィール取得中
  ========================================================= */
  if (isLoading) {
    return (
      <main className="p-10 max-w-2xl mx-auto">
        {/* =====================================================
          パンくず：トップページ / プロフィール
        ===================================================== */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:underline">
            学問ログ（仮）
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">プロフィール</span>
        </nav>

        <p>読み込み中...</p>
      </main>
    )
  }

  /* =========================================================
    未ログイン表示：プロフィール編集にはログインが必要
  ========================================================= */
  if (!userId) {
    return (
      <main className="p-10 max-w-2xl mx-auto">
        {/* =====================================================
          パンくず：トップページ / プロフィール
        ===================================================== */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:underline">
            学問ログ（仮）
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">プロフィール</span>
        </nav>

        <p className="mb-4">プロフィールを編集するにはログインしてください。</p>

        <Link href="/login" className="text-blue-500 hover:underline">
          ログイン / 新規登録へ
        </Link>
      </main>
    )
  }

  return (
    <main className="p-10 max-w-2xl mx-auto">
      {/* =====================================================
        パンくず：トップページ / プロフィール
      ===================================================== */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          学問ログ（仮）
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">プロフィール</span>
      </nav>

      {/* =====================================================
        ページタイトル
      ===================================================== */}
      <h1 className="text-2xl font-bold mb-6">プロフィール設定</h1>

      {/* =====================================================
        プロフィール編集フォーム：メール表示・ユーザー名入力・保存
      ===================================================== */}
      <div className="border rounded p-4">
        {/* ログイン中メールアドレス表示 */}
        <div className="mb-4 text-sm text-gray-500">
          ログイン中：{email}
        </div>

        {/* ユーザー名入力 */}
        <div className="mb-4">
          <label className="block mb-1">ユーザー名</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border px-4 py-3 rounded w-full text-base"
            placeholder="例：Japanese Mathematical Samurai"
          />
        </div>

        {/* エラーメッセージ */}
        {errorMessage && (
          <p className="mb-4 text-sm text-red-500">{errorMessage}</p>
        )}

        {/* 成功メッセージ */}
        {message && (
          <p className="mb-4 text-sm text-green-600">{message}</p>
        )}

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-black text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {isSaving ? "保存中..." : "保存する"}
        </button>
      </div>
    </main>
  )
}