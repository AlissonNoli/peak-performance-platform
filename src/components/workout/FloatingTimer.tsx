import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, X, Minus, Plus, Timer } from "lucide-react";

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface FloatingTimerProps {
  /** If set, auto-starts a countdown with this duration */
  suggestedSeconds?: number;
  suggestedLabel?: string;
  onDismissSuggestion?: () => void;
}

const PRESETS = [30, 60, 90, 120, 180, 300];

const FloatingTimer = ({
  suggestedSeconds,
  suggestedLabel,
  onDismissSuggestion,
}: FloatingTimerProps) => {
  const [totalSeconds, setTotalSeconds] = useState(60);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const display = totalSeconds - elapsed;
  const finished = elapsed >= totalSeconds;

  // Accept suggestion
  useEffect(() => {
    if (suggestedSeconds && suggestedSeconds > 0) {
      setTotalSeconds(suggestedSeconds);
      setElapsed(0);
      setIsRunning(true);
      setMinimized(false);
    }
  }, [suggestedSeconds]);

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
          return totalSeconds;
        }
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, finished, totalSeconds]);

  const toggle = useCallback(() => {
    if (finished) {
      setElapsed(0);
      setIsRunning(true);
    } else {
      setIsRunning((r) => !r);
    }
  }, [finished]);

  const reset = useCallback(() => {
    setElapsed(0);
    setIsRunning(false);
  }, []);

  const adjustTime = useCallback(
    (delta: number) => {
      if (isRunning) return;
      setTotalSeconds((t) => Math.max(10, t + delta));
      setElapsed(0);
    },
    [isRunning]
  );

  // Minimized pill
  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMinimized(false)}
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 shadow-lg border border-border backdrop-blur-md transition-colors ${
            isRunning
              ? "bg-primary/90 text-primary-foreground"
              : finished
              ? "bg-secondary/90 text-secondary-foreground"
              : "bg-card/95 text-foreground"
          }`}
        >
          <Timer className="h-4 w-4" />
          <span className="text-lg font-bold tabular-nums">
            {fmt(Math.max(0, display))}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50">
      <div className="rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {suggestedLabel || "Timer"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setMinimized(true)}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                reset();
                onDismissSuggestion?.();
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Display */}
        <div className="px-4 py-4 text-center">
          <p
            className={`text-4xl font-black tabular-nums tracking-tight ${
              finished ? "text-primary animate-pulse" : "text-foreground"
            }`}
          >
            {fmt(Math.max(0, display))}
          </p>

          {/* Preset chips — only when not running */}
          {!isRunning && !finished && (
            <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
              {PRESETS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setTotalSeconds(s);
                    setElapsed(0);
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    totalSeconds === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {s < 60 ? `${s}s` : `${s / 60}m`}
                </button>
              ))}
            </div>
          )}

          {/* Adjust buttons */}
          {!isRunning && (
            <div className="flex items-center justify-center gap-3 mt-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => adjustTime(-10)}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center tabular-nums">
                {fmt(totalSeconds)}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => adjustTime(10)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 px-4 pb-4">
          <Button
            variant={isRunning ? "outline" : "hero"}
            className="flex-1"
            onClick={toggle}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-1" /> Pausar
              </>
            ) : finished ? (
              <>
                <RotateCcw className="h-4 w-4 mr-1" /> Reiniciar
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />{" "}
                {elapsed > 0 ? "Retomar" : "Iniciar"}
              </>
            )}
          </Button>
          {(isRunning || elapsed > 0) && (
            <Button variant="ghost" size="icon" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingTimer;
