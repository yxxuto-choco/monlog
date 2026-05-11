"use client"

import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"

const COLORS = {
  navy: "#1E3A5F",
  text: "#1F2937",
  line: "#D8DDD6",
  soft: "#FBF8EF",
}

type ProblemMarkdownProps = {
  content: string
}

function normalizeMathDelimiters(content: string) {
  let normalized = content

  // \[ ... \] を $$ ... $$ に変換
  normalized = normalized.replace(/\\\[([\s\S]*?)\\\]/g, (_match, formula) => {
    return `\n\n$$\n${formula.trim()}\n$$\n\n`
  })

  // \( ... \) を $ ... $ に変換
  normalized = normalized.replace(/\\\(([\s\S]*?)\\\)/g, (_match, formula) => {
    return `$${formula.trim()}$`
  })

  return normalized
}

export default function ProblemMarkdown({ content }: ProblemMarkdownProps) {
  const normalizedContent = normalizeMathDelimiters(content)

  return (
    <div
      style={{
        color: COLORS.text,
        fontSize: "21px",
        lineHeight: 1.9,
      }}
    >
      <ReactMarkdown
        remarkPlugins={[[remarkMath, { singleDollarTextMath: true }]]}
        rehypePlugins={[[rehypeKatex, { output: "mathml" }]]}
        components={{
          p: ({ children }) => (
            <p
              style={{
                margin: "0 0 18px",
                lineHeight: 1.9,
              }}
            >
              {children}
            </p>
          ),

          h1: ({ children }) => (
            <h1
              style={{
                margin: "28px 0 16px",
                color: COLORS.navy,
                fontSize: "30px",
                fontWeight: 900,
                lineHeight: 1.35,
              }}
            >
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2
              style={{
                margin: "26px 0 14px",
                color: COLORS.navy,
                fontSize: "26px",
                fontWeight: 900,
                lineHeight: 1.35,
              }}
            >
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3
              style={{
                margin: "24px 0 12px",
                color: COLORS.navy,
                fontSize: "22px",
                fontWeight: 900,
                lineHeight: 1.35,
              }}
            >
              {children}
            </h3>
          ),

          ul: ({ children }) => (
            <ul
              style={{
                margin: "0 0 18px",
                paddingLeft: "1.4em",
              }}
            >
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol
              style={{
                margin: "0 0 18px",
                paddingLeft: "1.4em",
              }}
            >
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li
              style={{
                marginBottom: "8px",
                lineHeight: 1.8,
              }}
            >
              {children}
            </li>
          ),

          blockquote: ({ children }) => (
            <blockquote
              style={{
                margin: "20px 0",
                padding: "16px 20px",
                borderLeft: "5px solid #2A9D8F",
                backgroundColor: COLORS.soft,
                color: COLORS.text,
                borderRadius: "12px",
              }}
            >
              {children}
            </blockquote>
          ),

          code: ({ children }) => (
            <code
              style={{
                backgroundColor: COLORS.soft,
                border: `1px solid ${COLORS.line}`,
                borderRadius: "6px",
                padding: "2px 6px",
                fontSize: "0.92em",
              }}
            >
              {children}
            </code>
          ),

          pre: ({ children }) => (
            <pre
              style={{
                overflowX: "auto",
                margin: "22px 0",
                padding: "18px",
                backgroundColor: COLORS.soft,
                border: `1px solid ${COLORS.line}`,
                borderRadius: "14px",
                fontSize: "16px",
                lineHeight: 1.7,
              }}
            >
              {children}
            </pre>
          ),

          img: ({ src, alt }) => (
            <img
              src={src ?? ""}
              alt={alt ?? ""}
              style={{
                display: "block",
                maxWidth: "100%",
                height: "auto",
                margin: "24px auto",
                borderRadius: "16px",
                border: `1px solid ${COLORS.line}`,
              }}
            />
          ),

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#2A9D8F",
                fontWeight: 800,
                textDecoration: "underline",
              }}
            >
              {children}
            </a>
          ),
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  )
}