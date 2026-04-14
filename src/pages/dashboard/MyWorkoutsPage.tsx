import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle,
  Play, Calendar, Eye, Dumbbell, Inbox, User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { Workout } from "@/lib/api/types";

/* ─── Status config ─── */
const statusConfig = {
  done: { icon: CheckCircle2, label: "Concluído", badge: "bg-green-500/15 text-green-400 border-green-500/30", dot: "bg-green-500" },
  scheduled: { icon: Clock, label: "Agendado", badge: "bg-secondary/15 text-secondary border-secondary/30", dot: "bg-secondary" },
  missed: { icon: AlertCircle, label: "Em Falta", badge: "bg-destructive/15 text-destructive border-destructive/30", dot: "bg-destructive" },
};

const creatorConfig = {
  coach: { label: "Coach", color: "bg-primary/15 text-primary border-primary/30", borderColor: "border-l-primary" },
  athlete: { label: "Meu", color: "bg-blue-500/15 text-blue-400 border-blue-500/30", borderColor: "border-l-blue-500" },
};

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
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

/* ─── Hooks (stub — ligar à API real) ─── */
function useWorkouts() {
  const [workouts] = useState<Workout[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  return { workouts, loading, error };
}

/* ─── Empty State ─── */
const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-3">
    <Inbox className="h-10 w-10 text-muted-foreground/50" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

/* ─── Loading skeleton ─── */
const WorkoutSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
        <Skeleton className="w-14 h-14 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

/* ─── Creator Legend ─── */
const CreatorLegend = () => (
  <div className="flex items-center gap-4 mb-3">
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
      <span className="text-[10px] text-muted-foreground">Coach</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
      <span className="text-[10px] text-muted-foreground">Meu treino</span>
    </div>
  </div>
);

/* ─── Workout Card ─── */
const WorkoutCard = ({ workout, isToday }: { workout: Workout; isToday: boolean }) => {
  const status = workout.status ?? "scheduled";
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  const date = new Date(workout.date);
  const createdBy = workout.createdBy ?? "coach";
  const creator = creatorConfig[createdBy];
  const hasWorkout = status !== "missed";

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors border-l-2 ${creator.borderColor} ${
      isToday ? "border-primary/40 bg-primary/5" : hasWorkout ? "border-border bg-card" : "border-border bg-muted/30"
    }`}>
      <div className={`w-14 shrink-0 text-center ${hasWorkout ? "" : "opacity-50"}`}>
        <p className="text-[10px] uppercase text-muted-foreground tracking-wider">{dayLabels[date.getDay()]}</p>
        <p className={`text-lg font-bold tabular-nums ${isToday ? "text-primary" : ""}`}>{date.getDate()}</p>
        <p className="text-[10px] text-muted-foreground">{monthLabels[date.getMonth()]}</p>
      </div>
      <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{workout.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {workout.coach_name && <p className="text-xs text-muted-foreground">{workout.coach_name}</p>}
          {workout.duration && <p className="text-xs text-muted-foreground">{workout.duration}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {/* Creator badge */}
        <Badge variant="outline" className={`text-[10px] ${creator.color}`}>
          {createdBy === "coach" ? <Dumbbell className="h-3 w-3 mr-0.5" /> : <User className="h-3 w-3 mr-0.5" />}
          {creator.label}
        </Badge>
        {/* Status badge */}
        <Badge variant="outline" className={`text-[10px] ${cfg.badge}`}>
          <Icon className="h-3 w-3 mr-0.5" />
          {cfg.label}
        </Badge>
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link to={`/dashboard/workout`}>
            {status === "scheduled" ? <Play className="h-3.5 w-3.5 text-primary" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
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
  const { role } = useAuth();
  const { workouts, loading, error } = useWorkouts();
  const [weekOffset, setWeekOffset] = useState(0);

  const currentWeekStart = (() => {
    const ws = getWeekStart(today);
    ws.setDate(ws.getDate() + weekOffset * 7);
    return ws;
  })();

  const currentWeekEnd = (() => {
    const end = new Date(currentWeekStart);
    end.setDate(currentWeekStart.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  })();

  const weekWorkouts = workouts
    .filter((w) => { const d = new Date(w.date); return d >= currentWeekStart && d <= currentWeekEnd; })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastWorkouts = workouts
    .filter((w) => new Date(w.date) < getWeekStart(today))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const futureWorkouts = (() => {
    const nextWeek = new Date(getWeekStart(today));
    nextWeek.setDate(nextWeek.getDate() + 7);
    return workouts
      .filter((w) => new Date(w.date) >= nextWeek)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  })();

  const isThisWeek = weekOffset === 0;
  const pageTitle = role === "coach" ? "Treinos Prescritos" : "Meus Treinos";
  const pageDesc = role === "coach"
    ? "Treinos que prescreveu aos seus atletas."
    : "Treinos prescritos pelo seu coach — passados, de hoje e futuros.";
  const emptyMsg = role === "coach" ? "Ainda não há treinos prescritos." : "Ainda não há treinos.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            {pageTitle}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{pageDesc}</p>
        </div>
        {role === "coach" && (
          <Button asChild>
            <Link to="/dashboard/builder">Criar Treino</Link>
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Erro ao carregar treinos: {error}
        </div>
      )}

      <Tabs defaultValue="week" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="past">Anteriores</TabsTrigger>
          <TabsTrigger value="week">Esta Semana</TabsTrigger>
          <TabsTrigger value="future">Próximos</TabsTrigger>
        </TabsList>

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
                  <Button variant="outline" size="sm" className="text-xs ml-2" onClick={() => setWeekOffset(0)}>Hoje</Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CreatorLegend />
              {loading ? <WorkoutSkeleton /> : weekWorkouts.length === 0 ? <EmptyState message={emptyMsg} /> : (
                <div className="space-y-2">
                  {weekWorkouts.map((w) => <WorkoutCard key={w.id} workout={w} isToday={isSameDay(new Date(w.date), today)} />)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Treinos Anteriores</CardTitle></CardHeader>
            <CardContent>
              <CreatorLegend />
              {loading ? <WorkoutSkeleton /> : pastWorkouts.length === 0 ? <EmptyState message="Sem treinos anteriores." /> : (
                <div className="space-y-2">{pastWorkouts.map((w) => <WorkoutCard key={w.id} workout={w} isToday={false} />)}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="future">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Próximos Treinos</CardTitle></CardHeader>
            <CardContent>
              <CreatorLegend />
              {loading ? <WorkoutSkeleton /> : futureWorkouts.length === 0 ? <EmptyState message="Sem treinos futuros agendados." /> : (
                <div className="space-y-2">{futureWorkouts.map((w) => <WorkoutCard key={w.id} workout={w} isToday={false} />)}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyWorkoutsPage;
