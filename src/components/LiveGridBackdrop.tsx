import { useEffect, useRef } from "react";

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  op: number;
  opDir: number;
}

export function LiveGridBackdrop() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const linesGroupRef = useRef<SVGGElement | null>(null);
  const dotsGroupRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const W = rect.width || 800;
    const H = rect.height || 600;

    dotsRef.current = Array.from({ length: 25 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      op: 0.3 + Math.random() * 0.25,
      opDir: Math.random() > 0.5 ? 1 : -1,
    }));

    let raf = 0;
    const svgNS = "http://www.w3.org/2000/svg";

    function tick() {
      const bounds = svg!.getBoundingClientRect();
      const w = bounds.width;
      const h = bounds.height;
      const dots = dotsRef.current;
      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        d.op += d.opDir * 0.003;
        if (d.op > 0.55) d.opDir = -1;
        if (d.op < 0.3) d.opDir = 1;
      });

      // update dots
      const dg = dotsGroupRef.current!;
      while (dg.childNodes.length < dots.length) {
        const c = document.createElementNS(svgNS, "circle");
        c.setAttribute("r", "2");
        c.setAttribute("fill", "#C8A45D");
        dg.appendChild(c);
      }
      dots.forEach((d, i) => {
        const c = dg.childNodes[i] as SVGCircleElement;
        c.setAttribute("cx", String(d.x));
        c.setAttribute("cy", String(d.y));
        c.setAttribute("opacity", String(d.op));
      });

      // rebuild lines
      const lg = linesGroupRef.current!;
      lg.innerHTML = "";
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", String(dots[i].x));
            line.setAttribute("y1", String(dots[i].y));
            line.setAttribute("x2", String(dots[j].x));
            line.setAttribute("y2", String(dots[j].y));
            line.setAttribute("stroke", "#C8A45D");
            line.setAttribute("stroke-width", "0.4");
            line.setAttribute("opacity", String((1 - dist / 120) * 0.25));
            lg.appendChild(line);
          }
        }
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <svg ref={svgRef} width="100%" height="100%" style={{ display: "block" }}>
        <defs>
          <pattern id="livegrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#C8A45D"
              strokeWidth="0.4"
              opacity="0.4"
            />
          </pattern>
          <radialGradient id="gridmask" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="gm">
            <rect width="100%" height="100%" fill="url(#gridmask)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#livegrid)" mask="url(#gm)" />
        <g ref={linesGroupRef} />
        <g ref={dotsGroupRef} />
      </svg>
    </div>
  );
}
