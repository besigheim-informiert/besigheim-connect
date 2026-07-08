import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Startseite", path: "/" },
  { label: "Vereine", path: "/vereine" },
  { label: "Veranstaltungen", path: "/veranstaltungen" },
  { label: "Mitmachen", path: "/mitmachen" },
  { label: "Netzwerk Quartier", path: "/netzwerk-quartier" },
  { label: "Barrierefrei", path: "/barrierefrei" },
  { label: "Über uns", path: "/ueber-uns" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-20 items-center justify-between">
          <Link to="/" className="flex items-baseline gap-2 group">
            <span className="font-serif-display text-2xl md:text-[26px] font-bold tracking-tight leading-none">
              Besigheim
            </span>
            <span className="font-serif-display italic text-2xl md:text-[26px] leading-none text-primary">
              informiert
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute left-3 right-3 -bottom-[1px] h-[2px] bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menü öffnen"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {menuOpen && (
          <nav className="md:hidden border-t border-foreground/10 bg-background pb-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`block px-6 py-3 text-sm font-medium border-b border-foreground/5 transition-colors ${
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-foreground/10 bg-background text-foreground mt-20">
        <div className="container py-14 grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="font-serif-display text-2xl mb-3">
              Besigheim <span className="italic text-primary">informiert</span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Die zentrale Informationsplattform für Vereine, Veranstaltungen und Engagement in Besigheim.
            </p>
          </div>
          <div>
            <h4 className="eyebrow text-primary mb-4">Seiten</h4>
            <ul className="space-y-2 text-sm">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="eyebrow text-primary mb-4">Rechtliches</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/impressum" className="text-muted-foreground hover:text-primary transition-colors">Impressum</Link></li>
              <li><Link to="/datenschutz" className="text-muted-foreground hover:text-primary transition-colors">Datenschutz</Link></li>
              <li><Link to="/kontakt" className="text-muted-foreground hover:text-primary transition-colors">Kontakt</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-foreground/10">
          <div className="container py-5 text-center text-xs text-muted-foreground">
            © 2026 Besigheim informiert. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
}
