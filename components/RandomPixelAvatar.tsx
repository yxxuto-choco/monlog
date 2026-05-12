"use client"

type RandomPixelAvatarProps = {
  seed: string
  size?: number
  title?: string
}

type Pixel = {
  x: number
  y: number
  color: string
}

function hashString(input: string) {
  let hash = 2166136261

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function createRandom(seed: string) {
  let state = hashString(seed)

  return function random() {
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(items: T[], random: () => number) {
  return items[Math.floor(random() * items.length)]
}

function addRect(
  pixels: Pixel[],
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) {
  for (let yy = y; yy < y + height; yy += 1) {
    for (let xx = x; xx < x + width; xx += 1) {
      if (xx >= 0 && xx < 16 && yy >= 0 && yy < 16) {
        pixels.push({ x: xx, y: yy, color })
      }
    }
  }
}

function addSymmetric(pixels: Pixel[], x: number, y: number, color: string) {
  pixels.push({ x, y, color })
  pixels.push({ x: 15 - x, y, color })
}

function buildAvatar(seed: string) {
  const random = createRandom(seed)

  const skinColors = ["#F2C6A0", "#E8B487", "#C98F65", "#F5D0B5"]
  const hairColors = ["#2F243A", "#5A3825", "#7A4E2D", "#D8A24A", "#263238"]
  const robeColors = ["#1E3A5F", "#2A9D8F", "#5B4B8A", "#8A5A44", "#28536B"]
  const accentColors = ["#F4A261", "#E9C46A", "#B7E4C7", "#A8DADC", "#F6BD60"]
  const shadowColors = ["#172A44", "#1E6F66", "#3C3161", "#5A3A2D", "#1B3A4A"]

  const skin = pick(skinColors, random)
  const hair = pick(hairColors, random)
  const robe = pick(robeColors, random)
  const accent = pick(accentColors, random)
  const shadow = shadowColors[robeColors.indexOf(robe)] ?? "#172A44"

  const hatVariant = pick(["wide-hat", "hood", "cap"], random)
  const accessory = pick(["staff", "book", "potion", "none"], random)
  const eyeColor = pick(["#111827", "#1E3A5F", "#3A2D1F"], random)

  const pixels: Pixel[] = []

  // 足元の影
  addRect(pixels, 5, 14, 6, 1, "rgba(30, 58, 95, 0.18)")

  // ローブ本体
  addRect(pixels, 5, 8, 6, 5, robe)
  addRect(pixels, 4, 10, 8, 4, robe)
  addRect(pixels, 3, 12, 10, 2, robe)

  // ローブの影
  addRect(pixels, 3, 13, 2, 1, shadow)
  addRect(pixels, 11, 13, 2, 1, shadow)
  addRect(pixels, 7, 9, 2, 4, shadow)

  // ローブのアクセント
  addRect(pixels, 7, 8, 1, 5, accent)
  addRect(pixels, 8, 8, 1, 5, accent)

  // 首
  addRect(pixels, 7, 7, 2, 2, skin)

  // 顔
  addRect(pixels, 5, 4, 6, 4, skin)
  addRect(pixels, 6, 3, 4, 1, skin)
  addRect(pixels, 6, 8, 4, 1, skin)

  // 耳
  addRect(pixels, 4, 5, 1, 2, skin)
  addRect(pixels, 11, 5, 1, 2, skin)

  // 髪
  addRect(pixels, 5, 3, 6, 1, hair)
  addRect(pixels, 4, 4, 2, 3, hair)
  addRect(pixels, 10, 4, 2, 3, hair)

  if (random() > 0.45) {
    addRect(pixels, 6, 4, 1, 1, hair)
  }

  if (random() > 0.45) {
    addRect(pixels, 9, 4, 1, 1, hair)
  }

  // 目
  addRect(pixels, 6, 6, 1, 1, eyeColor)
  addRect(pixels, 9, 6, 1, 1, eyeColor)

  // 口
  if (random() > 0.5) {
    addRect(pixels, 7, 7, 2, 1, "#9F5F4B")
  } else {
    addRect(pixels, 7, 7, 1, 1, "#B46A55")
    addRect(pixels, 8, 7, 1, 1, "#B46A55")
  }

  // 帽子・フード
  if (hatVariant === "wide-hat") {
    addRect(pixels, 3, 3, 10, 1, shadow)
    addRect(pixels, 4, 2, 8, 1, robe)
    addRect(pixels, 5, 1, 6, 1, robe)
    addRect(pixels, 6, 0, 4, 1, accent)
    addRect(pixels, 6, 2, 4, 1, accent)
  }

  if (hatVariant === "hood") {
    addRect(pixels, 4, 2, 8, 2, robe)
    addRect(pixels, 3, 4, 2, 4, robe)
    addRect(pixels, 11, 4, 2, 4, robe)
    addRect(pixels, 4, 3, 1, 4, shadow)
    addRect(pixels, 11, 3, 1, 4, shadow)
    addRect(pixels, 6, 2, 4, 1, accent)
  }

  if (hatVariant === "cap") {
    addRect(pixels, 5, 2, 6, 2, robe)
    addRect(pixels, 4, 3, 8, 1, shadow)
    addRect(pixels, 7, 1, 2, 1, accent)
  }

  // 装備：杖
  if (accessory === "staff") {
    addRect(pixels, 13, 5, 1, 8, "#6B4423")
    addRect(pixels, 12, 4, 3, 1, accent)
    addRect(pixels, 13, 3, 1, 1, accent)
    addRect(pixels, 12, 6, 1, 1, "#6B4423")
  }

  // 装備：本
  if (accessory === "book") {
    addRect(pixels, 1, 10, 3, 3, "#8B5E34")
    addRect(pixels, 2, 10, 1, 3, accent)
    addRect(pixels, 1, 9, 3, 1, "#F6E7C8")
    addRect(pixels, 4, 11, 1, 1, skin)
  }

  // 装備：薬瓶
  if (accessory === "potion") {
    addRect(pixels, 12, 10, 2, 3, accent)
    addRect(pixels, 12, 9, 2, 1, "#D9F8F3")
    addRect(pixels, 13, 8, 1, 1, "#D9F8F3")
    addRect(pixels, 11, 11, 1, 1, skin)
  }

  // 小さな光
  if (random() > 0.35) {
    addSymmetric(pixels, 2, 4, accent)
  }

  if (random() > 0.55) {
    addSymmetric(pixels, 1, 7, "#FFFFFF")
  }

  return pixels
}

export default function RandomPixelAvatar({
  seed,
  size = 88,
  title = "ランダムドット絵アバター",
}: RandomPixelAvatarProps) {
  const pixels = buildAvatar(seed || "anonymous-user")

  return (
    <div
      title={title}
      aria-label={title}
      role="img"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "999px",
        background: "linear-gradient(135deg, #E3F1EE, #FAF7F0)",
        border: "3px solid rgba(255, 255, 255, 0.9)",
        boxShadow: "0 6px 18px rgba(30, 58, 95, 0.16)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 16 16"
        width={Math.floor(size * 0.76)}
        height={Math.floor(size * 0.76)}
        shapeRendering="crispEdges"
        style={{
          display: "block",
          imageRendering: "pixelated",
        }}
      >
        {pixels.map((pixel, index) => (
          <rect
            key={`${pixel.x}-${pixel.y}-${index}`}
            x={pixel.x}
            y={pixel.y}
            width="1"
            height="1"
            fill={pixel.color}
          />
        ))}
      </svg>
    </div>
  )
}