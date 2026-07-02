import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Moon, Sun } from "lucide-react";

const WHATSAPP_NUMBER = "919999999999"; // country code + number, no + or spaces
const WHATSAPP_MESSAGE = "Hi PIKORUA, I'd like to know more about your luxury residences.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
import { useOnboarding } from "@/context/OnboardingContext";
import { useFavoritesStore } from "@/stores/favorites-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { useTheme, PALETTES } from "@/context/ThemeContext";

export function SiteHeader() {
  const { userProfile } = useOnboarding();
  const { theme, toggle, palette, setPalette } = useTheme();
  const hydrated = useHydrated();
  const favCount = useFavoritesStore((s) => s.favorites.length);
  const initials = userProfile?.name
    ? userProfile.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--glass-border)] bg-lux-black/85 backdrop-blur-md [transform:translateZ(0)]">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full gold-border">
            <span className="font-display text-sm gold-text">P</span>
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg text-ivory">PIKORUA</p>
            <p className="text-[9px] tracking-luxury text-champagne">Property Consultant</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 sm:flex">
          <a href="#suite" className="text-[11px] tracking-luxury text-ivory/70 hover:text-champagne">
            Suite
          </a>
          <a href="#collection" className="text-[11px] tracking-luxury text-ivory/70 hover:text-champagne">
            Collection
          </a>
          <a href="#" className="text-[11px] tracking-luxury text-ivory/70 hover:text-champagne">
            Advisory
          </a>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact on WhatsApp"
            className="inline-flex items-center gap-1.5 rounded-full border border-champagne/40 bg-champagne/10 px-3 py-1.5 text-[11px] tracking-luxury text-ivory transition hover:border-champagne hover:bg-champagne/20 hover:text-champagne"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Contact
          </a>

          <Link
            to="/favorites"
            aria-label="Saved residences"
            className="relative flex items-center gap-2 text-[11px] tracking-luxury text-ivory/70 transition hover:text-champagne"
          >
            <Heart data-saved-target className="h-3.5 w-3.5" />
            Saved
            {hydrated && favCount > 0 && (
              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-champagne px-1 text-[9px] font-medium text-lux-black">
                {favCount}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-1.5 rounded-full border border-champagne/25 bg-champagne/5 px-2 py-1">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPalette(p.id)}
                aria-label={`Palette: ${p.label}`}
                title={p.label}
                className={`h-3.5 w-3.5 rounded-full transition-transform ${hydrated && palette === p.id ? "scale-110 ring-2 ring-offset-2 ring-offset-transparent" : "opacity-70 hover:opacity-100"}`}
                style={{
                  background: p.swatch,
                  boxShadow: hydrated && palette === p.id ? `0 0 0 1.5px ${p.swatch}` : "none",
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to light" : "Switch to dark"}
            className="grid h-8 w-8 place-items-center rounded-full border border-champagne/30 text-ivory/80 transition hover:border-champagne hover:text-champagne"
          >
            {hydrated && theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
          {userProfile && (
            <Link
              to="/account"
              className="flex items-center gap-2 rounded-full border border-champagne/30 bg-champagne/5 py-1 pr-3 pl-1 text-[11px] tracking-luxury text-ivory hover:border-champagne/60"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-champagne to-muted-gold font-display text-xs text-lux-black">
                {initials}
              </span>
              Account
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
