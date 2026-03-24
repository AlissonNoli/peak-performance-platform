import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
} from "lucide-react";
import { Link } from "react-router-dom";

interface WeekWorkout {
  id: number;
  date: string;
  dayLabel: string;
  title: string;
  status: "done" | "scheduled" | "missed";
  duration?: string;
}

const workouts: WeekWorkout[] = [
  {
    id: 1,
    date: "17 Mar",
    dayLabel: "Seg",
    title: "Strength + Metcon "DT"",
    status: "done",
    duration: "52 min",
  },
  {
    id: 2,
    date: "18 Mar",
    dayLabel: "Ter",
    title: "Oly Lifting + Gymnastics",
    status: "done",
    duration: "48 min",
  },
  {
    id: 3,
    date: "19 Mar",
    dayLabel: "Qua",
    title: "Rest Day",
    status: "done",
  },
  {
    id: 4,
    date: "20 Mar",
    dayLabel: "Qui",
    title: "Engine + Core",
    status: "done",
    duration: "55 min",
  },
  {
    id: 5,
    date: "21 Mar",
    dayLabel: "Sex",
    title: "Strength, Pot Aeróbica",
    status: "scheduled",
    duration: "~60 min",
  },
  {
    id: 6,
    date: "22 Mar",
    dayLabel: "Sáb",
    title: "Team WOD",
    status: "scheduled",
    duration: "~45 min",
  },
  {
    id: 7,
    date: "23 Mar",
    dayLabel: "Dom",
    title: "Active Recovery",
    status: "missed",
  },
];

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

const WeeklyWorkouts = () => {
  return (
    <ScrollReveal delay={160}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-secondary" />
            Meus Treinos da Semana
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground font-medium px-1">
              17–23 Mar
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {workouts.map((w) => {
            const cfg = statusConfig[w.status];
            const Icon = cfg.icon;
            return (
              <div
                key={w.id}
                className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
              >
                {/* Day column */}
                <div className="w-12 shrink-0 text-center">
                  <p className="text-xs text-muted-foreground">{w.dayLabel}</p>
                  <p className="text-sm font-semibold">{w.date.split(" ")[0]}</p>
                </div>

                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{w.title}</p>
                  {w.duration && (
                    <p className="text-xs text-muted-foreground">{w.duration}</p>
                  )}
                </div>

                {/* Status badge */}
                <Badge
                  variant="outline"
                  className={`text-[10px] shrink-0 ${cfg.badge}`}
                >
                  <Icon className="h-3 w-3 mr-0.5" />
                  {cfg.label}
                </Badge>

                {/* Action for scheduled */}
                {w.status === "scheduled" && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" asChild>
                    <Link to="/dashboard/workout">
                      <Play className="h-3.5 w-3.5 text-primary" />
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </ScrollReveal>
  );
};

export default WeeklyWorkouts;
