"use client"

import FieldDescription from "@/components/ui/FieldDescription"
import FieldLabel from "@/components/ui/FieldLabel"
import TextInput from "@/components/ui/TextInput"
import TagButton from "@/components/tags/TagButton"
import { COLORS, RADII } from "@/components/ui/designTokens"

export type SelectableTag = {
  id: string
  name: string
}

type ProblemTagSelectorProps = {
  label?: string
  description?: string
  inputValue: string
  onInputChange: (value: string) => void
  suggestions: SelectableTag[]
  onSelectSuggestion: (tagId: string) => void
  tags: SelectableTag[]
  selectedTagIds: string[]
  onToggleTag: (tagId: string) => void
  onAddTag: () => void
}

export default function ProblemTagSelector({
  label = "タグ",
  description = "既存タグを選択するか、新しいタグを追加できます。タグは1つ以上選択してください。",
  inputValue,
  onInputChange,
  suggestions,
  onSelectSuggestion,
  tags,
  selectedTagIds,
  onToggleTag,
  onAddTag,
}: ProblemTagSelectorProps) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>

      <div style={{ marginBottom: "14px" }}>
        <FieldDescription>{description}</FieldDescription>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 260px" }}>
          <TextInput
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="タグを入力"
            height="48px"
            fontSize="16px"
            fontWeight={700}
          />
        </div>

        <button
          type="button"
          onClick={onAddTag}
          style={{
            minHeight: "48px",
            padding: "0 20px",
            borderRadius: RADII.md,
            border: "none",
            backgroundColor: COLORS.navy,
            color: "#FFFFFF",
            fontSize: "15px",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          追加
        </button>
      </div>

      {suggestions.length > 0 && (
        <div
          style={{
            border: `1px solid ${COLORS.line}`,
            borderRadius: RADII.md,
            backgroundColor: COLORS.surface,
            overflow: "hidden",
            marginBottom: "16px",
          }}
        >
          {suggestions.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => onSelectSuggestion(tag.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                border: "none",
                borderBottom: `1px solid ${COLORS.line}`,
                backgroundColor: COLORS.surface,
                color: COLORS.navy,
                padding: "12px 14px",
                fontSize: "15px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              #{tag.name}
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {tags.map((tag) => {
          const selected = selectedTagIds.includes(tag.id)

          return (
            <TagButton
              key={tag.id}
              name={tag.name}
              selected={selected}
              onClick={() => onToggleTag(tag.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
