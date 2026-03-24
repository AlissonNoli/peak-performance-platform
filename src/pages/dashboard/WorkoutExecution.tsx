import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { X, Dumbbell, Check, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import WorkoutBlockCard, { type WorkoutBlock } from "@/components/workout/WorkoutBlockCard";
import FloatingTimer from "@/components/workout/FloatingTimer";

/* ─── Mock Workout Data (block-based) ────────────────── */

const initialBlocks: WorkoutBlock[] = [
  {
    id: 1,
    number: 1,
    title: "Warm-up + CORE WORK + Ativação",
    type: "General",
    description: [
      "3-5' Bike (LEVE/MODERADO)",
      "",
      "Core Work",
      "Complete 2' de GHD Hollow Hold",
      "*A cada quebra: 10 GHD Sit-up",
      "",
      "depois",
      "",
      "3 Rounds of:",
      "10/10 Side Walk Mini-band",
      "8/8 KTB Step Down (sem tirar o calcanhar da caixa - descer em 5\")",
      "6 PAUSE Plate Squat (5\" embaixo - MÁXIMO de velocidade na subida - CARGA LEVE)",
    ],
    videoUrl: "https://www.youtube.com/embed/JGptSsmVt2s",
    videoTitle: "GHD Hip Extension Hold | CrossFit Invictus",
    completed: false,
  },
  {
    id: 2,
    number: 2,
    title: "Strength",
    type: "Strength",
    description: [
      "Front Squat - %1RM",
      "",
      "Descanso 2'-3' entre séries",
      "",
      "*PARA QUEM TEM STRICT HSPU COMO DEFICIÊNCIA, FAÇA:",
      "- Antes da primeira série e entre as séries e após a última série: 30% Máx Strict HSPU",
    ],
    sets: [
      { reps: 3, loadKg: 79, percentPR: 70, prKg: 113 },
      { reps: 2, loadKg: 85, percentPR: 75, prKg: 113 },
      { reps: 2, loadKg: 90, percentPR: 80, prKg: 113 },
      { reps: 2, loadKg: 90, percentPR: 80, prKg: 113 },
    ],
    restSeconds: 150,
    completed: false,
  },
  {
    id: 3,
    number: 3,
    title: "Acessório",
    type: "General",
    description: [
      "3 Rounds:",
      "8/8 Bulgarian Split Squat (DB ou KB)",
      "12 GHD Hip Extension",
      "15 Banded Hamstring Curl",
      "",
      "Descanso 60\" entre rondas",
    ],
    timerSeconds: 60,
    timerLabel: "Descanso",
    timerMode: "countdown",
    completed: false,
  },
  {
    id: 4,
    number: 4,
    title: "Potência Aeróbica",
    type: "General",
    description: [
      '"INBLOCKS53"',
      '"Texas Hold\'em"',
    ],
    completed: false,
  },
  {
    id: 5,
    number: 5,
    title: "Potência Aeróbica — Parte 1",
    type: "For Time",
    description: [
      "30 Wallballs (20/14lb - 3m)",
      "30 HSPU",
      "30 Wallballs",
      "100 D.U",
      "30 Wallballs",
      "18/12m HSW",
    ],
    timerSeconds: 480,
    timerLabel: "Cap: 8'",
    timerMode: "countdown",
    completed: false,
  },
  {
    id: 6,
    number: 6,
    title: "Descanso entre partes",
    type: "Rest",
    description: ["rest 5'"],
    timerSeconds: 300,
    timerLabel: "Descanso",
    timerMode: "countdown",
    completed: false,
  },
  {
    id: 7,
    number: 7,
    title: "Potência Aeróbica — Parte 2",
    type: "For Time",
    description: [
      "100 D.U",
      "10 Clean and Jerk (185/125lb)",
      "100 D.U",
      "10 Clean and Jerk (225/155lb)",
    ],
    timerSeconds: 420,
    timerLabel: "Cap: 7'",
    timerMode: "countdown",
    completed: false,
  },
];

/* ─── Component ────────────────────────────────────── */

const WorkoutExecution = () => {
  const [blocks, setBlocks] = useState<WorkoutBlock[]>(
    () => initialBlocks.map((b) => ({ ...b }))
  );
  const [comment, setComment] = useState("");
  const [finished, setFinished] = useState(false);
  const [floatingTimer, setFloatingTimer] = useState<{
    seconds: number;
    label: string;
  } | null>(null);

  const completedCount = blocks.filter((b) => b.completed).length;
  const overallProgress =
    blocks.length > 0 ? (completedCount / blocks.length) * 100 : 0;

  const handleComplete = useCallback((blockId: number) => {
    setBlocks((prev) => {
      const block = prev.find((b) => b.id === blockId);
      // Auto-trigger floating timer for rest between sets
      if (block?.restSeconds && block.restSeconds > 0) {
        setFloatingTimer({
          seconds: block.restSeconds,
          label: `Descanso — ${block.title}`,
        });
      }
      return prev.map((b) =>
        b.id === blockId ? { ...b, completed: true } : b
      );
    });
  }, []);

  const allDone = blocks.every((b) => b.completed);

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
            <p className="text-sm text-muted-foreground">
              Parabéns! Você completou {completedCount} de {blocks.length} blocos.
            </p>
            {comment && (
              <div className="bg-muted rounded-lg p-3 text-left">
                <p className="text-xs text-muted-foreground mb-1">Suas notas:</p>
                <p className="text-sm">{comment}</p>
              </div>
            )}
            <Button variant="hero" size="lg" asChild>
              <Link to="/dashboard">Voltar ao Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          <div className="flex items-center gap-2 min-w-0">
            <Dumbbell className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold text-sm truncate">
              21/03/2026 - BASE PRO - Strength, Pot Aeróbica
            </span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard" className="flex items-center gap-1 text-muted-foreground">
              <X className="h-4 w-4" /> Sair
            </Link>
          </Button>
        </div>
        {/* Progress */}
        <div className="px-4 sm:px-6 pb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>
              {completedCount} de {blocks.length} blocos concluídos
            </span>
            <span className="tabular-nums">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-1.5" />
        </div>
      </header>

      {/* Block list */}
      <div className="flex-1 px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full space-y-4">
        {blocks.map((block) => (
          <WorkoutBlockCard
            key={block.id}
            block={block}
            onComplete={handleComplete}
          />
        ))}

        {/* Comments area */}
        <Card className="border-border">
          <CardContent className="p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Comentários / Notas do Treino
            </h3>
            <Textarea
              placeholder="Faça um comentário sobre o treino..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] bg-muted/30 border-border"
            />
          </CardContent>
        </Card>

        {/* Finish button */}
        <Button
          variant="hero"
          size="lg"
          className="w-full"
          onClick={() => setFinished(true)}
          disabled={!allDone}
        >
          <Send className="h-4 w-4 mr-2" />
          {allDone ? "Salvar e Finalizar Treino" : "Complete todos os blocos para finalizar"}
        </Button>
      </div>

      {/* Floating Timer */}
      <FloatingTimer
        suggestedSeconds={floatingTimer?.seconds}
        suggestedLabel={floatingTimer?.label}
        onDismissSuggestion={() => setFloatingTimer(null)}
      />
    </div>
  );
};

export default WorkoutExecution;
