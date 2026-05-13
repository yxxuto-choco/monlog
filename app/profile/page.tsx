"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import UserMiniBadge from "@/components/UserMiniBadge"
import PageShell from "@/components/ui/PageShell"
import MessageBox from "@/components/ui/MessageBox"

/* =========================================================
  問ログ Design System
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

function SaveIcon({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M17 21v-8H7v8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 3v5h8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

function SparkleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M19 14l.8 2.6L22 17.5l-2.2.9L19 21l-.8-2.6-2.2-.9 2.2-.9L19 14Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M5 13l.6 1.8L7.5 15.5l-1.9.7L5 18l-.6-1.8-1.9-.7 1.9-.7L5 13Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* =========================================================
  共通小部品
========================================================= */
function Breadcrumb() {
  return (
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
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: COLORS.teal,
          fontSize: "17px",
          fontWeight: 900,
          textDecoration: "none",
        }}
      >
        <BackIcon />
        トップへ戻る
      </Link>

      <div
        style={{
          color: COLORS.slate,
          fontSize: "15px",
          fontWeight: 700,
        }}
      >
        問ログ / プロフィール設定
      </div>
    </nav>
  )
}

/* =========================================================
  プロフィールページ：ユーザー名の表示・編集
========================================================= */
export default function ProfilePage() {
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

  if (isLoading) {
    return (
      <PageShell>
        <Breadcrumb />

        <section
          style={{
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.line}`,
            borderRadius: "24px",
            padding: "34px",
            boxShadow: "0 4px 14px rgba(30, 58, 95, 0.08)",
            color: COLORS.muted,
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          読み込み中...
        </section>
      </PageShell>
    )
  }

  if (!userId) {
    return (
      <PageShell>
        <Breadcrumb />

        <section
          style={{
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.line}`,
            borderRadius: "26px",
            padding: "38px",
            boxShadow: "0 4px 14px rgba(30, 58, 95, 0.10)",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: COLORS.navy,
              fontSize: "36px",
              lineHeight: 1.35,
              fontWeight: 900,
              letterSpacing: "-0.03em",
            }}
          >
            プロフィール設定
          </h1>

          <p
            style={{
              margin: "18px 0 0",
              color: COLORS.slate,
              fontSize: "17px",
              lineHeight: 1.8,
              fontWeight: 600,
            }}
          >
            プロフィールを編集するにはログインが必要です。ログインすると、ユーザー名・アバター・活動レベルを確認できます。
          </p>

          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "56px",
              padding: "0 24px",
              marginTop: "28px",
              borderRadius: "14px",
              backgroundColor: COLORS.navy,
              color: "#FFFFFF",
              textDecoration: "none",
              fontSize: "17px",
              fontWeight: 900,
            }}
          >
            ログイン / 新規登録へ
          </Link>
        </section>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <Breadcrumb />

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
          プロフィール設定
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
          問ログで表示される名前と、自分の活動情報を確認する。
        </p>
      </header>

      <section
        style={{
          backgroundColor: COLORS.surface,
          border: `1px solid ${COLORS.line}`,
          borderRadius: "26px",
          padding: "34px",
          boxShadow: "0 4px 14px rgba(30, 58, 95, 0.10)",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <UserMiniBadge
            userId={userId}
            email={email}
            userName={username.trim() || null}
            size="md"
            showEmail
          />

          <Link
            href="/my"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "48px",
              padding: "0 18px",
              borderRadius: "14px",
              backgroundColor: COLORS.navy,
              color: "#FFFFFF",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: 900,
            }}
          >
            マイページを見る
          </Link>
        </div>
      </section>

      <section
        style={{
          backgroundColor: COLORS.surface,
          border: `1px solid ${COLORS.line}`,
          borderRadius: "24px",
          padding: "34px 36px",
          boxShadow: "0 4px 14px rgba(30, 58, 95, 0.08)",
          marginBottom: "28px",
        }}
      >
        <h2
          style={{
            margin: "0 0 8px",
            color: COLORS.navy,
            fontSize: "28px",
            fontWeight: 900,
          }}
        >
          表示名を編集する
        </h2>

        <p
          style={{
            margin: "0 0 26px",
            color: COLORS.slate,
            fontSize: "15px",
            lineHeight: 1.8,
            fontWeight: 600,
          }}
        >
          トップページ・レビュー・マイページなどで表示されるユーザー名です。
        </p>

        <div style={{ marginBottom: "22px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: COLORS.navy,
              fontSize: "16px",
              fontWeight: 900,
            }}
          >
            ユーザー名
          </label>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="例：Japanese Mathematical Samurai"
            style={{
              width: "100%",
              height: "60px",
              borderRadius: "16px",
              border: `1px solid ${COLORS.lineStrong}`,
              backgroundColor: COLORS.surface,
              color: COLORS.text,
              fontSize: "18px",
              padding: "0 18px",
              outline: "none",
            }}
          />

          <p
            style={{
              margin: "10px 0 0",
              color: COLORS.muted,
              fontSize: "13px",
              lineHeight: 1.7,
              fontWeight: 700,
            }}
          >
            40文字以内推奨。あとからいつでも変更できます。
          </p>
        </div>

        {errorMessage && <MessageBox type="error">{errorMessage}</MessageBox>}
        {message && <MessageBox type="success">{message}</MessageBox>}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "9px",
            width: "100%",
            minHeight: "64px",
            border: "none",
            borderRadius: "16px",
            backgroundColor: COLORS.navy,
            color: "#FFFFFF",
            fontSize: "20px",
            fontWeight: 900,
            cursor: isSaving ? "not-allowed" : "pointer",
            opacity: isSaving ? 0.7 : 1,
            boxShadow: "0 4px 14px rgba(30, 58, 95, 0.14)",
          }}
        >
          <SaveIcon />
          {isSaving ? "保存中..." : "保存する"}
        </button>
      </section>

      <section
        style={{
          backgroundColor: COLORS.tealPanel,
          border: "1px solid #B8DCD5",
          borderLeft: `6px solid ${COLORS.teal}`,
          borderRadius: "22px",
          padding: "28px 32px",
        }}
      >
        <h2
          style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: COLORS.navy,
            fontSize: "24px",
            fontWeight: 900,
          }}
        >
          <SparkleIcon />
          アバター進化機能について
        </h2>

        <p
          style={{
            margin: "14px 0 0",
            color: COLORS.slate,
            fontSize: "16px",
            lineHeight: 1.8,
            fontWeight: 600,
          }}
        >
          現在のドット絵アバターは、ユーザーIDから自動生成されています。将来的には、投稿数・レビュー数・コメント内容・タグ傾向に応じて、装備や色が変化する進化システムを追加予定です。
        </p>
      </section>
    </PageShell>
  )
}
