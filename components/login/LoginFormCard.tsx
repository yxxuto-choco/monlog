"use client"

import SectionCard from "@/components/ui/SectionCard"
import MessageBox from "@/components/ui/MessageBox"
import { COLORS, RADII, SHADOWS } from "@/components/ui/designTokens"

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

type LoginFormCardProps = {
  email: string
  onEmailChange: (value: string) => void
  password: string
  onPasswordChange: (value: string) => void
  message: string
  errorMessage: string
  isLoading: boolean
  onSignIn: () => void
  onSignUp: () => void
}

export default function LoginFormCard({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  message,
  errorMessage,
  isLoading,
  onSignIn,
  onSignUp,
}: LoginFormCardProps) {
  return (
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
              onChange={(event) => onEmailChange(event.target.value)}
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
              onChange={(event) => onPasswordChange(event.target.value)}
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
            onClick={onSignIn}
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
            onClick={onSignUp}
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
  )
}
