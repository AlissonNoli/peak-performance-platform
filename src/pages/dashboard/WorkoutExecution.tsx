import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  X,
  Play,
  Pause,
  SkipForward,
  Check,
  ChevronRight,
  Timer,
  Dumbbell,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/* ─── Mock Data ────────────────────────────────────── */

interface ExerciseSet {
  reps: number;
  loadKg: number;
  percentPR: number;
  prKg: number;
  completed: boolean;
}

interface Exercise {
  id: number;
  name: string;
  videoUrl: string;
  thumbnailText: string;
  sets: ExerciseSet[];
  restSeconds: number;
}

const exercises: Exercise[] = [
  {
    id: 1,
    name: "Back Squat",
    videoUrl: "https://www.youtube.com/embed/ultWZbUMPL8",
    thumbnailText: "Demonstração Back Squat",
    sets: [
      { reps: 5, loadKg: 85, percentPR: 75, prKg: 113, completed: false },
      { reps: 5, loadKg: 90, percentPR: 80, prKg: 113, completed: false },
      { reps: 3, loadKg: 102, percentPR: 90, prKg: 113, completed: false },
    ],
    restSeconds: 120,
  },
  {
    id: 2,
    name: "Strict Press",
    videoUrl: "https://www.youtube.com/embed/2yjwXTZQDDI",
    thumbnailText: "Demonstração Strict Press",
    sets: [
      { reps: 5, loadKg: 45, percentPR: 70, prKg: 64, completed: false },
      { reps: 5, loadKg: 48, percentPR: 75, prKg: 64, completed: false },
      { reps: 5, loadKg: 51, percentPR: 80, prKg: 64, completed: false },
    ],
    restSeconds: 90,
  },
  {
    id: 3,
    name: "Deadlift",
    videoUrl: "https://www.youtube.com/embed/op9kVnSso6Q",
    thumbnailText: "Demonstração Deadlift",
    sets: [
      { reps: 5, loadKg: 120, percentPR: 70, prKg: 170, completed: false },
      { reps: 3, loadKg: 136, percentPR: 80, prKg: 170, completed: false },
      { reps: 1, loadKg: 153, percentPR: 90, prKg: 170, completed: false },
    ],
    restSeconds: 180,
  },
  {
    id: 4,
    name: 'Metcon "DT"',
    videoUrl: "",
    thumbnailText: "5 rounds: 12 DL, 9 HPC, 6 S2OH",
    sets: [
      { reps: 1, loadKg: 70, percentPR: 0, prKg: 0, completed: false },
    ],
    restSeconds: 0,
  },
];

/* ─── Rest Timer Hook ──────────────────────────────── */

