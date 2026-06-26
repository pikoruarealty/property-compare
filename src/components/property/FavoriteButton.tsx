import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useFavoritesStore } from "@/stores/favorites-store";
import { useHydrated } from "@/hooks/use-hydrated";

interface Props {
  propertyId: string;
  propertyName: string;
  propertyImage?: string;
  className?: string;
}

interface FlyState {
  from: { x: number; y: number };
  to: { x: number; y: number };
  image?: string;
  key: number;
}

export function FavoriteButton({ propertyId, propertyName, propertyImage, className = "" }: Props) {
  const hydrated = useHydrated();
  const { isFavorite, toggle } = useFavoritesStore();
  const favorited = hydrated && isFavorite(propertyId);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [fly, setFly] = useState<FlyState | null>(null);
  const [pulse, setPulse] = useState(0);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasFav = favorited;
    const nowFav = toggle(propertyId);

    if (!wasFav && nowFav) {
      const btn = btnRef.current;
      const target = document.querySelector<HTMLElement>("[data-saved-target]");
      if (btn && target) {
        const a = btn.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        setFly({
          from: { x: a.left + a.width / 2, y: a.top + a.height / 2 },
          to: { x: b.left + b.width / 2, y: b.top + b.height / 2 },
          image: propertyImage,
          key: Date.now(),
        });
        setPulse((p) => p + 1);
      }
    }

    toast.success(
      nowFav ? `${propertyName} saved to favorites` : `${propertyName} removed from favorites`,
    );
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
        onClick={handleClick}
        className={`relative grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md transition-all duration-300 ${
          favorited
            ? "border-champagne bg-champagne text-lux-black"
            : "border-champagne/40 bg-lux-black/40 text-champagne hover:bg-lux-black/60"
        } ${className}`}
      >
        <motion.span
          key={pulse}
          initial={{ scale: 1 }}
          animate={pulse ? { scale: [1, 1.4, 0.85, 1] } : { scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid place-items-center"
        >
          <Heart className={`h-4 w-4 ${favorited ? "fill-current" : ""}`} />
        </motion.span>
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {fly && (
              <motion.div
                key={fly.key}
                initial={{
                  x: fly.from.x,
                  y: fly.from.y,
                  scale: 1,
                  opacity: 1,
                  rotate: 0,
                }}
                animate={{
                  x: fly.to.x,
                  y: fly.to.y,
                  scale: 0.25,
                  opacity: 0.9,
                  rotate: 12,
                }}
                exit={{ opacity: 0, scale: 0.1 }}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                onAnimationComplete={() => setFly(null)}
                style={{
                  position: "fixed",
                  left: 0,
                  top: 0,
                  translateX: "-50%",
                  translateY: "-50%",
                  pointerEvents: "none",
                  zIndex: 9999,
                }}
                className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-champagne bg-lux-black shadow-[0_20px_60px_-10px_rgba(200,164,93,0.6)]"
              >
                {fly.image ? (
                  <img src={fly.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Heart className="h-6 w-6 fill-champagne text-champagne" />
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
