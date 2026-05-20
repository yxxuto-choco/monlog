"use client"

import MarkdownEditor from "@/components/editor/MarkdownEditor"
import ImageInsertButton from "@/components/editor/ImageInsertButton"
import ProblemTagSelector from "@/components/tags/ProblemTagSelector"
import SectionCard from "@/components/ui/SectionCard"
import TextInput from "@/components/ui/TextInput"
import FieldLabel from "@/components/ui/FieldLabel"
import FieldDescription from "@/components/ui/FieldDescription"
import PrimarySubmitButton from "@/components/ui/PrimarySubmitButton"
import { RADII, SHADOWS } from "@/components/ui/designTokens"
import type { NewProblemTag } from "@/hooks/useNewProblemForm"

type EditorMode = "input" | "preview"

type NewProblemFormProps = {
  title: string
  onTitleChange: (value: string) => void
  content: string
  onContentChange: (value: string) => void
  contentMode: EditorMode
  onContentModeChange: (mode: EditorMode) => void
  onInsertLatex: (latex: string) => void
  isUploadingImage: boolean
  onImageUpload: (file: File | null) => void
  tags: NewProblemTag[]
  selectedTags: string[]
  newTagName: string
  onNewTagNameChange: (value: string) => void
  suggestions: NewProblemTag[]
  onSelectSuggestion: (tagId: string) => void
  onToggleTag: (tagId: string) => void
  onAddTag: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export default function NewProblemForm({
  title,
  onTitleChange,
  content,
  onContentChange,
  contentMode,
  onContentModeChange,
  onInsertLatex,
  isUploadingImage,
  onImageUpload,
  tags,
  selectedTags,
  newTagName,
  onNewTagNameChange,
  suggestions,
  onSelectSuggestion,
  onToggleTag,
  onAddTag,
  onSubmit,
  isSubmitting,
}: NewProblemFormProps) {
  return (
    <SectionCard
      style={{
        padding: "34px 36px",
        borderRadius: RADII.xxl,
        boxShadow: SHADOWS.cardStrong,
      }}
    >
      <div style={{ marginBottom: "28px" }}>
        <FieldLabel>タイトル</FieldLabel>
        <div style={{ marginBottom: "14px" }}>
          <FieldDescription>
            一覧や詳細ページで最も目立つ名前です。問題の内容が分かる短いタイトルにしてください。
          </FieldDescription>
        </div>

        <TextInput
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="例：2026年 東大理系数学 第1問"
          height="62px"
          fontSize="18px"
          fontWeight={700}
        />
      </div>

      <div style={{ marginBottom: "30px" }}>
        <FieldLabel>問題内容</FieldLabel>
        <div style={{ marginBottom: "12px" }}>
          <FieldDescription>
            文章はそのまま入力できます。数式を使いたい場合は $...$ や $$...$$
            で囲んでください。投稿前にプレビューで確認できます。
          </FieldDescription>
        </div>

        <MarkdownEditor
          value={content}
          onChange={onContentChange}
          mode={contentMode}
          onModeChange={onContentModeChange}
          onInsertLatex={onInsertLatex}
          rows={12}
          previewMinHeight="280px"
          placeholder="ここに問題文を入力してください。"
          emptyPreviewText="ここに問題内容のプレビューが表示されます。"
          extraToolbarContent={
            <ImageInsertButton
              isUploading={isUploadingImage}
              onImageSelect={onImageUpload}
            />
          }
        />
      </div>

      <div style={{ marginBottom: "30px" }}>
        <ProblemTagSelector
          description="分野、難易度、テーマなどをタグで整理します。既存タグを選ぶか、新しく追加できます。"
          inputValue={newTagName}
          onInputChange={onNewTagNameChange}
          suggestions={suggestions}
          onSelectSuggestion={onSelectSuggestion}
          tags={tags}
          selectedTagIds={selectedTags}
          onToggleTag={onToggleTag}
          onAddTag={onAddTag}
        />
      </div>

      <PrimarySubmitButton onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? "投稿中..." : "投稿する"}
      </PrimarySubmitButton>
    </SectionCard>
  )
}
