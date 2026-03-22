import { Flame, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Flame className="h-7 w-7 text-primary" />
          <span className="text-lg font-bold tracking-tight">App CrossFit</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
          <a href="#audience" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Para Quem</a>
          <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Depoimentos</a>
          <Link to="/auth/login">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <Link to="/auth/register">
            <Button variant="hero" size="sm">Começar Grátis</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3 animate-fade-in">
          <a href="#features" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Funcionalidades</a>
          <a href="#audience" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Para Quem</a>
          <a href="#testimonials" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Depoimentos</a>
          <Link to="/auth/login" className="block"><Button variant="ghost" className="w-full">Entrar</Button></Link>
          <Link to="/auth/register" className="block"><Button variant="hero" className="w-full">Começar Grátis</Button></Link>
        </div>
      )}
    </nav>
  );
}
