"use client"

import { COLORS, RADII } from "@/components/ui/designTokens"

type LatexTemplateSelectorProps = {
  onInsert: (latex: string) => void
}

const LATEX_TEMPLATES = [
  {
    group: "基本",
    items: [
      {
        label: "分数",
        latex: "$ \\frac{1}{2} $",
      },
      {
        label: "平方根",
        latex: "$ \\sqrt{x^2 + 1} $",
      },
      {
        label: "上付き・下付き",
        latex: "$ a_n = x^2 + y_1 $",
      },
    ],
  },
  {
    group: "和・積分・極限",
    items: [
      {
        label: "総和",
        latex: "$$ \\sum_{k=1}^{n} k = \\frac{n(n+1)}{2} $$",
      },
      {
        label: "積分",
        latex: "$$ \\int_0^1 x^2 \\, dx = \\frac{1}{3} $$",
      },
      {
        label: "極限",
        latex: "$$ \\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right)^n = e $$",
      },
    ],
  },
  {
    group: "数列・漸化式",
    items: [
      {
        label: "等差数列",
        latex: "$$ a_n = a_1 + (n-1)d $$",
      },
      {
        label: "等比数列",
        latex: "$$ a_n = a_1 r^{n-1} $$",
      },
      {
        label: "漸化式",
        latex: "$$ a_{n+1} = 2a_n + 1, \\quad a_1 = 1 $$",
      },
    ],
  },
  {
    group: "場合分け",
    items: [
      {
        label: "場合分け関数",
        latex:
          "$$\nf(x)=\n\\begin{cases}\nx^2 & (x \\ge 0) \\\\\n-x & (x < 0)\n\\end{cases}\n$$",
      },
      {
        label: "条件付き定義",
        latex:
          "$$\na_n=\n\\begin{cases}\n1 & (n \\text{ が偶数}) \\\\\n-1 & (n \\text{ が奇数})\n\\end{cases}\n$$",
      },
    ],
  },
  {
    group: "式変形",
    items: [
      {
        label: "イコールをそろえる",
        latex:
          "$$\n\\begin{aligned}\na &= b + c \\\\\n  &= d + e \\\\\n  &= f\n\\end{aligned}\n$$",
      },
      {
        label: "不等式変形",
        latex:
          "$$\n\\begin{aligned}\nx^2 - 2x + 1 &\\ge 0 \\\\\n(x-1)^2 &\\ge 0\n\\end{aligned}\n$$",
      },
    ],
  },
  {
    group: "行列・ベクトル",
    items: [
      {
        label: "ベクトル",
        latex: "$$ \\mathbf{x} = \\begin{pmatrix} x_1 \\\\ x_2 \\\\ x_3 \\end{pmatrix} $$",
      },
      {
        label: "行列",
        latex:
          "$$ A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix} $$",
      },
      {
        label: "連立方程式",
        latex:
          "$$\n\\begin{cases}\nx + y = 1 \\\\\n2x - y = 3\n\\end{cases}\n$$",
      },
    ],
  },
  {
    group: "確率・統計",
    items: [
      {
        label: "確率",
        latex: "$$ P(A \\cap B) = P(A)P(B \\mid A) $$",
      },
      {
        label: "期待値",
        latex: "$$ \\mathbb{E}[X] = \\sum_x x P(X=x) $$",
      },
      {
        label: "分散",
        latex: "$$ \\mathrm{Var}(X)=\\mathbb{E}[X^2]-\\{\\mathbb{E}[X]\\}^2 $$",
      },
    ],
  },
]

export default function LatexTemplateSelector({ onInsert }: LatexTemplateSelectorProps) {
  function handleChange(value: string) {
    if (!value) return
    onInsert(value)
  }

  return (
    <div
      style={{
        marginTop: "14px",
        marginBottom: "14px",
      }}
    >
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          color: COLORS.navy,
          fontSize: "14px",
          fontWeight: 900,
        }}
      >
        LaTeXによる数式の例を選択
      </label>

      <select
        defaultValue=""
        onChange={(e) => {
          handleChange(e.target.value)
          e.currentTarget.value = ""
        }}
        style={{
          width: "100%",
          maxWidth: "520px",
          height: "46px",
          borderRadius: RADII.md,
          border: `1px solid ${COLORS.lineStrong}`,
          backgroundColor: COLORS.surface,
          color: COLORS.navy,
          fontSize: "15px",
          fontWeight: 800,
          padding: "0 14px",
          outline: "none",
          cursor: "pointer",
        }}
      >
        <option value="">例を選択してください</option>

        {LATEX_TEMPLATES.map((group) => (
          <optgroup key={group.group} label={group.group}>
            {group.items.map((item) => (
              <option key={`${group.group}-${item.label}`} value={item.latex}>
                {item.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <p
        style={{
          margin: "8px 0 0",
          color: COLORS.slate,
          fontSize: "13px",
          fontWeight: 700,
          lineHeight: 1.6,
        }}
      >
        選択すると、入力欄の末尾にLaTeX例が自動で挿入されます。必要に応じて数字や文字を変更してください。
      </p>
    </div>
  )
}