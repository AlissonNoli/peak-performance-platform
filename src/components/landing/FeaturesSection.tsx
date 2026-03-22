import { Trophy, Users, Timer, Video } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

const features = [
  { icon: Trophy, title: "Cálculo Automático de PRs", desc: "Registe pesos e repetições — os seus Personal Records são calculados e atualizados automaticamente." },
  { icon: Users, title: "Gestão de Grupos", desc: "Crie turmas, atribua treinos e acompanhe o progresso de cada atleta em tempo real." },
  { icon: Timer, title: "Timer Versátil", desc: "AMRAP, EMOM, For Time e Tabata — todos os formatos de timer que um WOD precisa." },
  { icon: Video, title: "Exemplos em Vídeo/Foto", desc: "Adicione demonstrações visuais aos movimentos para garantir execução correta." },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 border-t border-border/50 bg-muted/30">
      <div className="container">
        <ScrollReveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary text-center mb-3">Nossa Solução</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-balance mb-16">
            Tudo o que você precisa, numa só plataforma
          </h2>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <ScrollReveal key={i} delay={i * 80} direction="up">
              <div className="group rounded-xl border border-border bg-card p-6 hover:border-secondary/40 transition-all hover:shadow-lg hover:shadow-secondary/5">
                <div className="w-11 h-11 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
