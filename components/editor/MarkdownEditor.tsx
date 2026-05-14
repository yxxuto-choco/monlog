"use client"

import type { ReactNode } from "react"
import ProblemMarkdown from "@/components/ProblemMarkdown"
import LatexTemplateSelector from "@/components/LatexTemplateSelector"
import TextArea from "@/components/ui/TextArea"
import LatexHelpChips from "@/components/editor/LatexHelpChips"
import EditorModeToolbar from "@/components/editor/EditorModeToolbar"
import EditorPreviewBox from "@/components/editor/EditorPreviewBox"
import EditorEmptyText from "@/components/editor/EditorEmptyText"

type EditorMode = "input" | "preview"

type MarkdownEditorProps = {
  value: string
  onChange: (value: string) => void
  mode: EditorMode
  onModeChange: (mode: EditorMode) => void
  onInsertLatex: (latex: string) => void
  placeholder?: string
  emptyPreviewText?: string
  rows?: number
  previewMinHeight?: string
  extraToolbarContent?: ReactNode
  showLatexHelp?: boolean
}

export default function MarkdownEditor({
  value,
  onChange,
  mode,
  onModeChange,
  onInsertLatex,
  placeholder = "ここに本文を入力してください。",
  emptyPreviewText = "ここにプレビューが表示されます。",
  rows = 8,
  previewMinHeight = "210px",
  extraToolbarContent,
  showLatexHelp = true,
}: MarkdownEditorProps) {
  return (
    <>
      <LatexTemplateSelector onInsert={onInsertLatex} />

      <EditorModeToolbar
        mode={mode}
        onInput={() => onModeChange("input")}
        onPreview={() => onModeChange("preview")}
        extra={extraToolbarContent}
      />

      {mode === "input" ? (
        <TextArea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          placeholder={placeholder}
        />
      ) : (
        <EditorPreviewBox minHeight={previewMinHeight}>
          {value.trim() ? (
            <ProblemMarkdown content={value} />
          ) : (
            <EditorEmptyText>{emptyPreviewText}</EditorEmptyText>
          )}
        </EditorPreviewBox>
      )}

      {showLatexHelp && <LatexHelpChips />}
    </>
  )
}
