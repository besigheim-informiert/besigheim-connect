import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Startseite", path: "/" },
  { label: "Vereine", path: "/vereine" },
  { label: "Veranstaltungen", path: "/veranstaltungen" },
  { label: "Mitmachen", path: "/mitmachen" },
  { label: "Über uns", path: "/ueber-uns" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary">
            Besigheim informiert
          </Link>
          <nav className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  location.pathname === item.path
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
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
          <nav className="md:hidden border-t border-border bg-background pb-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`block px-6 py-3 text-sm font-medium transition-colors hover:bg-accent ${
                  location.pathname === item.path
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-muted/50 py-10">
        <div className="container grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-bold text-foreground mb-2">Besigheim informiert</h3>
            <p className="text-sm text-muted-foreground">
              Die zentrale Informationsplattform für Vereine, Veranstaltungen und Engagement in Besigheim.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Seiten</h4>
            <ul className="space-y-1 text-sm">
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
            <h4 className="font-semibold text-foreground mb-2">Rechtliches</h4>
            <ul className="space-y-1 text-sm">
              <li><Link to="/impressum" className="text-muted-foreground hover:text-primary transition-colors">Impressum</Link></li>
              <li><Link to="/datenschutz" className="text-muted-foreground hover:text-primary transition-colors">Datenschutz</Link></li>
              <li><Link to="/kontakt" className="text-muted-foreground hover:text-primary transition-colors">Kontakt</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mt-8 pt-4 border-t border-border text-center text-xs text-muted-foreground">
          © 2026 Besigheim informiert. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
}
