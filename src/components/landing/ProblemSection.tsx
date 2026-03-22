import { AlertTriangle, Puzzle, Clock } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

const problems = [
  { icon: AlertTriangle, title: "Cálculos Manuais", desc: "Perder tempo calculando percentagens e PRs manualmente, introduzindo erros." },
  { icon: Puzzle, title: "Ferramentas Fragmentadas", desc: "Usar múltiplas apps para timer, programação, registo de treinos e comunicação." },
  { icon: Clock, title: "Falta de Eficiência", desc: "Coaches gastam horas a preparar treinos sem uma ferramenta centralizada." },
];

export function ProblemSection() {
  return (
    <section className="py-24 border-t border-border/50">
      <div className="container">
        <ScrollReveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary text-center mb-3">O Problema</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-balance mb-16">
            Você ainda lida com isso?
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((p, i) => (
            <ScrollReveal key={i} delay={i * 100} direction="up">
              <div className="rounded-xl border border-border bg-card p-8 hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <p.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
