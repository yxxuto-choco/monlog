"use client"

import ImageIcon from "@/components/icons/ImageIcon"
import { COLORS, RADII } from "@/components/ui/designTokens"

type ImageInsertButtonProps = {
  isUploading: boolean
  onImageSelect: (file: File | null) => void
  idleLabel?: string
  uploadingLabel?: string
}

export default function ImageInsertButton({
  isUploading,
  onImageSelect,
  idleLabel = "画像を挿入",
  uploadingLabel = "画像アップロード中...",
}: ImageInsertButtonProps) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        minHeight: "40px",
        padding: "0 18px",
        borderRadius: RADII.pill,
        border: `1px solid ${COLORS.lineStrong}`,
        backgroundColor: COLORS.surface,
        color: COLORS.navy,
        fontSize: "15px",
        fontWeight: 900,
        cursor: isUploading ? "not-allowed" : "pointer",
        opacity: isUploading ? 0.65 : 1,
      }}
    >
      <ImageIcon />
      {isUploading ? uploadingLabel : idleLabel}
      <input
        type="file"
        accept="image/*"
        disabled={isUploading}
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null
          onImageSelect(file)
          event.currentTarget.value = ""
        }}
        style={{ display: "none" }}
      />
    </label>
  )
}
