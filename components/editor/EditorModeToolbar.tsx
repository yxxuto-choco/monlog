"use client"

import type { ReactNode } from "react"
import ModeButton from "@/components/ui/ModeButton"

type EditorModeToolbarProps = {
  mode: "input" | "preview"
  onInput: () => void
  onPreview: () => void
  extra?: ReactNode
}

export default function EditorModeToolbar({
  mode,
  onInput,
  onPreview,
  extra,
}: EditorModeToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "14px",
        flexWrap: "wrap",
      }}
    >
      <ModeButton active={mode === "input"} onClick={onInput}>
        入力
      </ModeButton>

      <ModeButton active={mode === "preview"} onClick={onPreview}>
        プレビュー
      </ModeButton>

      {extra}
    </div>
  )
}
