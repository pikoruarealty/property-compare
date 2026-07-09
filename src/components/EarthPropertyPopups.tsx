import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEarthStore } from "@/stores/earth-store";
import type { PinScreenPos } from "@/components/EarthGlobe";

const PROPERTIES = [
  {
    city: "Ahmedabad",
    country: "India",
    flag: "🇮🇳",
    name: "Ikebana",
    price: "₹1.85 Cr",
    detail: "4 BHK · Penthouse",
    badge: "Near Possession",
  },
];

interface Props {
  pinPositionsRef: React.MutableRefObject<PinScreenPos[]>;
  offset: { left: number; top: number };
}

export function EarthPropertyPopups({ pinPositionsRef, offset }: Props) {
  const { currentIndex, setIndex } = useEarthStore();
  const [visible] = useState(true);
  const [pos, setPos] = useState({ x: 0, y: 0, right: false });

  useEffect(() => {
    // Lock to our single current property
    if (currentIndex !== 0) setIndex(0);
  }, [currentIndex, setIndex]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const pins = pinPositionsRef.current;
      const current = PROPERTIES[currentIndex];
      const pin = pins?.find((p) => p.name === current.city);
      if (pin && pin.visible) {
        setPos({
          x: pin.x + offset.left,
          y: pin.y + offset.top,
          right: pin.x > 190,
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [currentIndex, pinPositionsRef, offset]);

  const p = PROPERTIES[currentIndex];
  const cardWidth = 220;
  const cardOffset = pos.right ? -cardWidth - 30 : 30;

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.4, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.4, y: 30, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={{
            position: "absolute",
            left: pos.x + cardOffset,
            top: pos.y - 60,
            width: cardWidth,
            zIndex: 15,
            pointerEvents: "none",
          }}
        >
          {/* Connector line */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 60,
              [pos.right ? "right" : "left"]: -30,
              width: 30,
              height: 1,
              background: "linear-gradient(to right, rgba(200,164,93,0.7), rgba(200,164,93,0.2))",
            }}
          />
          <div
            style={{
              background: "rgba(255, 251, 242, 0.96)",
              border: "1px solid rgba(200, 164, 93, 0.35)",
              borderRadius: 16,
              backdropFilter: "blur(12px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "relative",
                height: 90,
                background: "linear-gradient(135deg, #1f2937, #0f172a)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  padding: "2px 8px",
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: 999,
                  fontSize: 12,
                }}
              >
                {p.flag} {p.country}
              </div>
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  padding: "2px 8px",
                  background: "#C8A45D",
                  color: "#fff",
                  borderRadius: 999,
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {p.badge}
              </div>
            </div>
            <div style={{ padding: 12 }}>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  color: "#C8A45D",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                {p.city}
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 18,
                  color: "#0f172a",
                  marginTop: 2,
                  fontWeight: 700,
                }}
              >
                {p.name}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{p.detail}</div>
              <div
                style={{
                  fontSize: 14,
                  color: "#C8A45D",
                  marginTop: 6,
                  fontWeight: 600,
                }}
              >
                {p.price}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { PROPERTIES as EARTH_POPUP_PROPERTIES };
