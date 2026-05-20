"use client"

import UserMiniBadge from "@/components/UserMiniBadge"
import MarkdownEditor from "@/components/editor/MarkdownEditor"
import SectionCard from "@/components/ui/SectionCard"
import FieldLabel from "@/components/ui/FieldLabel"
import FieldDescription from "@/components/ui/FieldDescription"
import PrimarySubmitButton from "@/components/ui/PrimarySubmitButton"
import RatingField from "@/components/reviews/RatingField"
import { RADII } from "@/components/ui/designTokens"

type EditorMode = "input" | "preview"

type ReviewCreateFormProps = {
  userId: string
  userEmail: string | null
  userName: string | null
  rating: string
  onRatingChange: (value: string) => void
  comment: string
  onCommentChange: (value: string) => void
  commentMode: EditorMode
  onCommentModeChange: (mode: EditorMode) => void
  onInsertLatex: (latex: string) => void
  onSubmit: () => void
  isSubmitting: boolean
}

export default function ReviewCreateForm({
  userId,
  userEmail,
  userName,
  rating,
  onRatingChange,
  comment,
  onCommentChange,
  commentMode,
  onCommentModeChange,
  onInsertLatex,
  onSubmit,
  isSubmitting,
}: ReviewCreateFormProps) {
  return (
    <>
      <SectionCard
        style={{
          marginTop: "18px",
          marginBottom: "22px",
          padding: "16px 18px",
          borderRadius: RADII.lg,
          boxShadow: "none",
        }}
      >
        <UserMiniBadge
          userId={userId}
          email={userEmail}
          userName={userName}
          size="md"
          showEmail
        />
      </SectionCard>

      <RatingField value={rating} onChange={onRatingChange} />

      <div style={{ marginBottom: "18px" }}>
        <FieldLabel size="16px">コメント</FieldLabel>

        <div style={{ marginBottom: "12px" }}>
          <FieldDescription>
            文章はそのまま入力できます。数式を使いたい場合は $...$ や $$...$$
            で囲んでください。投稿前にプレビューで確認できます。
          </FieldDescription>
        </div>

        <MarkdownEditor
          value={comment}
          onChange={onCommentChange}
          mode={commentMode}
          onModeChange={onCommentModeChange}
          onInsertLatex={onInsertLatex}
          rows={5}
          previewMinHeight="150px"
          placeholder="解法の美しさ、難易度、学習効果などをレビューしてください。"
          emptyPreviewText="ここにコメントのプレビューが表示されます。"
        />
      </div>

      <PrimarySubmitButton onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? "投稿中..." : "レビューを投稿する"}
      </PrimarySubmitButton>
    </>
  )
}
