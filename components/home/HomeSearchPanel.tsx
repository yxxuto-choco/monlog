"use client"

import SectionCard from "@/components/ui/SectionCard"
import { COLORS, RADII } from "@/components/ui/designTokens"

type SortMode = "default" | "popular"

type HomeSearchPanelProps = {
  sortMode: SortMode
  onSortModeChange: (mode: SortMode) => void
  query: string
  onQueryChange: (value: string) => void
  onClearQuery: () => void
}

function SearchIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function HomeSearchPanel({
  sortMode,
  onSortModeChange,
  query,
  onQueryChange,
  onClearQuery,
}: HomeSearchPanelProps) {
  return (
    <SectionCard
      variant="teal"
      style={{
        borderLeft: `6px solid ${COLORS.teal}`,
        borderRadius: RADII.md,
        padding: "34px 38px",
        marginBottom: "44px",
      }}
    >
      <h2
        style={{
          margin: "0 0 26px",
          color: COLORS.navy,
          fontSize: "30px",
          fontWeight: 900,
        }}
      >
        問題を探す
      </h2>

      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => onSortModeChange("default")}
            style={{
              minHeight: "62px",
              padding: "0 22px",
              borderRadius: RADII.sm,
              border: `1px solid ${sortMode === "default" ? COLORS.teal : COLORS.line}`,
              backgroundColor: sortMode === "default" ? COLORS.teal : COLORS.surface,
              color: sortMode === "default" ? "#FFFFFF" : COLORS.navy,
              fontSize: "20px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            新着順
          </button>

          <button
            type="button"
            onClick={() => onSortModeChange("popular")}
            style={{
              minHeight: "62px",
              padding: "0 22px",
              borderRadius: RADII.sm,
              border: `1px solid ${sortMode === "popular" ? COLORS.teal : COLORS.line}`,
              backgroundColor: sortMode === "popular" ? COLORS.teal : COLORS.surface,
              color: sortMode === "popular" ? "#FFFFFF" : COLORS.navy,
              fontSize: "20px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            人気順
          </button>
        </div>

        <div
          style={{
            flex: "1 1 420px",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "18px",
              transform: "translateY(-50%)",
              color: COLORS.slate,
              display: "inline-flex",
            }}
          >
            <SearchIcon />
          </span>

          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="問題を検索..."
            style={{
              width: "100%",
              height: "62px",
              borderRadius: RADII.sm,
              border: `1px solid ${COLORS.line}`,
              backgroundColor: COLORS.surface,
              color: COLORS.text,
              fontSize: "19px",
              padding: "0 18px 0 58px",
              outline: "none",
            }}
          />
        </div>

        {query.trim() && (
          <button
            type="button"
            onClick={onClearQuery}
            style={{
              minHeight: "50px",
              border: `1px solid ${COLORS.tealLine}`,
              backgroundColor: COLORS.surface,
              color: COLORS.teal,
              borderRadius: RADII.pill,
              padding: "0 18px",
              fontSize: "15px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            解除
          </button>
        )}
      </div>
    </SectionCard>
  )
}
