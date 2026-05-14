"use client"

import TagPill from "@/components/tags/TagPill"

type TagListProps = {
  tags: string[]
}

export default function TagList({ tags }: TagListProps) {
  if (tags.length === 0) return null

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      {tags.map((tag) => (
        <TagPill key={tag} name={tag} />
      ))}
    </div>
  )
}
