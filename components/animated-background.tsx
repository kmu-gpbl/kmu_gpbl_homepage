"use client";

import { useEffect, useState } from "react";

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  type: "code" | "shape" | "symbol";
  content: string;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

interface BinaryColumn {
  id: number;
  x: number;
  y: number;
  animationDelay: number;
  animationDuration: number;
  bits: string[];
}

interface GeometricShape {
  id: number;
  x: number;
  y: number;
  animationDelay: number;
  animationDuration: number;
  color: string;
  isCircle: boolean;
  isRotated: boolean;
}

const codeElements = [
  "{ }",
  "< >",
  "[ ]",
  "( )",
  "=>",
  "&&",
  "||",
  "++",
  "--",
  "===",
  "!==",
  "const",
  "let",
  "var",
  "function",
  "return",
  "if",
  "else",
  "for",
  "while",
  "import",
  "export",
  "class",
  "extends",
  "async",
  "await",
  "try",
  "catch",
];

const symbols = ["⚡", "🚀", "💡", "⭐", "🔥", "💻", "🎯", "✨", "🌟", "⚙️"];

const shapes = ["●", "■", "▲", "◆", "▼", "◀", "▶", "◆"];

const colors = [
  "text-pink-300/30",
  "text-blue-300/30",
  "text-green-300/30",
  "text-purple-300/30",
  "text-orange-300/30",
  "text-indigo-300/30",
  "text-cyan-300/30",
  "text-yellow-300/30",
];

export function AnimatedBackground() {
  const [elements, setElements] = useState<FloatingElement[]>([]);
  const [binaryColumns, setBinaryColumns] = useState<BinaryColumn[]>([]);
  const [geometricShapes, setGeometricShapes] = useState<GeometricShape[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const generateElements = () => {
      const newElements: FloatingElement[] = [];

      for (let i = 0; i < 50; i++) {
        const type =
          Math.random() < 0.4
            ? "code"
            : Math.random() < 0.7
            ? "symbol"
            : "shape";
        let content = "";

        if (type === "code") {
          content =
            codeElements[Math.floor(Math.random() * codeElements.length)];
        } else if (type === "symbol") {
          content = symbols[Math.floor(Math.random() * symbols.length)];
        } else {
          content = shapes[Math.floor(Math.random() * shapes.length)];
        }

        newElements.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 20 + 10,
          speed: Math.random() * 0.5 + 0.1,
          type,
          content,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 2,
        });
      }

      setElements(newElements);
    };

    const generateBinaryColumns = () => {
      const newColumns: BinaryColumn[] = [];

      for (let i = 0; i < 20; i++) {
        const bits = Array.from({ length: 10 }, () =>
          Math.random() > 0.5 ? "1" : "0"
        );

        newColumns.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          animationDelay: Math.random() * 5,
          animationDuration: 3 + Math.random() * 2,
          bits,
        });
      }

      setBinaryColumns(newColumns);
    };

    const generateGeometricShapes = () => {
      const newShapes: GeometricShape[] = [];

      for (let i = 0; i < 15; i++) {
        newShapes.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          animationDelay: Math.random() * 10,
          animationDuration: 8 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)].replace(
            "/30",
            ""
          ),
          isCircle: Math.random() > 0.5,
          isRotated: Math.random() > 0.5,
        });
      }

      setGeometricShapes(newShapes);
    };

    generateElements();
    generateBinaryColumns();
    generateGeometricShapes();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const animateElements = () => {
      setElements((prev) =>
        prev.map((element) => ({
          ...element,
          y: element.y <= -10 ? 110 : element.y - element.speed,
          rotation: element.rotation + element.rotationSpeed,
        }))
      );
    };

    const interval = setInterval(animateElements, 50);
    return () => clearInterval(interval);
  }, [mounted]);

  // Don't render dynamic content until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Static gradient blobs that don't use random values */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-200/10 to-purple-200/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-green-200/10 to-emerald-200/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="grid grid-cols-12 h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div
                key={i}
                className="border border-gray-400 dark:border-gray-600"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-200/10 to-purple-200/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-green-200/10 to-emerald-200/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "4s" }}
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="grid grid-cols-12 h-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-400 dark:border-gray-600"
            />
          ))}
        </div>
      </div>

      {/* Floating Elements */}
      {elements.map((element) => (
        <div
          key={element.id}
          className={`absolute ${element.color} font-mono font-bold select-none transition-all duration-100 ease-linear`}
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            fontSize: `${element.size}px`,
            transform: `rotate(${element.rotation}deg)`,
            zIndex: -1,
          }}
        >
          {element.content}
        </div>
      ))}

      {/* Binary Rain Effect */}
      <div className="absolute inset-0 opacity-[0.03]">
        {binaryColumns.map((column) => (
          <div
            key={column.id}
            className="absolute text-green-500 font-mono text-xs animate-pulse"
            style={{
              left: `${column.x}%`,
              top: `${column.y}%`,
              animationDelay: `${column.animationDelay}s`,
              animationDuration: `${column.animationDuration}s`,
            }}
          >
            {column.bits.map((bit, j) => (
              <div key={j} className="mb-1">
                {bit}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Geometric Shapes */}
      <div className="absolute inset-0">
        {geometricShapes.map((shape) => (
          <div
            key={shape.id}
            className="absolute animate-float opacity-10"
            style={{
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              animationDelay: `${shape.animationDelay}s`,
              animationDuration: `${shape.animationDuration}s`,
            }}
          >
            <div
              className={`w-4 h-4 ${shape.color} ${
                shape.isCircle
                  ? "rounded-full"
                  : shape.isRotated
                  ? "rotate-45"
                  : ""
              }`}
              style={{
                backgroundColor: "currentColor",
                opacity: 0.1,
              }}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(90deg);
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
          }
          75% {
            transform: translateY(-30px) rotate(270deg);
          }
        }
        .animate-float {
          animation: float 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
