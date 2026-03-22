import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Trophy, Timer, Users } from "lucide-react";

const stats = [
  { label: "Treinos Esta Semana", value: "4", icon: Dumbbell },
  { label: "PRs Este Mês", value: "3", icon: Trophy },
  { label: "Tempo Total", value: "6h 42m", icon: Timer },
  { label: "Atletas Ativos", value: "28", icon: Users },
];

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bem-vindo de volta!</h1>
        <p className="text-muted-foreground text-sm mt-1">Aqui está o resumo da sua atividade.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Treino de Hoje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm">WOD "Fran"</span>
            <Badge variant="secondary">AMRAP</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm">21-15-9 Thrusters & Pull-ups</span>
            <Badge>For Time</Badge>
          </div>
          <p className="text-xs text-muted-foreground pt-2">Peso sugerido baseado nos seus PRs recentes.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
