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
 * Earth-themed live property grid.
 * - Oceanic blue/teal color wash matching the daylight globe
 * - Latitude / longitude line overlay (subtle graticule)
 * - Soft equator glow band
 * - Twinkling connection dots (like city nodes on the globe)
 * - Center reading area kept clear so hero text stays legible
 */
export function LivePropertyGridMosaic() {
  const containerRef = useRef<HTMLDivElement | null>(null);
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
        duration: 3.5 + Math.random() * 2.5,
        row,
        col,
      });
    }
    return result;
  }, [cols, rows]);

  // Twinkling "city node" dots — sparse, positioned around the frame
  const nodes = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        top: `${8 + Math.random() * 84}%`,
        left: `${6 + Math.random() * 88}%`,
        delay: Math.random() * 4,
        duration: 2.4 + Math.random() * 2.6,
        size: 3 + Math.random() * 3,
      })),
    []
  );

  // Center reading area kept lightly clear
  const centerClear =
    "radial-gradient(ellipse at center, rgba(240,249,255,0.55) 0%, rgba(224,242,254,0.28) 30%, rgba(224,242,254,0.08) 55%, rgba(224,242,254,0) 76%)";

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Ocean-atmosphere base wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #f5fbff 0%, #eaf4fb 45%, #f0f7fc 100%)",
        }}
      />

      {/* Aurora / atmospheric radial tints (poles + equator glow) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(186,230,253,0.55) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(191,219,254,0.45) 0%, transparent 60%), radial-gradient(ellipse 80% 22% at 50% 50%, rgba(125,211,252,0.22) 0%, transparent 70%)",
        }}
      />

      {/* Property image mosaic (very subtle, tinted to ocean palette) */}
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
            className="relative overflow-hidden rounded-sm"
            style={{
              backgroundColor: "rgba(186,230,253,0.10)",
              animation: `mosaicPulse ${cell.duration}s ease-in-out ${cell.delay}s infinite alternate`,
            }}
          >
            <img
              src={cell.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0"
              style={{
                filter: "saturate(0.55) hue-rotate(-6deg)",
                animation: `mosaicFade ${cell.duration}s ease-in-out ${cell.delay}s infinite alternate`,
              }}
            />
            {/* Ocean tint over every cell */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(224,242,254,0.55), rgba(191,219,254,0.45))",
              }}
            />
          </div>
        ))}
      </div>

      {/* Graticule — latitude / longitude lines (earth grid) */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(56,189,248,0)" />
            <stop offset="50%" stopColor="rgba(56,189,248,0.35)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0)" />
          </linearGradient>
        </defs>
        {/* Latitudes — curved arcs to feel spherical */}
        {[12, 24, 36, 50, 64, 76, 88].map((y, i) => (
          <path
            key={`lat-${i}`}
            d={`M -2 ${y} Q 50 ${y + (y < 50 ? -3 : 3)} 102 ${y}`}
            fill="none"
            stroke="url(#gridFade)"
            strokeWidth="0.15"
          />
        ))}
        {/* Longitudes — vertical arcs bowing outward */}
        {[10, 25, 40, 50, 60, 75, 90].map((x, i) => {
          const bow = (x - 50) * 0.18;
          return (
            <path
              key={`lon-${i}`}
              d={`M ${x} -2 Q ${x + bow} 50 ${x} 102`}
              fill="none"
              stroke="rgba(56,189,248,0.22)"
              strokeWidth="0.12"
            />
          );
        })}
        {/* Equator emphasized */}
        <path
          d="M -2 50 Q 50 48 102 50"
          fill="none"
          stroke="rgba(14,165,233,0.35)"
          strokeWidth="0.22"
        />
      </svg>

      {/* Twinkling city nodes */}
      {nodes.map((n) => (
        <span
          key={n.id}
          className="absolute rounded-full"
          style={{
            top: n.top,
            left: n.left,
            width: n.size,
            height: n.size,
            background: "rgba(14,165,233,0.75)",
            boxShadow:
              "0 0 8px rgba(56,189,248,0.75), 0 0 18px rgba(125,211,252,0.55)",
            animation: `nodeTwinkle ${n.duration}s ease-in-out ${n.delay}s infinite`,
          }}
        />
      ))}

      {/* Center clear mask */}
      <div className="absolute inset-0" style={{ background: centerClear }} />

      {/* Edge vignette fading to white */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 12%, rgba(255,255,255,0) 88%, rgba(255,255,255,0.95) 100%), linear-gradient(to right, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 10%, rgba(255,255,255,0) 90%, rgba(255,255,255,0.6) 100%)",
        }}
      />

      <style>{`
        @keyframes mosaicFade {
          0% { opacity: 0; transform: scale(1.04); }
          45% { opacity: 0.12; transform: scale(1); }
          100% { opacity: 0.22; transform: scale(1); }
        }
        @keyframes mosaicPulse {
          0% { filter: brightness(0.98); }
          100% { filter: brightness(1.05); }
        }
        @keyframes nodeTwinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.25); }
        }
      `}</style>
    </div>
  );
}
