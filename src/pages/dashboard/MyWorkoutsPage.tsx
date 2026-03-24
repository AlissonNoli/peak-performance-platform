import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Calendar,
  Eye,
  Dumbbell,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ─── Types ─── */
interface Workout {
  id: number;
  date: Date;
  title: string;
  coach: string;
  status: "done" | "scheduled" | "missed";
  duration?: string;
  type?: string;
}

/* ─── Mock data spanning multiple weeks ─── */
const generateWorkouts = (): Workout[] => {
  const today = new Date();
  const workouts: Workout[] = [];
  let id = 1;

  // Past 2 weeks + current week + next 2 weeks
  for (let dayOffset = -21; dayOffset <= 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    const dow = date.getDay(); // 0=Sun

    // Skip some Sundays
    if (dow === 0 && Math.random() > 0.3) continue;

    const isPast = dayOffset < 0;
    const isToday = dayOffset === 0;
    const isFuture = dayOffset > 0;

    const titles = [
      "Strength + Metcon",
      "Oly Lifting + Gymnastics",
      "Engine + Core",
      "Team WOD",
      "Potência Aeróbica",
      "Strength - Back Squat",
      "AMRAP 20'",
      "EMOM 15'",
    ];

    workouts.push({
      id: id++,
      date,
      title: titles[id % titles.length],
      coach: "Coach Ricardo",
      status: isPast
        ? Math.random() > 0.15
          ? "done"
          : "missed"
        : isToday
        ? "scheduled"
        : "scheduled",
      duration: isPast ? `${45 + Math.floor(Math.random() * 20)} min` : `~${50 + Math.floor(Math.random() * 15)} min`,
      type: ["For Time", "AMRAP", "EMOM", "Rounds"][id % 4],
    });
  }
  return workouts;
};

const allWorkouts = generateWorkouts();

const statusConfig = {
  done: {
    icon: CheckCircle2,
    label: "Concluído",
    badge: "bg-green-500/15 text-green-400 border-green-500/30",
    dot: "bg-green-500",
  },
  scheduled: {
    icon: Clock,
    label: "Agendado",
    badge: "bg-secondary/15 text-secondary border-secondary/30",
    dot: "bg-secondary",
  },
  missed: {
    icon: AlertCircle,
    label: "Em Falta",
    badge: "bg-destructive/15 text-destructive border-destructive/30",
    dot: "bg-destructive",
  },
};

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatWeekRange(start: Date): string {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.getDate()} ${monthLabels[start.getMonth()]} — ${end.getDate()} ${monthLabels[end.getMonth()]}`;
}

/* ─── WorkoutCard ─── */
const WorkoutCard = ({ workout, isToday }: { workout: Workout; isToday: boolean }) => {
  const cfg = statusConfig[workout.status];
  const Icon = cfg.icon;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        isToday
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      {/* Day */}
      <div className="w-14 shrink-0 text-center">
        <p className="text-[10px] uppercase text-muted-foreground tracking-wider">
          {dayLabels[workout.date.getDay()]}
        </p>
        <p className={`text-lg font-bold tabular-nums ${isToday ? "text-primary" : ""}`}>
          {workout.date.getDate()}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {monthLabels[workout.date.getMonth()]}
        </p>
      </div>

      {/* Dot */}
      <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{workout.title}</p>
        <p className="text-xs text-muted-foreground">{workout.coach}</p>
        {workout.duration && (
          <p className="text-xs text-muted-foreground mt-0.5">{workout.duration}</p>
        )}
      </div>

      {/* Status + Action */}
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className={`text-[10px] ${cfg.badge}`}>
          <Icon className="h-3 w-3 mr-0.5" />
          {cfg.label}
        </Badge>
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link to="/dashboard/workout">
            {workout.status === "scheduled" ? (
              <Play className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Link>
        </Button>
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
const MyWorkoutsPage = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [weekOffset, setWeekOffset] = useState(0);

  const currentWeekStart = useMemo(() => {
    const ws = getWeekStart(today);
    ws.setDate(ws.getDate() + weekOffset * 7);
    return ws;
  }, [weekOffset]);

  const currentWeekEnd = useMemo(() => {
    const end = new Date(currentWeekStart);
    end.setDate(currentWeekStart.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [currentWeekStart]);

  const weekWorkouts = useMemo(
    () =>
      allWorkouts
        .filter((w) => w.date >= currentWeekStart && w.date <= currentWeekEnd)
        .sort((a, b) => a.date.getTime() - b.date.getTime()),
    [currentWeekStart, currentWeekEnd]
  );

  const pastWorkouts = useMemo(
    () =>
      allWorkouts
        .filter((w) => w.date < getWeekStart(today))
        .sort((a, b) => b.date.getTime() - a.date.getTime()),
    []
  );

  const futureWorkouts = useMemo(
    () => {
      const nextWeekStart = new Date(getWeekStart(today));
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);
      return allWorkouts
        .filter((w) => w.date >= nextWeekStart)
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    },
    []
  );

  const isThisWeek = weekOffset === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          Meus Treinos
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Veja todos os seus treinos — passados, de hoje e futuros.
        </p>
      </div>

      <Tabs defaultValue="week" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="past">Anteriores</TabsTrigger>
          <TabsTrigger value="week">Esta Semana</TabsTrigger>
          <TabsTrigger value="future">Próximos</TabsTrigger>
        </TabsList>

        {/* ── This Week ── */}
        <TabsContent value="week">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-secondary" />
                {isThisWeek ? "Semana Atual" : "Semana"}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekOffset((o) => o - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground font-medium px-2 min-w-[120px] text-center">
                  {formatWeekRange(currentWeekStart)}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekOffset((o) => o + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                {!isThisWeek && (
                  <Button variant="outline" size="sm" className="text-xs ml-2" onClick={() => setWeekOffset(0)}>
                    Hoje
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {weekWorkouts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Nenhum treino nesta semana.
                </p>
              ) : (
                weekWorkouts.map((w) => (
                  <WorkoutCard key={w.id} workout={w} isToday={isSameDay(w.date, today)} />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Past ── */}
        <TabsContent value="past">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Treinos Anteriores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pastWorkouts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Sem treinos anteriores.
                </p>
              ) : (
                pastWorkouts.map((w) => (
                  <WorkoutCard key={w.id} workout={w} isToday={false} />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Future ── */}
        <TabsContent value="future">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Próximos Treinos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {futureWorkouts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Sem treinos futuros agendados.
                </p>
              ) : (
                futureWorkouts.map((w) => (
                  <WorkoutCard key={w.id} workout={w} isToday={false} />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyWorkoutsPage;
