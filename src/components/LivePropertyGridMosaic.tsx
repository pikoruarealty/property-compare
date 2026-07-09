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

export function LivePropertyGridMosaic() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Horizontal rectangles: fewer columns, more rows so each cell is wide & short.
  const [cols, setCols] = useState(10);
  const [rows, setRows] = useState(10);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setCols(6);
        setRows(10);
      } else if (w < 1024) {
        setCols(8);
        setRows(11);
      } else {
        setCols(10);
        setRows(12);
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
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 2.5,
        row,
        col,
      });
    }
    return result;
  }, [cols, rows]);

  // Stronger radial mask so headline text stays crisp and readable.
  const centerClear =
    "radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 18%, rgba(255,255,255,0.72) 36%, rgba(255,255,255,0.32) 58%, rgba(255,255,255,0.06) 80%, rgba(255,255,255,0) 100%)";

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Global light wash so the grid never overpowers text */}
      <div className="absolute inset-0 bg-white/55" />

      <div
        className="absolute inset-0 grid gap-0.5 p-0.5 sm:gap-1 sm:p-1"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((cell) => (
          <div
            key={cell.id}
            className="relative overflow-hidden rounded-sm bg-muted/25"
            style={{
              animation: `mosaicPulse ${cell.duration}s ease-in-out ${cell.delay}s infinite alternate`,
            }}
          >
            <img
              src={cell.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0"
              style={{
                animation: `mosaicFade ${cell.duration}s ease-in-out ${cell.delay}s infinite alternate`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-slate-100/30" />
          </div>
        ))}
      </div>

      {/* Center clear mask for readable content */}
      <div
        className="absolute inset-0"
        style={{ background: centerClear }}
      />

      {/* Edge vignette to fade grid into page edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 12%, rgba(255,255,255,0) 88%, rgba(255,255,255,1) 100%)",
        }}
      />

      <style>{`
        @keyframes mosaicFade {
          0% { opacity: 0; transform: scale(1.04); }
          45% { opacity: 0.22; transform: scale(1); }
          100% { opacity: 0.38; transform: scale(1); }
        }
        @keyframes mosaicPulse {
          0% { filter: brightness(0.96); }
          100% { filter: brightness(1.04); }
        }
      `}</style>
    </div>
  );
}
