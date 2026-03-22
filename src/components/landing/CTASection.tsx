import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24 border-t border-border/50">
      <div className="container">
        <ScrollReveal>
          <div className="rounded-2xl hero-gradient p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Pronto para Transformar Seus Treinos?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Junte-se a centenas de coaches e atletas que já estão alcançando resultados extraordinários.
            </p>
            <Link to="/auth/register">
              <Button variant="hero" size="lg" className="text-base px-10 animate-pulse-glow">
                Comece Agora!
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
