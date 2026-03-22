import { ClipboardList, Dumbbell, BarChart3, Zap, MessageSquare, TrendingUp } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

const coachBenefits = [
  { icon: ClipboardList, text: "Programe WODs para múltiplas turmas" },
  { icon: BarChart3, text: "Visualize o progresso de cada atleta" },
  { icon: MessageSquare, text: "Comunique-se com os atletas facilmente" },
];

const athleteBenefits = [
  { icon: Dumbbell, text: "Acesse seus treinos a qualquer hora" },
  { icon: TrendingUp, text: "Acompanhe a evolução dos seus PRs" },
  { icon: Zap, text: "Use timers integrados durante o WOD" },
];

export function AudienceSection() {
  return (
    <section id="audience" className="py-24 border-t border-border/50">
      <div className="container">
        <ScrollReveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary text-center mb-3">Para Quem É</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-balance mb-16">
            Feito para quem vive o CrossFit
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8">
          <ScrollReveal direction="left">
            <div className="rounded-xl border border-primary/30 bg-card p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <ClipboardList className="h-4 w-4 text-primary" />
                </span>
                Para Coaches
              </h3>
              <ul className="space-y-4">
                {coachBenefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <b.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{b.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right">
            <div className="rounded-xl border border-secondary/30 bg-card p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Dumbbell className="h-4 w-4 text-secondary" />
                </span>
                Para Atletas
              </h3>
              <ul className="space-y-4">
                {athleteBenefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <b.icon className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{b.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
