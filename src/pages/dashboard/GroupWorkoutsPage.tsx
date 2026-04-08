import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Copy, Inbox, Users, Dumbbell,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const GroupWorkoutsPage = () => {
  const { role } = useAuth();
  const store = useStore();
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState(store.groups[0]?.id ?? "");
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const weekStart = addDays(startOfWeek(today, { weekStartsOn: 1 }), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const groupWorkouts = useMemo(() => {
    if (!selectedGroup) return [];
    return store.getWorkoutsForGroup(selectedGroup);
  }, [selectedGroup, store.workouts]);

  if (role === "atleta") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Users className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground text-sm">Disponível apenas para coaches.</p>
      </div>
    );
  }


  const getWorkoutsForDay = (day: Date) => {
    return groupWorkouts.filter((w) => {
      try {
        return isSameDay(parseISO(w.date), day);
      } catch {
        return false;
      }
    });
  };

  const handleDuplicate = (workoutId: string) => {
    const workout = store.workouts.find((w) => w.id === workoutId);
    if (!workout) return;
    navigate(`/dashboard/builder?template=${workout.id}`);
  };

  const handleEdit = (workoutId: string) => {
    navigate(`/dashboard/builder?edit=${workoutId}`);
  };

  const handleCreateForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    navigate(`/dashboard/builder?date=${dateStr}&group=${selectedGroup}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Treinos por Grupo
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Programe e visualize os treinos de cada grupo por semana.</p>
        </div>
        <Button className="gap-1" onClick={() => navigate("/dashboard/builder")}>
          <Plus className="h-4 w-4" /> Criar Treino
        </Button>
      </div>

      {/* Group selector + Week navigation */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="sm:w-64">
            <SelectValue placeholder="Selecione um grupo" />
          </SelectTrigger>
          <SelectContent>
            {store.groups.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                <span className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" /> {g.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((w) => w - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((w) => w + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground ml-2">
            {format(weekDays[0], "dd MMM", { locale: pt })} — {format(weekDays[6], "dd MMM yyyy", { locale: pt })}
          </span>
        </div>
      </div>

      {!selectedGroup ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Inbox className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Selecione um grupo para ver os treinos.</p>
        </div>
      ) : (
        /* Week grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {weekDays.map((day, i) => {
            const dayWorkouts = getWorkoutsForDay(day);
            const isToday = isSameDay(day, today);

            return (
              <Card key={i} className={`min-h-[180px] ${isToday ? "border-primary/50 ring-1 ring-primary/20" : ""}`}>
                <CardHeader className="p-3 pb-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{WEEKDAYS[i]}</p>
                      <p className={`text-sm font-bold ${isToday ? "text-primary" : ""}`}>
                        {format(day, "dd/MM")}
                      </p>
                    </div>
                    {isToday && <Badge className="text-[9px] bg-primary/20 text-primary">Hoje</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  {dayWorkouts.length === 0 ? (
                    <button
                      onClick={() => handleCreateForDay(day)}
                      className="w-full border border-dashed border-border rounded-lg p-3 flex flex-col items-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-[10px]">Adicionar</span>
                    </button>
                  ) : (
                    dayWorkouts.map((w) => (
                      <div key={w.id} className="bg-muted/30 rounded-lg p-2 space-y-1">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate flex items-center gap-1">
                              <Dumbbell className="h-3 w-3 text-primary shrink-0" />
                              {w.title || "Sem título"}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{w.blocks.length} bloco{w.blocks.length !== 1 ? "s" : ""}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(w.id)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDuplicate(w.id)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Apagar treino?</AlertDialogTitle>
                                <AlertDialogDescription>O treino "{w.title}" será removido permanentemente.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => { store.deleteWorkout(w.id); toast.success("Treino apagado!"); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Apagar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupWorkoutsPage;
