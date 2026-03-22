import { Flame } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            <span className="font-semibold">App CrossFit</span>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Contacto</a>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} App CrossFit. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
