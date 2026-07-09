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
  const [cols, setCols] = useState(16);
  const [rows, setRows] = useState(5);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setCols(8);
        setRows(4);
      } else if (w < 1024) {
        setCols(12);
        setRows(5);
      } else {
        setCols(18);
        setRows(6);
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
    "radial-gradient(ellipse at center, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.82) 22%, rgba(255,255,255,0.45) 48%, rgba(255,255,255,0.08) 74%, rgba(255,255,255,0) 100%)";

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
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
            className="relative overflow-hidden rounded-sm bg-muted/40"
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
            "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 10%, rgba(255,255,255,0) 90%, rgba(255,255,255,1) 100%)",
        }}
      />

      <style>{`
        @keyframes mosaicFade {
          0% { opacity: 0; transform: scale(1.05); }
          40% { opacity: 0.45; transform: scale(1); }
          100% { opacity: 0.75; transform: scale(1); }
        }
        @keyframes mosaicPulse {
          0% { filter: brightness(0.94); }
          100% { filter: brightness(1.06); }
        }
      `}</style>
    </div>
  );
}
