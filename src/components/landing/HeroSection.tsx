import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-crossfit.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={heroImg} alt="Atletas treinando CrossFit" className="w-full h-full object-cover" />
        <div className="absolute inset-0 hero-gradient opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="container relative z-10 py-20 md:py-32">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary animate-fade-up" style={{ animationDelay: "100ms" }}>
            Plataforma para Coaches & Atletas
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] text-balance animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            Otimize Seus Treinos, Maximize Seus{" "}
            <span className="text-gradient">Resultados</span>.
          </h1>
          <p
            className="text-lg text-muted-foreground max-w-xl animate-fade-up"
            style={{ animationDelay: "350ms" }}
          >
            A plataforma completa para Coaches e Atletas de CrossFit. Cálculos de PRs automáticos, treinos personalizados e timers inteligentes, tudo em um só lugar.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 pt-2 animate-fade-up"
            style={{ animationDelay: "500ms" }}
          >
            <Link to="/auth/register">
              <Button variant="hero" size="lg" className="text-base px-8">
                Experimente Grátis (Coaches)
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button variant="hero-outline" size="lg" className="text-base px-8">
                Comece a Treinar (Atletas)
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
