"use client"

import UserMiniBadge from "@/components/UserMiniBadge"
import StarRating from "@/components/ui/StarRating"
import ActionButton from "@/components/ui/ActionButton"
import TagLinkPill from "@/components/tags/TagLinkPill"
import CommentIcon from "@/components/icons/CommentIcon"
import EditIcon from "@/components/icons/EditIcon"
import TrashIcon from "@/components/icons/TrashIcon"
import { COLORS } from "@/components/ui/designTokens"

type ProblemHeaderProps = {
  title: string
  createdAtLabel: string
  averageRating: number
  reviewCount: number
  tags: string[]
  ownerUserId: string | null
  isProblemOwner: boolean
  isDeletingProblem: boolean
  onStartEdit: () => void
  onDeleteProblem: () => void
}

export default function ProblemHeader({
  title,
  createdAtLabel,
  averageRating,
  reviewCount,
  tags,
  ownerUserId,
  isProblemOwner,
  isDeletingProblem,
  onStartEdit,
  onDeleteProblem,
}: ProblemHeaderProps) {
  return (
    <>
      {ownerUserId && (
        <div style={{ marginBottom: "24px" }}>
          <UserMiniBadge userId={ownerUserId} size="md" showEmail={false} />
        </div>
      )}

      <h1
        style={{
          margin: 0,
          color: COLORS.navy,
          fontSize: "40px",
          lineHeight: 1.35,
          fontWeight: 900,
          letterSpacing: "-0.03em",
        }}
      >
        {title}
      </h1>

      <div
        style={{
          marginTop: "22px",
          display: "flex",
          alignItems: "center",
          gap: "18px",
          flexWrap: "wrap",
          color: COLORS.slate,
          fontSize: "16px",
          fontWeight: 700,
        }}
      >
        <span>投稿日: {createdAtLabel}</span>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <StarRating value={averageRating} size={22} />
          <strong style={{ color: COLORS.navy, fontSize: "22px" }}>
            {averageRating.toFixed(1)}
          </strong>
        </span>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
          }}
        >
          <CommentIcon size={21} />
          {reviewCount}件
        </span>
      </div>

      {tags.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "24px",
          }}
        >
          {tags.map((tag) => (
            <TagLinkPill key={tag} name={tag} />
          ))}
        </div>
      )}

      {isProblemOwner && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "26px",
            justifyContent: "flex-end",
          }}
        >
          <ActionButton onClick={onStartEdit}>
            <EditIcon />
            問題を編集
          </ActionButton>

          <ActionButton
            variant="danger"
            onClick={onDeleteProblem}
            disabled={isDeletingProblem}
          >
            <TrashIcon />
            {isDeletingProblem ? "削除中..." : "問題を削除"}
          </ActionButton>
        </div>
      )}
    </>
  )
}
