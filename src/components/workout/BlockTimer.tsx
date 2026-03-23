import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";

interface BlockTimerProps {
  totalSeconds: number;
  label?: string;
  mode?: "countdown" | "countup";
  onComplete?: () => void;
  autoStart?: boolean;
}

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const BlockTimer = ({
  totalSeconds,
  label = "Timer",
  mode = "countdown",
  onComplete,
  autoStart = false,
}: BlockTimerProps) => {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const display = mode === "countdown" ? totalSeconds - elapsed : elapsed;
  const progress = totalSeconds > 0 ? (elapsed / totalSeconds) * 100 : 0;
  const finished = elapsed >= totalSeconds;

  useEffect(() => {
    if (!isRunning || finished) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= totalSeconds) {
          setIsRunning(false);
          onCompleteRef.current?.();
          return totalSeconds;
        }
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, finished, totalSeconds]);

  const reset = useCallback(() => {
    setElapsed(0);
    setIsRunning(false);
  }, []);

  const toggle = useCallback(() => {
    if (finished) return;
    setIsRunning((r) => !r);
  }, [finished]);

  const skip = useCallback(() => {
    setElapsed(totalSeconds);
    setIsRunning(false);
    onCompleteRef.current?.();
  }, [totalSeconds]);

  return (
    <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-3">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium text-center">
        {label}
      </p>
      <p
        className={`text-3xl sm:text-4xl font-bold tabular-nums tracking-tight text-center ${
          finished ? "text-primary" : "text-secondary"
        }`}
      >
        {fmt(Math.max(0, display))}
      </p>
      <Progress value={progress} className="h-1.5 [&>div]:bg-secondary" />
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={toggle} disabled={finished}>
          {isRunning ? (
            <><Pause className="h-4 w-4 mr-1" /> Pausar</>
          ) : (
            <><Play className="h-4 w-4 mr-1" /> {elapsed > 0 ? "Retomar" : "Iniciar"}</>
          )}
        </Button>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-1" /> Reset
        </Button>
        {!finished && (
          <Button variant="ghost" size="sm" onClick={skip}>
            <SkipForward className="h-4 w-4 mr-1" /> Pular
          </Button>
        )}
      </div>
    </div>
  );
};

export default BlockTimer;
