"use client"

import MessageBox from "@/components/ui/MessageBox"
import SectionCard from "@/components/ui/SectionCard"
import { COLORS, RADII } from "@/components/ui/designTokens"

type ProfileEditFormProps = {
  username: string
  onUsernameChange: (value: string) => void
  message: string
  errorMessage: string
  isSaving: boolean
  onSave: () => void
}

function SaveIcon({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17 21v-8H7v8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 3v5h8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export default function ProfileEditForm({ username, onUsernameChange, message, errorMessage, isSaving, onSave }: ProfileEditFormProps) {
  return (
    <SectionCard style={{ padding: "34px 36px", borderRadius: RADII.xxl, marginBottom: "28px" }}>
      <h2 style={{ margin: "0 0 8px", color: COLORS.navy, fontSize: "28px", fontWeight: 900 }}>
        表示名を編集する
      </h2>

      <p style={{ margin: "0 0 26px", color: COLORS.slate, fontSize: "15px", lineHeight: 1.8, fontWeight: 600 }}>
        トップページ・レビュー・マイページなどで表示されるユーザー名です。
      </p>

      <div style={{ marginBottom: "22px" }}>
        <label style={{ display: "block", marginBottom: "10px", color: COLORS.navy, fontSize: "16px", fontWeight: 900 }}>
          ユーザー名
        </label>

        <input
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          placeholder="例：Japanese Mathematical Samurai"
          style={{ width: "100%", height: "60px", borderRadius: RADII.lg, border: `1px solid ${COLORS.lineStrong}`, backgroundColor: COLORS.surface, color: COLORS.text, fontSize: "18px", padding: "0 18px", outline: "none" }}
        />

        <p style={{ margin: "10px 0 0", color: COLORS.muted, fontSize: "13px", lineHeight: 1.7, fontWeight: 700 }}>
          40文字以内推奨。あとからいつでも変更できます。
        </p>
      </div>

      {errorMessage && <MessageBox type="error">{errorMessage}</MessageBox>}
      {message && <MessageBox type="success">{message}</MessageBox>}

      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "9px", width: "100%", minHeight: "64px", border: "none", borderRadius: RADII.lg, backgroundColor: COLORS.navy, color: "#FFFFFF", fontSize: "20px", fontWeight: 900, cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.7 : 1, boxShadow: "0 4px 14px rgba(30, 58, 95, 0.14)" }}
      >
        <SaveIcon />
        {isSaving ? "保存中..." : "保存する"}
      </button>
    </SectionCard>
  )
}
