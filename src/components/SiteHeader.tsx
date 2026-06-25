import { Link } from "@tanstack/react-router";
import { useOnboarding } from "@/context/OnboardingContext";

export function SiteHeader() {
  const { userProfile } = useOnboarding();
  const initials = userProfile?.name
    ? userProfile.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--glass-border)] bg-lux-black/60 backdrop-blur-2xl">
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
          <Link to="/" className="text-[11px] tracking-luxury text-ivory/70 hover:text-champagne">
            Residences
          </Link>
          <a href="#" className="text-[11px] tracking-luxury text-ivory/70 hover:text-champagne">
            Advisory
          </a>
          <a href="#" className="text-[11px] tracking-luxury text-ivory/70 hover:text-champagne">
            Contact
          </a>
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
