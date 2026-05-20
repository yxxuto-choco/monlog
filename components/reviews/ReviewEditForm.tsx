"use client"

import MarkdownEditor from "@/components/editor/MarkdownEditor"
import ActionButton from "@/components/ui/ActionButton"
import FieldLabel from "@/components/ui/FieldLabel"
import FieldDescription from "@/components/ui/FieldDescription"
import RatingField from "@/components/reviews/RatingField"

type EditorMode = "input" | "preview"

type ReviewEditFormProps = {
  rating: string
  onRatingChange: (value: string) => void
  comment: string
  onCommentChange: (value: string) => void
  mode: EditorMode
  onModeChange: (mode: EditorMode) => void
  onInsertLatex: (latex: string) => void
  onCancel: () => void
  onSave: () => void
  isUpdating: boolean
}

export default function ReviewEditForm({
  rating,
  onRatingChange,
  comment,
  onCommentChange,
  mode,
  onModeChange,
  onInsertLatex,
  onCancel,
  onSave,
  isUpdating,
}: ReviewEditFormProps) {
  return (
    <div style={{ marginTop: "20px" }}>
      <RatingField value={rating} onChange={onRatingChange} />

      <div style={{ marginBottom: "18px" }}>
        <FieldLabel size="16px">コメント</FieldLabel>

        <div style={{ marginBottom: "12px" }}>
          <FieldDescription>
            文章はそのまま入力できます。数式を使いたい場合は $...$ や $$...$$
            で囲んでください。保存前にプレビューで確認できます。
          </FieldDescription>
        </div>

        <MarkdownEditor
          value={comment}
          onChange={onCommentChange}
          mode={mode}
          onModeChange={onModeChange}
          onInsertLatex={onInsertLatex}
          rows={5}
          previewMinHeight="150px"
          placeholder="解法の美しさ、難易度、学習効果などをレビューしてください。"
          emptyPreviewText="ここにコメントのプレビューが表示されます。"
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        <ActionButton onClick={onCancel}>キャンセル</ActionButton>

        <ActionButton variant="primary" onClick={onSave} disabled={isUpdating}>
          {isUpdating ? "保存中..." : "保存する"}
        </ActionButton>
      </div>
    </div>
  )
}
