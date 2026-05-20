"use client"

import useNewProblemForm from "@/hooks/useNewProblemForm"
import Breadcrumbs from "@/components/navigation/Breadcrumbs"
import MarkdownEditor from "@/components/editor/MarkdownEditor"
import ImageInsertButton from "@/components/editor/ImageInsertButton"
import ProblemTagSelector from "@/components/tags/ProblemTagSelector"
import PageShell from "@/components/ui/PageShell"
import SectionCard from "@/components/ui/SectionCard"
import MessageBox from "@/components/ui/MessageBox"
import TextInput from "@/components/ui/TextInput"
import FieldLabel from "@/components/ui/FieldLabel"
import FieldDescription from "@/components/ui/FieldDescription"
import PrimarySubmitButton from "@/components/ui/PrimarySubmitButton"
import { COLORS, RADII, SHADOWS } from "@/components/ui/designTokens"

export default function NewProblemPage() {
  const {
    title,
    setTitle,
    content,
    setContent,
    contentMode,
    setContentMode,
    tags,
    selectedTags,
    newTagName,
    setNewTagName,
    suggestions,
    isSubmitting,
    isUploadingImage,
    message,
    errorMessage,
    toggleTag,
    handleSelectSuggestion,
    insertLatexTemplate,
    handleImageUpload,
    handleAddTag,
    handleSubmit,
  } = useNewProblemForm()

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "問ログ", href: "/" },
          { label: "問題投稿" },
        ]}
      />

      <header
        style={{
          textAlign: "center",
          marginBottom: "34px",
        }}
      >
        <h1
          style={{
            margin: 0,
            color: COLORS.navy,
            fontSize: "44px",
            lineHeight: 1.15,
            fontWeight: 900,
            letterSpacing: "-0.04em",
          }}
        >
          問題を投稿する
        </h1>

        <p
          style={{
            margin: "16px 0 0",
            color: COLORS.slate,
            fontSize: "17px",
            lineHeight: 1.8,
            fontWeight: 600,
          }}
        >
          問題文、タグ、画像、LaTeX数式をまとめて登録できます。
        </p>
      </header>

      {(errorMessage || message) && (
        <div style={{ marginBottom: "22px" }}>
          {errorMessage && <MessageBox type="error">{errorMessage}</MessageBox>}
          {message && <MessageBox type="success">{message}</MessageBox>}
        </div>
      )}

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
            onChange={(event) => setTitle(event.target.value)}
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
            onChange={setContent}
            mode={contentMode}
            onModeChange={setContentMode}
            onInsertLatex={insertLatexTemplate}
            rows={12}
            previewMinHeight="280px"
            placeholder="ここに問題文を入力してください。"
            emptyPreviewText="ここに問題内容のプレビューが表示されます。"
            extraToolbarContent={
              <ImageInsertButton
                isUploading={isUploadingImage}
                onImageSelect={handleImageUpload}
              />
            }
          />
        </div>

        <div style={{ marginBottom: "30px" }}>
          <ProblemTagSelector
            description="分野、難易度、テーマなどをタグで整理します。既存タグを選ぶか、新しく追加できます。"
            inputValue={newTagName}
            onInputChange={setNewTagName}
            suggestions={suggestions}
            onSelectSuggestion={handleSelectSuggestion}
            tags={tags}
            selectedTagIds={selectedTags}
            onToggleTag={toggleTag}
            onAddTag={handleAddTag}
          />
        </div>

        <PrimarySubmitButton onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "投稿中..." : "投稿する"}
        </PrimarySubmitButton>
      </SectionCard>
    </PageShell>
  )
}
