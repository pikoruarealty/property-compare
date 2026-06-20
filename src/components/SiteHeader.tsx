import { Link } from "@tanstack/react-router";

export function SiteHeader() {
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
        </nav>
      </div>
    </header>
  );
}
