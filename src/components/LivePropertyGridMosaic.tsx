import { useEffect, useMemo, useRef, useState } from "react";
import { properties } from "@/data/properties";

interface Cell {
  id: string;
  image: string;
  delay: number;
  duration: number;
  row: number;
  col: number;
}

/**
 * Subtle live property photo mosaic for the hero background.
 * Horizontal rectangular tiles fade in and out gently behind the headline,
 * kept very light so text remains fully readable.
 */
export function LivePropertyGridMosaic() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cols, setCols] = useState(8);
  const [rows, setRows] = useState(12);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setCols(4);
        setRows(12);
      } else if (w < 1024) {
        setCols(6);
        setRows(14);
      } else {
        setCols(8);
        setRows(16);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const cells = useMemo<Cell[]>(() => {
    const total = cols * rows;
    const propertyImages = properties.map((p) => p.image);
    const result: Cell[] = [];
    for (let i = 0; i < total; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      result.push({
        id: `${row}-${col}-${i}`,
        image: propertyImages[i % propertyImages.length],
        delay: Math.random() * 6,
        duration: 4 + Math.random() * 3,
        row,
        col,
      });
    }
    return result;
  }, [cols, rows]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Very light base wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.85) 50%, rgba(255,255,255,0.92) 100%)",
        }}
      />

      {/* Property image mosaic — horizontal rectangles, low opacity */}
      <div
        className="absolute inset-0 grid gap-1 p-1 sm:gap-1.5 sm:p-1.5"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((cell) => (
          <div
            key={cell.id}
            className="relative overflow-hidden rounded-sm"
            style={{
              backgroundColor: "rgba(241,245,249,0.6)",
            }}
          >
            <img
              src={cell.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                opacity: 0.08,
                filter: "saturate(0.4) brightness(1.15)",
                animation: `mosaicFade ${cell.duration}s ease-in-out ${cell.delay}s infinite alternate`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Soft center clear zone for headline readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.45) 35%, rgba(255,255,255,0.15) 60%, rgba(255,255,255,0) 80%)",
        }}
      />

      {/* Edge vignette to white */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 15%, rgba(255,255,255,0) 85%, rgba(255,255,255,0.95) 100%), linear-gradient(to right, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 12%, rgba(255,255,255,0) 88%, rgba(255,255,255,0.85) 100%)",
        }}
      />

      <style>{`
        @keyframes mosaicFade {
          0% { opacity: 0.04; transform: scale(1.03); }
          50% { opacity: 0.10; transform: scale(1); }
          100% { opacity: 0.06; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
