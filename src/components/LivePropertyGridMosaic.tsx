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
  const [cols, setCols] = useState(8);
  const [rows, setRows] = useState(6);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setCols(4);
        setRows(5);
      } else if (w < 1024) {
        setCols(6);
        setRows(6);
      } else {
        setCols(9);
        setRows(7);
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
        delay: Math.random() * 4,
        duration: 2.5 + Math.random() * 2.5,
        row,
        col,
      });
    }
    return result;
  }, [cols, rows]);

  const centerClear =
    "radial-gradient(ellipse at center, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.75) 28%, rgba(255,255,255,0.35) 55%, rgba(255,255,255,0.05) 78%, rgba(255,255,255,0) 100%)";

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div
        className="absolute inset-0 grid gap-1.5 p-1.5 sm:gap-2 sm:p-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((cell) => (
          <div
            key={cell.id}
            className="relative overflow-hidden rounded-md bg-muted/40"
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
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-slate-200/20" />
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
          0% { opacity: 0; transform: scale(1.05); }
          40% { opacity: 0.55; transform: scale(1); }
          100% { opacity: 0.85; transform: scale(1); }
        }
        @keyframes mosaicPulse {
          0% { filter: brightness(0.92); }
          100% { filter: brightness(1.08); }
        }
      `}</style>
    </div>
  );
}
