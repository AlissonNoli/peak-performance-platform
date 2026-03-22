import { ScrollReveal } from "@/components/ScrollReveal";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Desde que passei a usar o App CrossFit, economizo 2 horas por dia na preparação dos treinos. Meus atletas estão mais engajados do que nunca.",
    name: "Mariana Rocha",
    role: "Head Coach, CrossFit Fênix",
  },
  {
    quote: "Acompanhar meus PRs ficou muito mais fácil. O timer integrado é perfeito — nunca mais precisei de outro app durante o WOD.",
    name: "Rafael Duarte",
    role: "Atleta Competidor",
  },
  {
    quote: "A gestão de turmas simplificou tudo. Consigo atribuir treinos diferentes para cada grupo com poucos cliques.",
    name: "Camila Andrade",
    role: "Coach, Box Resistência",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 border-t border-border/50 bg-muted/30">
      <div className="container">
        <ScrollReveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary text-center mb-3">Depoimentos</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-balance mb-16">
            Quem usa, recomenda
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <ScrollReveal key={i} delay={i * 100} direction="up">
              <div className="rounded-xl border border-border bg-card p-6 flex flex-col h-full">
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                <p className="text-muted-foreground text-sm leading-relaxed flex-1 italic">"{t.quote}"</p>
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
