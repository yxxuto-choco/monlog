"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import PageShell from "@/components/ui/PageShell"
import SectionCard from "@/components/ui/SectionCard"
import MessageBox from "@/components/ui/MessageBox"
import { COLORS, RADII, SHADOWS } from "@/components/ui/designTokens"

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

function SparkleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l1.4 5.2L18 10l-4.6 2.8L12 18l-1.4-5.2L6 10l4.6-2.8L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M5 14l.6 1.9L7.5 16.5l-1.9.6L5 19l-.6-1.9-1.9-.6 1.9-.6L5 14Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MailIcon({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m22 7-10 6L2 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LockIcon({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="4"
        y="10"
        width="16"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FeaturePill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        borderRadius: RADII.pill,
        border: `1px solid ${COLORS.tealLine}`,
        backgroundColor: "rgba(255,255,255,0.75)",
        color: COLORS.navy,
        padding: "8px 12px",
        fontSize: "13px",
        fontWeight: 900,
      }}
    >
      <CheckIcon size={16} />
      {children}
    </span>
  )
}

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

  return (
    <PageShell wide>
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
          問ログ / ログイン
        </div>
      </nav>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(320px, 0.95fr)",
          gap: "28px",
          alignItems: "stretch",
        }}
      >
        <SectionCard
          variant="teal"
          style={{
            position: "relative",
            overflow: "hidden",
            borderLeft: `6px solid ${COLORS.teal}`,
            borderRadius: RADII.xxl,
            boxShadow: SHADOWS.cardStrong,
            padding: "38px",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-80px",
              top: "-80px",
              width: "240px",
              height: "240px",
              borderRadius: "50%",
              backgroundColor: "rgba(42, 157, 143, 0.16)",
            }}
          />

          <div
            style={{
              position: "absolute",
              right: "70px",
              bottom: "-70px",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              backgroundColor: "rgba(30, 58, 95, 0.08)",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                borderRadius: RADII.pill,
                backgroundColor: "rgba(255,255,255,0.8)",
                border: `1px solid ${COLORS.tealLine}`,
                color: COLORS.teal,
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 900,
                letterSpacing: "0.12em",
                marginBottom: "24px",
              }}
            >
              <SparkleIcon size={18} />
              START MONLOG
            </div>

            <h1
              style={{
                margin: 0,
                color: COLORS.navy,
                fontSize: "48px",
                lineHeight: 1.16,
                fontWeight: 900,
                letterSpacing: "-0.05em",
              }}
            >
              良問を集める。
              <br />
              解法を語る。
              <br />
              学びを残す。
            </h1>

            <p
              style={{
                margin: "22px 0 0",
                color: COLORS.slate,
                fontSize: "17px",
                lineHeight: 1.9,
                fontWeight: 700,
                maxWidth: "580px",
              }}
            >
              問ログは、数学や学問の問題を投稿し、タグで整理し、レビューで良問を見つけるための場所です。
              ログインすると、投稿・レビュー・マイページ・レベル表示が使えるようになります。
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "28px",
              }}
            >
              <FeaturePill>問題を投稿</FeaturePill>
              <FeaturePill>レビューを書く</FeaturePill>
              <FeaturePill>LaTeX対応</FeaturePill>
              <FeaturePill>活動レベル表示</FeaturePill>
            </div>

            <div
              style={{
                marginTop: "36px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "14px",
              }}
            >
              {[
                { label: "STEP 1", text: "ログインまたは新規登録" },
                { label: "STEP 2", text: "気になる問題を投稿・検索" },
                { label: "STEP 3", text: "レビューで良問を育てる" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    borderRadius: RADII.lg,
                    border: `1px solid ${COLORS.tealLine}`,
                    backgroundColor: "rgba(255,255,255,0.72)",
                    padding: "16px",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: COLORS.teal,
                      fontSize: "12px",
                      fontWeight: 900,
                      letterSpacing: "0.12em",
                    }}
                  >
                    {item.label}
                  </p>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: COLORS.navy,
                      fontSize: "15px",
                      fontWeight: 900,
                      lineHeight: 1.6,
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          style={{
            borderRadius: RADII.xxl,
            boxShadow: SHADOWS.cardStrong,
            padding: "34px",
          }}
        >
          <header style={{ marginBottom: "26px" }}>
            <p
              style={{
                margin: 0,
                color: COLORS.teal,
                fontSize: "13px",
                fontWeight: 900,
                letterSpacing: "0.16em",
              }}
            >
              ACCOUNT
            </p>

            <h2
              style={{
                margin: "10px 0 0",
                color: COLORS.navy,
                fontSize: "34px",
                fontWeight: 900,
                letterSpacing: "-0.04em",
              }}
            >
              ログイン / 新規登録
            </h2>

            <p
              style={{
                margin: "12px 0 0",
                color: COLORS.slate,
                fontSize: "15px",
                lineHeight: 1.8,
                fontWeight: 700,
              }}
            >
              同じメールアドレスとパスワードで、投稿・レビュー・マイページを利用できます。
            </p>
          </header>

          {(errorMessage || message) && (
            <div style={{ marginBottom: "20px" }}>
              {errorMessage && <MessageBox type="error">{errorMessage}</MessageBox>}
              {message && <MessageBox type="success">{message}</MessageBox>}
            </div>
          )}

          <div style={{ display: "grid", gap: "18px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  color: COLORS.navy,
                  fontSize: "15px",
                  fontWeight: 900,
                  marginBottom: "8px",
                }}
              >
                メールアドレス
              </label>

              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "16px",
                    transform: "translateY(-50%)",
                    display: "inline-flex",
                    color: COLORS.slate,
                  }}
                >
                  <MailIcon />
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@example.com"
                  autoComplete="email"
                  style={{
                    width: "100%",
                    height: "58px",
                    borderRadius: RADII.md,
                    border: `1px solid ${COLORS.lineStrong}`,
                    backgroundColor: COLORS.surface,
                    color: COLORS.text,
                    fontSize: "16px",
                    fontWeight: 700,
                    padding: "0 16px 0 50px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  color: COLORS.navy,
                  fontSize: "15px",
                  fontWeight: 900,
                  marginBottom: "8px",
                }}
              >
                パスワード
              </label>

              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "16px",
                    transform: "translateY(-50%)",
                    display: "inline-flex",
                    color: COLORS.slate,
                  }}
                >
                  <LockIcon />
                </span>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6文字以上"
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    height: "58px",
                    borderRadius: RADII.md,
                    border: `1px solid ${COLORS.lineStrong}`,
                    backgroundColor: COLORS.surface,
                    color: COLORS.text,
                    fontSize: "16px",
                    fontWeight: 700,
                    padding: "0 16px 0 50px",
                    outline: "none",
                  }}
                />
              </div>

              <p
                style={{
                  margin: "8px 0 0",
                  color: COLORS.muted,
                  fontSize: "13px",
                  fontWeight: 700,
                  lineHeight: 1.6,
                }}
              >
                新規登録する場合は、6文字以上のパスワードを設定してください。
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginTop: "4px",
              }}
            >
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isLoading}
                style={{
                  minHeight: "58px",
                  border: "none",
                  borderRadius: RADII.md,
                  backgroundColor: COLORS.navy,
                  color: "#FFFFFF",
                  fontSize: "17px",
                  fontWeight: 900,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                  boxShadow: "0 4px 14px rgba(30, 58, 95, 0.16)",
                }}
              >
                {isLoading ? "処理中..." : "ログイン"}
              </button>

              <button
                type="button"
                onClick={handleSignUp}
                disabled={isLoading}
                style={{
                  minHeight: "58px",
                  border: `1px solid ${COLORS.teal}`,
                  borderRadius: RADII.md,
                  backgroundColor: COLORS.teal,
                  color: "#FFFFFF",
                  fontSize: "17px",
                  fontWeight: 900,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                  boxShadow: "0 4px 14px rgba(42, 157, 143, 0.18)",
                }}
              >
                {isLoading ? "処理中..." : "新規登録"}
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: "26px",
              borderRadius: RADII.lg,
              backgroundColor: COLORS.softYellow,
              border: `1px solid ${COLORS.line}`,
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: COLORS.navy,
                fontSize: "14px",
                lineHeight: 1.8,
                fontWeight: 800,
              }}
            >
              新規登録後、確認メールが届く設定の場合があります。メール内のリンクを開いたあと、
              問ログに戻ってログインしてください。
            </p>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  )
}