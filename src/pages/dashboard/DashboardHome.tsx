import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Dumbbell,
  Trophy,
  Timer,
  TrendingUp,
  Play,
  ChevronRight,
  Bell,
  Calendar,
  User,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const todayWorkout = {
  title: "Strength + Metcon "DT"",
  date: "Hoje — 22 Mar 2026",
  coach: "Coach Ricardo",
  exercises: 5,
  estimatedTime: "~55 min",
  type: "For Time",
};

const recentPRs = [
  { movement: "Back Squat", value: "120 kg", date: "18 Mar", trend: "+5 kg" },
  { movement: "Snatch", value: "80 kg", date: "15 Mar", trend: "+2.5 kg" },
  { movement: "Clean & Jerk", value: "105 kg", date: "12 Mar", trend: "+5 kg" },
  { movement: "Deadlift", value: "170 kg", date: "10 Mar", trend: "+10 kg" },
];

const weeklyData = [
  { day: "Seg", treinos: 1, volume: 4200 },
  { day: "Ter", treinos: 1, volume: 3800 },
  { day: "Qua", treinos: 0, volume: 0 },
  { day: "Qui", treinos: 1, volume: 5100 },
  { day: "Sex", treinos: 1, volume: 4600 },
  { day: "Sáb", treinos: 1, volume: 3200 },
  { day: "Dom", treinos: 0, volume: 0 },
];

const notifications = [
  {
    id: 1,
    type: "workout" as const,
    message: "Novo treino disponível para hoje",
    time: "Há 2h",
  },
  {
    id: 2,
    type: "pr" as const,
    message: "PR de Back Squat atualizado: 120 kg!",
    time: "Há 1 dia",
  },
  {
    id: 3,
    type: "coach" as const,
    message: "Coach Ricardo comentou no seu treino",
    time: "Há 2 dias",
  },
];

const notifIcon = {
  workout: Dumbbell,
  pr: Trophy,
  coach: User,
};

const notifColor = {
  workout: "text-primary",
  pr: "text-secondary",
  coach: "text-muted-foreground",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">Volume: {payload[0].value.toLocaleString()} kg</p>
    </div>
  );
};

const DashboardHome = () => {
  const totalWeekly = weeklyData.reduce((a, d) => a + d.treinos, 0);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bem-vindo de volta!</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Aqui está o resumo da sua atividade.
        </p>
      </div>

      {/* Workout of the Day — hero card */}
      <ScrollReveal>
        <Card className="relative overflow-hidden border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent pointer-events-none" />
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {todayWorkout.date}
              <span className="mx-1">·</span>
              {todayWorkout.coach}
            </div>
            <CardTitle className="text-xl mt-1">{todayWorkout.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <Badge variant="secondary">{todayWorkout.type}</Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Dumbbell className="h-3.5 w-3.5" />
                {todayWorkout.exercises} exercícios
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" />
                {todayWorkout.estimatedTime}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/dashboard/workout">
                  <Play className="h-4 w-4 mr-1" />
                  Iniciar Treino
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/dashboard/workout">
                  Ver Detalhes
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* PRs + Progress grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent PRs */}
        <ScrollReveal className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-secondary" />
                PRs Recentes
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" asChild>
                <Link to="/dashboard/prs">
                  Ver Todos <ChevronRight className="h-3 w-3 ml-0.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-1">
              {recentPRs.map((pr) => (
                <div
                  key={pr.movement}
                  className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{pr.movement}</p>
                    <p className="text-xs text-muted-foreground">{pr.date}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-sm font-semibold tabular-nums">
                      {pr.value}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-green-600/30 text-green-400"
                    >
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                      {pr.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Weekly Progress chart */}
        <ScrollReveal className="lg:col-span-2" delay={80}>
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Progresso Semanal
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalWeekly} treinos esta semana
              </p>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyData}
                    margin={{ top: 4, right: 0, left: -24, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(0 0% 69%)" }}
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar
                      dataKey="volume"
                      fill="hsl(16 100% 50%)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Meta semanal</span>
                  <span className="tabular-nums">{totalWeekly}/5 treinos</span>
                </div>
                <Progress value={(totalWeekly / 5) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>

      {/* Notifications */}
      <ScrollReveal delay={120}>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {notifications.map((n) => {
              const Icon = notifIcon[n.type];
              return (
                <div
                  key={n.id}
                  className="flex items-start gap-3 py-2.5 border-b border-border last:border-0"
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent ${notifColor[n.type]}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {n.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
};

export default DashboardHome;
