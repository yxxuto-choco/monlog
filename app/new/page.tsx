"use client"

import useNewProblemForm from "@/hooks/useNewProblemForm"
import NewProblemForm from "@/components/problems/NewProblemForm"
import NewProblemHeader from "@/components/problems/NewProblemHeader"
import PageShell from "@/components/ui/PageShell"
import MessageBox from "@/components/ui/MessageBox"

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
      <NewProblemHeader />

      {(errorMessage || message) && (
        <div style={{ marginBottom: "22px" }}>
          {errorMessage && <MessageBox type="error">{errorMessage}</MessageBox>}
          {message && <MessageBox type="success">{message}</MessageBox>}
        </div>
      )}

      <NewProblemForm
        title={title}
        onTitleChange={setTitle}
        content={content}
        onContentChange={setContent}
        contentMode={contentMode}
        onContentModeChange={setContentMode}
        onInsertLatex={insertLatexTemplate}
        isUploadingImage={isUploadingImage}
        onImageUpload={handleImageUpload}
        tags={tags}
        selectedTags={selectedTags}
        newTagName={newTagName}
        onNewTagNameChange={setNewTagName}
        suggestions={suggestions}
        onSelectSuggestion={handleSelectSuggestion}
        onToggleTag={toggleTag}
        onAddTag={handleAddTag}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </PageShell>
  )
}