function useRestTimer(initialSeconds: number, onComplete: () => void) {
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const start = useCallback(() => {
    setRemaining(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds]);

  const skip = useCallback(() => {
    setIsRunning(false);
    setRemaining(0);
    onCompleteRef.current();
  }, []);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onCompleteRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const progress = initialSeconds > 0 ? ((initialSeconds - remaining) / initialSeconds) * 100 : 0;

  return { remaining, isRunning, progress, start, skip, pause, resume };
}

/* ─── Format time ──────────────────────────────────── */

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ─── Component ────────────────────────────────────── */

const WorkoutExecution = () => {
  const [exIdx, setExIdx] = useState(0);
  const [workoutData, setWorkoutData] = useState(() =>
    exercises.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) }))
  );
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  const [showRest, setShowRest] = useState(false);
  const [finished, setFinished] = useState(false);

  const exercise = workoutData[exIdx];
  const totalSets = workoutData.reduce((a, e) => a + e.sets.length, 0);
  const completedSets = workoutData.reduce(
    (a, e) => a + e.sets.filter((s) => s.completed).length,
    0
  );
  const overallProgress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  const advanceAfterRest = useCallback(() => {
    setShowRest(false);
    // move to next set or exercise
    if (currentSetIdx + 1 < exercise.sets.length) {
      setCurrentSetIdx((i) => i + 1);
    } else if (exIdx + 1 < workoutData.length) {
      setExIdx((i) => i + 1);
      setCurrentSetIdx(0);
    } else {
      setFinished(true);
    }
  }, [currentSetIdx, exIdx, exercise, workoutData]);

  const timer = useRestTimer(exercise.restSeconds, advanceAfterRest);

  const registerSet = () => {
    setWorkoutData((prev) => {
      const copy = prev.map((e) => ({
        ...e,
        sets: e.sets.map((s) => ({ ...s })),
      }));
      copy[exIdx].sets[currentSetIdx].completed = true;
      return copy;
    });

    // if rest is configured, start rest timer
    if (exercise.restSeconds > 0) {
      setShowRest(true);
      timer.start();
    } else {
      advanceAfterRest();
    }
  };

  const skipExercise = () => {
    if (exIdx + 1 < workoutData.length) {
      setExIdx((i) => i + 1);
      setCurrentSetIdx(0);
      setShowRest(false);
    } else {
      setFinished(true);
    }
  };

  const peekNext = () => {
    if (currentSetIdx + 1 < exercise.sets.length) {
      return `Próximo: ${exercise.name} — Set ${currentSetIdx + 2}`;
    }
    if (exIdx + 1 < workoutData.length) {
      return `Próximo: ${workoutData[exIdx + 1].name}`;
    }
    return "Último exercício!";
  };

  /* ─── Finished screen ─── */
  if (finished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center border-primary/20">
          <CardContent className="pt-10 pb-8 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Treino Completo!</h1>
            <p className="text-muted-foreground text-sm">
              Parabéns! Você completou {completedSets} sets hoje.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/dashboard">Voltar ao Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSet = exercise.sets[currentSetIdx];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Dumbbell className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold text-sm truncate">
            Strength + Metcon "DT"
          </span>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard" className="flex items-center gap-1 text-muted-foreground">
            <X className="h-4 w-4" /> Sair
          </Link>
        </Button>
      </header>

      {/* Top progress */}
      <div className="px-4 sm:px-6 pt-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>
            Exercício {exIdx + 1} de {workoutData.length}
          </span>
          <span className="tabular-nums">{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-1.5" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 max-w-xl mx-auto w-full">
        {/* ─── REST OVERLAY ─── */}
        {showRest && (
          <Card className="w-full border-secondary/30 mb-6">
            <CardContent className="pt-8 pb-6 flex flex-col items-center text-center space-y-4">
              <Timer className="h-8 w-8 text-secondary" />
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Descanso
              </p>
              <p className="text-5xl font-bold tabular-nums tracking-tight text-secondary">
                {fmt(timer.remaining)}
              </p>
              <Progress
                value={timer.progress}
                className="h-1.5 w-full max-w-xs [&>div]:bg-secondary"
              />
              <div className="flex gap-3 pt-2">
                {timer.isRunning ? (
                  <Button variant="outline" size="sm" onClick={timer.pause}>
                    <Pause className="h-4 w-4 mr-1" /> Pausar
                  </Button>
                ) : (
                  timer.remaining > 0 && (
                    <Button variant="outline" size="sm" onClick={timer.resume}>
                      <Play className="h-4 w-4 mr-1" /> Retomar
                    </Button>
                  )
                )}
                <Button variant="ghost" size="sm" onClick={timer.skip}>
                  <SkipForward className="h-4 w-4 mr-1" /> Pular Descanso
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── EXERCISE CARD ─── */}
        {!showRest && (
          <Card className="w-full border-border">
            <CardContent className="pt-6 pb-6 space-y-6">
              {/* Exercise name */}
              <div className="text-center space-y-1">
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                  {exercise.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Set {currentSetIdx + 1} de {exercise.sets.length}:{" "}
                  <span className="font-medium text-foreground">
                    {currentSet.reps} Rep{currentSet.reps > 1 ? "s" : ""}
                  </span>
                </p>
              </div>

              {/* Load callout */}
              {currentSet.percentPR > 0 && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                  <p className="text-3xl font-extrabold text-primary tabular-nums">
                    {currentSet.loadKg} kg
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentSet.percentPR}% do seu PR de {currentSet.prKg} kg
                  </p>
                </div>
              )}

              {/* Video reference */}
              {exercise.videoUrl ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="w-full rounded-lg bg-accent hover:bg-accent/80 transition-colors p-3 flex items-center gap-3 text-left active:scale-[0.98]">
                      <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center shrink-0">
                        <Video className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {exercise.thumbnailText}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Toque para ver o vídeo
                        </p>
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg p-0 overflow-hidden">
                    <DialogHeader className="p-4 pb-0">
                      <DialogTitle>{exercise.name}</DialogTitle>
                    </DialogHeader>
                    <div className="aspect-video">
                      <iframe
                        src={exercise.videoUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={exercise.name}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="rounded-lg bg-accent p-3">
                  <p className="text-sm text-center text-muted-foreground">
                    {exercise.thumbnailText}
                  </p>
                </div>
              )}

              {/* Set dots */}
              <div className="flex items-center justify-center gap-2">
                {exercise.sets.map((s, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      s.completed
                        ? "bg-primary"
                        : i === currentSetIdx
                        ? "bg-secondary ring-2 ring-secondary/40"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={registerSet}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Registar Set
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={skipExercise}
                  >
                    <SkipForward className="h-4 w-4 mr-1" /> Pular
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-muted-foreground"
                    disabled
                  >
                    <ChevronRight className="h-4 w-4 mr-1" /> {peekNext()}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercise nav pills */}
        <div className="flex gap-1.5 mt-6 overflow-x-auto pb-2 max-w-full">
          {workoutData.map((e, i) => {
            const allDone = e.sets.every((s) => s.completed);
            return (
              <Badge
                key={e.id}
                variant={i === exIdx ? "default" : allDone ? "secondary" : "outline"}
                className={`shrink-0 text-xs cursor-default ${
                  i === exIdx ? "" : "opacity-60"
                }`}
              >
                {e.name}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkoutExecution;
