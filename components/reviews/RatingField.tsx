"use client"

import FieldLabel from "@/components/ui/FieldLabel"
import RatingSelect from "@/components/reviews/RatingSelect"

type RatingFieldProps = {
  value: string
  onChange: (value: string) => void
  label?: string
}

export default function RatingField({
  value,
  onChange,
  label = "評価",
}: RatingFieldProps) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <FieldLabel size="16px">{label}</FieldLabel>
      <RatingSelect value={value} onChange={onChange} />
    </div>
  )
}
