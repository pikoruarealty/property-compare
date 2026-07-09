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

  // Soft radial mask: center stays readable but grid is still visible, not a blank hole.
  const centerClear =
    "radial-gradient(ellipse at center, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.22) 28%, rgba(255,255,255,0.08) 52%, rgba(255,255,255,0) 74%)";

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Global light wash so the grid never overpowers text */}
      <div className="absolute inset-0 bg-white/40" />

      {/* Soft ocean-tint wash to unify with the light theme */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 30%, rgba(224,242,254,0.35) 0%, transparent 55%), radial-gradient(ellipse at 30% 70%, rgba(241,245,249,0.45) 0%, transparent 50%)",
        }}
      />

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
            className="relative overflow-hidden rounded-sm bg-muted/30"
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
            <div className="absolute inset-0 bg-gradient-to-br from-white/35 to-slate-100/40" />
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
            "linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 10%, rgba(255,255,255,0) 90%, rgba(255,255,255,0.95) 100%)",
        }}
      />

      <style>{`
        @keyframes mosaicFade {
          0% { opacity: 0; transform: scale(1.04); }
          45% { opacity: 0.14; transform: scale(1); }
          100% { opacity: 0.26; transform: scale(1); }
        }
        @keyframes mosaicPulse {
          0% { filter: brightness(0.98); }
          100% { filter: brightness(1.04); }
        }
      `}</style>
    </div>
  );
}
