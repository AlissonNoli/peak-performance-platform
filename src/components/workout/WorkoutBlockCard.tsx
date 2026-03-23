import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Video, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import BlockTimer from "./BlockTimer";

export interface WorkoutSet {
  reps: number;
  loadKg?: number;
  percentPR?: number;
  prKg?: number;
}

export interface WorkoutBlock {
  id: number;
  number: number;
  title: string;
  type?: "For Time" | "AMRAP" | "EMOM" | "Tabata" | "Strength" | "Rest" | "General";
  description: string[];
  sets?: WorkoutSet[];
  timerSeconds?: number;
  timerMode?: "countdown" | "countup";
  timerLabel?: string;
  restSeconds?: number;
  videoUrl?: string;
  videoTitle?: string;
  completed: boolean;
}

interface WorkoutBlockCardProps {
  block: WorkoutBlock;
  onComplete: (blockId: number) => void;
}

const WorkoutBlockCard = ({ block, onComplete }: WorkoutBlockCardProps) => {
  const [expanded, setExpanded] = useState(true);

  const typeColors: Record<string, string> = {
    "For Time": "bg-primary/20 text-primary",
    AMRAP: "bg-secondary/20 text-secondary",
    EMOM: "bg-secondary/20 text-secondary",
    Tabata: "bg-primary/20 text-primary",
    Strength: "bg-primary/20 text-primary",
    Rest: "bg-muted text-muted-foreground",
    General: "bg-accent text-accent-foreground",
  };

  return (
    <Card
      className={`border transition-all ${
        block.completed
          ? "border-primary/40 opacity-70"
          : "border-border"
      }`}
    >
      <CardContent className="p-0">
        {/* Header - always visible */}
        <button
          className="w-full flex items-start gap-3 p-4 sm:p-5 text-left"
          onClick={() => setExpanded((e) => !e)}
        >
          {/* Number badge */}
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0 mt-0.5">
            {block.number}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-bold leading-tight">
                {block.title}
              </h3>
              {block.type && (
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase tracking-wider ${
                    typeColors[block.type] || ""
                  }`}
                >
                  {block.type}
                </Badge>
              )}
              {block.completed && (
                <Badge className="bg-primary/20 text-primary text-[10px]">
                  <Check className="h-3 w-3 mr-0.5" /> Concluído
                </Badge>
              )}
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
          )}
        </button>

        {/* Expandable body */}
        {expanded && (
          <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-border pt-4">
            {/* Description lines */}
            <div className="space-y-1.5 pl-11">
              {block.description.map((line, i) => (
                <p
                  key={i}
                  className={`text-sm leading-relaxed ${
                    line.startsWith("*")
                      ? "text-muted-foreground italic"
                      : "text-foreground"
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>

            {/* PR-based loads */}
            {block.sets && block.sets.length > 0 && (
              <div className="pl-11 space-y-2">
                {block.sets.map((set, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-lg p-3"
                  >
                    <span className="text-xs text-muted-foreground font-medium w-16">
                      {set.reps} Rep{set.reps > 1 ? "s" : ""}
                    </span>
                    {set.loadKg && (
                      <span className="text-xl font-extrabold text-primary tabular-nums">
                        {set.loadKg} kg
                      </span>
                    )}
                    {set.percentPR != null && set.percentPR > 0 && set.prKg && (
                      <span className="text-xs text-muted-foreground">
                        ({set.percentPR}% de {set.prKg} kg PR)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Rest info */}
            {block.restSeconds != null && block.restSeconds > 0 && (
              <div className="pl-11 text-sm text-muted-foreground">
                Descanso {Math.floor(block.restSeconds / 60)}&apos;-
                {Math.ceil(block.restSeconds / 60) + 1}&apos; entre séries
              </div>
            )}

            {/* Video reference */}
            {block.videoUrl && (
              <div className="pl-11">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="w-full rounded-lg bg-accent hover:bg-accent/80 transition-colors p-3 flex items-center gap-3 text-left active:scale-[0.98]">
                      <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center shrink-0">
                        <Video className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {block.videoTitle || block.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Toque para ver o vídeo
                        </p>
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg p-0 overflow-hidden">
                    <DialogHeader className="p-4 pb-0">
                      <DialogTitle>{block.videoTitle || block.title}</DialogTitle>
                    </DialogHeader>
                    <div className="aspect-video">
                      <iframe
                        src={block.videoUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={block.title}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Contextual timer */}
            {block.timerSeconds != null && block.timerSeconds > 0 && (
              <div className="pl-11">
                <BlockTimer
                  totalSeconds={block.timerSeconds}
                  label={block.timerLabel || block.type || "Timer"}
                  mode={block.timerMode || "countdown"}
                />
              </div>
            )}

            {/* Action button */}
            {!block.completed && (
              <div className="pl-11">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => onComplete(block.id)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Marcar como Concluído
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutBlockCard;
