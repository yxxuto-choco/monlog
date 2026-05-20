"use client"

import Link from "next/link"
import useLoginForm from "@/hooks/useLoginForm"
import LoginFormCard from "@/components/login/LoginFormCard"
import LoginHeroPanel from "@/components/login/LoginHeroPanel"
import PageShell from "@/components/ui/PageShell"
import { COLORS } from "@/components/ui/designTokens"

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

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    message,
    errorMessage,
    isLoading,
    handleSignUp,
    handleSignIn,
  } = useLoginForm()

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
        <LoginHeroPanel />

        <LoginFormCard
          email={email}
          onEmailChange={setEmail}
          password={password}
          onPasswordChange={setPassword}
          message={message}
          errorMessage={errorMessage}
          isLoading={isLoading}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
        />
      </div>
    </PageShell>
  )
}
