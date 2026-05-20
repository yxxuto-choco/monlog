"use client"

import Link from "next/link"
import UserMiniBadge from "@/components/UserMiniBadge"
import SectionCard from "@/components/ui/SectionCard"
import { COLORS, RADII } from "@/components/ui/designTokens"

type HomeLoginBarProps = {
  userId: string | null
  userEmail: string | null
  userName: string | null
  onLogout: () => Promise<void> | void
}

function UserIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 21a8 8 0 0 0-16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

function SettingsIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.4 1.07V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8.6 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.07-.4H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6A1.65 1.65 0 0 0 10.4 3V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15.4 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.4.18.74.48 1 .86.25.38.39.82.4 1.27V12a2 2 0 0 1-2 2h-.09A1.65 1.65 0 0 0 19.4 15Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LogoutIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 17l5-5-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function HomeLoginBar({
  userId,
  userEmail,
  userName,
  onLogout,
}: HomeLoginBarProps) {
  return (
    <SectionCard
      style={{
        padding: "18px 24px",
        marginBottom: "30px",
        borderRadius: RADII.md,
      }}
    >
      {userEmail ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {userId && (
            <UserMiniBadge
              userId={userId}
              email={userEmail}
              userName={userName}
              size="sm"
              showEmail
            />
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
              color: COLORS.slate,
              fontSize: "17px",
              fontWeight: 800,
            }}
          >
            <Link
              href="/my"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                color: COLORS.slate,
                textDecoration: "none",
              }}
            >
              <UserIcon size={21} />
              マイページ
            </Link>

            <Link
              href="/profile"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                color: COLORS.slate,
                textDecoration: "none",
              }}
            >
              <SettingsIcon size={21} />
              設定
            </Link>

            <button
              type="button"
              onClick={onLogout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                border: "none",
                background: "transparent",
                color: COLORS.slate,
                font: "inherit",
                fontWeight: 800,
                cursor: "pointer",
                padding: 0,
              }}
            >
              <LogoutIcon size={21} />
              ログアウト
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              color: COLORS.slate,
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            ログインしていません
          </span>

          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "42px",
              padding: "0 18px",
              borderRadius: RADII.pill,
              backgroundColor: COLORS.navy,
              color: "#FFFFFF",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: 900,
            }}
          >
            ログイン / 新規登録
          </Link>
        </div>
      )}
    </SectionCard>
  )
}
