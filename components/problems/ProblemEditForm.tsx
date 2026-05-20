"use client"

import MarkdownEditor from "@/components/editor/MarkdownEditor"
import ImageInsertButton from "@/components/editor/ImageInsertButton"
import ProblemTagSelector from "@/components/tags/ProblemTagSelector"
import ActionButton from "@/components/ui/ActionButton"
import TextInput from "@/components/ui/TextInput"
import FieldLabel from "@/components/ui/FieldLabel"
import FieldDescription from "@/components/ui/FieldDescription"

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
  onImageUpload: (file: File | null) => void
  isUploadingImage: boolean
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
  onImageUpload,
  isUploadingImage,
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
          extraToolbarContent={
            <ImageInsertButton
              isUploading={isUploadingImage}
              onImageSelect={onImageUpload}
            />
          }
        />
      </div>

      <div style={{ marginBottom: "22px" }}>
        <ProblemTagSelector
          inputValue={newEditTagName}
          onInputChange={onNewEditTagNameChange}
          suggestions={editTagSuggestions}
          onSelectSuggestion={onSelectTagSuggestion}
          tags={allTags}
          selectedTagIds={selectedEditTagIds}
          onToggleTag={onToggleTag}
          onAddTag={onAddTag}
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

        <ActionButton variant="primary" onClick={onSave} disabled={isUpdatingProblem}>
          {isUpdatingProblem ? "保存中..." : "保存する"}
        </ActionButton>
      </div>
    </div>
  )
}
