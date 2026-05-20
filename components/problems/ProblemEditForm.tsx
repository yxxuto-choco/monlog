"use client"

import MarkdownEditor from "@/components/editor/MarkdownEditor"
import ActionButton from "@/components/ui/ActionButton"
import TextInput from "@/components/ui/TextInput"
import FieldLabel from "@/components/ui/FieldLabel"
import FieldDescription from "@/components/ui/FieldDescription"
import TagButton from "@/components/tags/TagButton"
import { COLORS, RADII } from "@/components/ui/designTokens"

type EditorMode = "input" | "preview"

export type ProblemEditTag = {
  id: string
  name: string
}

type ProblemEditFormProps = {
  editTitle: string
  onEditTitleChange: (value: string) => void
  editContent: string
  onEditContentChange: (value: string) => void
  editContentMode: EditorMode
  onEditContentModeChange: (mode: EditorMode) => void
  onInsertLatex: (latex: string) => void
  newEditTagName: string
  onNewEditTagNameChange: (value: string) => void
  editTagSuggestions: ProblemEditTag[]
  onSelectTagSuggestion: (tagId: string) => void
  allTags: ProblemEditTag[]
  selectedEditTagIds: string[]
  onToggleTag: (tagId: string) => void
  onAddTag: () => void
  onCancel: () => void
  onSave: () => void
  isUpdatingProblem: boolean
}

export default function ProblemEditForm({
  editTitle,
  onEditTitleChange,
  editContent,
  onEditContentChange,
  editContentMode,
  onEditContentModeChange,
  onInsertLatex,
  newEditTagName,
  onNewEditTagNameChange,
  editTagSuggestions,
  onSelectTagSuggestion,
  allTags,
  selectedEditTagIds,
  onToggleTag,
  onAddTag,
  onCancel,
  onSave,
  isUpdatingProblem,
}: ProblemEditFormProps) {
  return (
    <div>
      <div style={{ marginBottom: "18px" }}>
        <FieldLabel size="16px">タイトル</FieldLabel>

        <TextInput
          value={editTitle}
          onChange={(event) => onEditTitleChange(event.target.value)}
        />
      </div>

      <div style={{ marginBottom: "18px" }}>
        <FieldLabel size="16px">問題内容</FieldLabel>

        <div style={{ marginBottom: "12px" }}>
          <FieldDescription>
            文章はそのまま入力できます。数式を使いたい場合は $...$ や $$...$$
            で囲んでください。保存前にプレビューで確認できます。
          </FieldDescription>
        </div>

        <MarkdownEditor
          value={editContent}
          onChange={onEditContentChange}
          mode={editContentMode}
          onModeChange={onEditContentModeChange}
          onInsertLatex={onInsertLatex}
          rows={8}
          previewMinHeight="210px"
          placeholder="ここに問題内容を入力してください。"
          emptyPreviewText="ここに問題内容のプレビューが表示されます。"
        />
      </div>

      <div style={{ marginBottom: "22px" }}>
        <FieldLabel size="16px">タグ</FieldLabel>

        <div style={{ marginBottom: "12px" }}>
          <FieldDescription>
            既存タグを選択するか、新しいタグを追加できます。タグは1つ以上選択してください。
          </FieldDescription>
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
              value={newEditTagName}
              onChange={(event) => onNewEditTagNameChange(event.target.value)}
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

        {editTagSuggestions.length > 0 && (
          <div
            style={{
              border: `1px solid ${COLORS.line}`,
              borderRadius: RADII.md,
              backgroundColor: COLORS.surface,
              overflow: "hidden",
              marginBottom: "16px",
            }}
          >
            {editTagSuggestions.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => onSelectTagSuggestion(tag.id)}
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
          {allTags.map((tag) => {
            const selected = selectedEditTagIds.includes(tag.id)

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

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        <ActionButton onClick={onCancel}>キャンセル</ActionButton>

        <ActionButton variant="primary" onClick={onSave} disabled={isUpdatingProblem}>
          {isUpdatingProblem ? "保存中..." : "保存する"}
        </ActionButton>
      </div>
    </div>
  )
}
