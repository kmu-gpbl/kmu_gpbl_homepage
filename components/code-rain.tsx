"use client"

import { useEffect, useState } from "react"

interface RainDrop {
  id: number
  x: number
  y: number
  speed: number
  opacity: number
  char: string
}

const codeChars = [
  "{",
  "}",
  "(",
  ")",
  "[",
  "]",
  "<",
  ">",
  "=",
  "+",
  "-",
  "*",
  "/",
  "%",
  "&",
  "|",
  "!",
  "?",
  ":",
  ";",
  ",",
  ".",
  '"',
  "'",
  "`",
  "~",
  "^",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "x",
  "y",
  "z",
]

export function CodeRain() {
  const [drops, setDrops] = useState<RainDrop[]>([])

  useEffect(() => {
    const generateDrops = () => {
      const newDrops: RainDrop[] = []

      for (let i = 0; i < 100; i++) {
        newDrops.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          speed: Math.random() * 0.5 + 0.2,
          opacity: Math.random() * 0.3 + 0.1,
          char: codeChars[Math.floor(Math.random() * codeChars.length)],
        })
      }

      setDrops(newDrops)
    }

    generateDrops()
  }, [])

  useEffect(() => {
    const animateDrops = () => {
      setDrops((prev) =>
        prev.map((drop) => ({
          ...drop,
          y: drop.y > 100 ? -5 : drop.y + drop.speed,
          char: Math.random() < 0.1 ? codeChars[Math.floor(Math.random() * codeChars.length)] : drop.char,
        })),
      )
    }

    const interval = setInterval(animateDrops, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute text-green-400 dark:text-green-500 font-mono text-sm select-none"
          style={{
            left: `${drop.x}%`,
            top: `${drop.y}%`,
            opacity: drop.opacity,
            transform: "translateZ(0)", // GPU acceleration
          }}
        >
          {drop.char}
        </div>
      ))}
    </div>
  )
}
