"use client"

import UserMiniBadge from "@/components/UserMiniBadge"
import SectionCard from "@/components/ui/SectionCard"
import ActionButton from "@/components/ui/ActionButton"
import EditIcon from "@/components/icons/EditIcon"
import TrashIcon from "@/components/icons/TrashIcon"
import ReviewSummary from "@/components/reviews/ReviewSummary"
import ReviewEditForm from "@/components/reviews/ReviewEditForm"
import ReviewCommentBody from "@/components/reviews/ReviewCommentBody"
import { COLORS } from "@/components/ui/designTokens"

type EditorMode = "input" | "preview"

export type ReviewCardReview = {
  id: string
  rating: number
  comment: string | null
  created_at: string | null
  user_id?: string | null
}

type ReviewCardProps = {
  review: ReviewCardReview
  currentUserId: string | null
  createdAtLabel: string
  isEditing: boolean
  editRating: string
  onEditRatingChange: (value: string) => void
  editComment: string
  onEditCommentChange: (value: string) => void
  editMode: EditorMode
  onEditModeChange: (mode: EditorMode) => void
  onInsertLatex: (latex: string) => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onDelete: () => void
  isUpdating: boolean
  isDeleting: boolean
}

export default function ReviewCard({
  review,
  currentUserId,
  createdAtLabel,
  isEditing,
  editRating,
  onEditRatingChange,
  editComment,
  onEditCommentChange,
  editMode,
  onEditModeChange,
  onInsertLatex,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  isUpdating,
  isDeleting,
}: ReviewCardProps) {
  const isReviewOwner = Boolean(currentUserId && review.user_id === currentUserId)

  return (
    <SectionCard
      style={{
        padding: "24px 26px",
        borderRadius: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {review.user_id && (
            <UserMiniBadge userId={review.user_id} size="sm" showEmail={false} />
          )}

          {!isEditing && <ReviewSummary rating={review.rating} />}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <p
            style={{
              margin: 0,
              color: COLORS.muted,
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            {createdAtLabel}
          </p>

          {isReviewOwner && !isEditing && (
            <>
              <ActionButton onClick={onStartEdit}>
                <EditIcon />
                編集
              </ActionButton>

              <ActionButton variant="danger" onClick={onDelete} disabled={isDeleting}>
                <TrashIcon />
                {isDeleting ? "削除中..." : "削除"}
              </ActionButton>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <ReviewEditForm
          rating={editRating}
          onRatingChange={onEditRatingChange}
          comment={editComment}
          onCommentChange={onEditCommentChange}
          mode={editMode}
          onModeChange={onEditModeChange}
          onInsertLatex={onInsertLatex}
          onCancel={onCancelEdit}
          onSave={onSaveEdit}
          isUpdating={isUpdating}
        />
      ) : (
        <ReviewCommentBody comment={review.comment} />
      )}
    </SectionCard>
  )
}
