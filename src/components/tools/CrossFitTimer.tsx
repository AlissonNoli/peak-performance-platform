import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Timer, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Progress } from "@/components/ui/progress";

/* ─── Helpers ─── */
function fmt(s: number) {
  const m = Math.floor(Math.abs(s) / 60);
  const sec = Math.abs(s) % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function beep(times = 1) {
  try {
    const ctx = new AudioContext();
    for (let i = 0; i < times; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = i === times - 1 ? 880 : 660;
      gain.gain.value = 0.3;
      osc.start(ctx.currentTime + i * 0.3);
      osc.stop(ctx.currentTime + i * 0.3 + 0.15);
    }
  } catch {
    // silent fallback
  }
}

/* ─── Timer Display ─── */
const TimerDisplay = ({
  seconds,
  total,
  label,
  subLabel,
  running,
  onStart,
  onPause,
  onReset,
  soundEnabled,
  onToggleSound,
  color = "text-primary",
}: {
  seconds: number;
  total?: number;
  label?: string;
  subLabel?: string;
  running: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  color?: string;
}) => (
  <div className="flex flex-col items-center gap-4 py-6">
    {label && <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</p>}
    <p className={`text-7xl sm:text-8xl font-mono font-bold tabular-nums ${color}`}>
      {fmt(seconds)}
    </p>
    {subLabel && <p className="text-sm text-muted-foreground">{subLabel}</p>}
    {total != null && total > 0 && (
      <Progress value={Math.max(0, ((total - seconds) / total) * 100)} className="h-2 w-full max-w-xs" />
    )}
    <div className="flex items-center gap-3 mt-2">
      {!running ? (
        <Button variant="hero" size="lg" onClick={onStart} className="gap-2 min-w-[120px]">
          <Play className="h-5 w-5" /> Iniciar
        </Button>
      ) : (
        <Button variant="secondary" size="lg" onClick={onPause} className="gap-2 min-w-[120px]">
          <Pause className="h-5 w-5" /> Pausar
        </Button>
      )}
      <Button variant="outline" size="lg" onClick={onReset} className="gap-2">
        <RotateCcw className="h-4 w-4" /> Reset
      </Button>
      <Button variant="ghost" size="icon" onClick={onToggleSound} className="h-10 w-10">
        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
      </Button>
    </div>
  </div>
);

/* ─── useTimer hook ─── */
function useTimer(direction: "up" | "down", initialSeconds: number, onFinish?: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  const clear = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const start = useCallback(() => {
    clear();
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (direction === "down") {
          if (prev <= 1) {
            clear();
            setRunning(false);
            if (soundRef.current) beep(3);
            onFinishRef.current?.();
            return 0;
          }
          if (prev <= 4 && soundRef.current) beep(1);
          return prev - 1;
        }
        return prev + 1;
      });
    }, 1000);
  }, [direction, clear]);

  const pause = useCallback(() => { clear(); setRunning(false); }, [clear]);

  const reset = useCallback((newSeconds?: number) => {
    clear();
    setRunning(false);
    setSeconds(newSeconds ?? initialSeconds);
  }, [clear, initialSeconds]);

  useEffect(() => () => clear(), [clear]);

  return { seconds, running, start, pause, reset, setSeconds, soundEnabled, setSoundEnabled };
}

/* ─── Number input helper ─── */
const NumInput = ({ label, value, onChange, min = 0, max = 999 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <Input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))}
      className="h-9 w-20 text-center tabular-nums bg-muted/30"
    />
  </div>
);

/* ═══════════════════════════════════════
   Tab: Simples (simple countdown)
   ═══════════════════════════════════════ */
const SimpleTimer = () => {
  const [inputMin, setInputMin] = useState(5);
  const [inputSec, setInputSec] = useState(0);
  const total = inputMin * 60 + inputSec;
  const timer = useTimer("down", total);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Contagem decrescente com alerta ao chegar a zero (como descanso ou cap simples).</p>
      <div className="flex items-end gap-3">
        <NumInput label="Minutos" value={inputMin} onChange={setInputMin} />
        <NumInput label="Segundos" value={inputSec} onChange={setInputSec} max={59} />
        <Button variant="outline" size="sm" className="h-9" onClick={() => timer.reset(inputMin * 60 + inputSec)}>
          Aplicar
        </Button>
      </div>
      <TimerDisplay
        seconds={timer.seconds}
        total={total}
        running={timer.running}
        onStart={timer.start}
        onPause={timer.pause}
        onReset={() => timer.reset(inputMin * 60 + inputSec)}
        soundEnabled={timer.soundEnabled}
        onToggleSound={() => timer.setSoundEnabled(!timer.soundEnabled)}
      />
    </div>
  );
};

/* ═══════════════════════════════════════
   Tab: AMRAP
   ═══════════════════════════════════════ */
const AmrapTimer = () => {
  const [inputMin, setInputMin] = useState(12);
  const total = inputMin * 60;
  const [rounds, setRounds] = useState(0);
  const timer = useTimer("down", total);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">As Many Rounds As Possible — conta tempo restante e rondas completadas.</p>
      <div className="flex items-end gap-3">
        <NumInput label="Duração (min)" value={inputMin} onChange={setInputMin} />
        <Button variant="outline" size="sm" className="h-9" onClick={() => { timer.reset(inputMin * 60); setRounds(0); }}>
          Aplicar
        </Button>
      </div>
      <TimerDisplay
        seconds={timer.seconds}
        total={total}
        label="AMRAP"
        subLabel={`Rondas: ${rounds}`}
        running={timer.running}
        onStart={timer.start}
        onPause={timer.pause}
        onReset={() => { timer.reset(inputMin * 60); setRounds(0); }}
        soundEnabled={timer.soundEnabled}
        onToggleSound={() => timer.setSoundEnabled(!timer.soundEnabled)}
      />
      {timer.running && (
        <div className="flex justify-center">
          <Button variant="outline" size="lg" onClick={() => { setRounds((r) => r + 1); if (timer.soundEnabled) beep(1); }} className="gap-2">
            + Ronda ({rounds})
          </Button>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════
   Tab: AMRAP Intervalos
   ═══════════════════════════════════════ */
const AmrapIntervalsTimer = () => {
  const [workMin, setWorkMin] = useState(4);
  const [restSec, setRestSec] = useState(60);
  const [intervals, setIntervals] = useState(3);
  const [currentInterval, setCurrentInterval] = useState(1);
  const [phase, setPhase] = useState<"work" | "rest">("work");
  const [rounds, setRounds] = useState(0);

  const currentTotal = phase === "work" ? workMin * 60 : restSec;
  const timer = useTimer("down", currentTotal, () => {
    if (phase === "work") {
      if (currentInterval < intervals) {
        setPhase("rest");
        timer.reset(restSec);
        setTimeout(() => timer.start(), 100);
      }
    } else {
      setCurrentInterval((c) => c + 1);
      setPhase("work");
      timer.reset(workMin * 60);
      setTimeout(() => timer.start(), 100);
    }
  });

  const fullReset = () => {
    timer.reset(workMin * 60);
    setCurrentInterval(1);
    setPhase("work");
    setRounds(0);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">AMRAP com intervalos de descanso entre séries.</p>
      <div className="flex items-end gap-3 flex-wrap">
        <NumInput label="Trabalho (min)" value={workMin} onChange={setWorkMin} />
        <NumInput label="Descanso (seg)" value={restSec} onChange={setRestSec} />
        <NumInput label="Intervalos" value={intervals} onChange={setIntervals} min={1} max={20} />
        <Button variant="outline" size="sm" className="h-9" onClick={fullReset}>Aplicar</Button>
      </div>
      <TimerDisplay
        seconds={timer.seconds}
        total={currentTotal}
        label={phase === "work" ? `WORK — Intervalo ${currentInterval}/${intervals}` : "REST"}
        subLabel={`Rondas: ${rounds}`}
        running={timer.running}
        onStart={timer.start}
        onPause={timer.pause}
        onReset={fullReset}
        soundEnabled={timer.soundEnabled}
        onToggleSound={() => timer.setSoundEnabled(!timer.soundEnabled)}
        color={phase === "work" ? "text-primary" : "text-blue-400"}
      />
      {timer.running && phase === "work" && (
        <div className="flex justify-center">
          <Button variant="outline" size="lg" onClick={() => { setRounds((r) => r + 1); if (timer.soundEnabled) beep(1); }}>
            + Ronda ({rounds})
          </Button>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════
   Tab: For Time
   ═══════════════════════════════════════ */
const ForTimeTimer = () => {
  const [capMin, setCapMin] = useState(15);
  const cap = capMin * 60;
  const timer = useTimer("up", 0);
  const capped = timer.seconds >= cap;

  useEffect(() => {
    if (capped && timer.running) {
      timer.pause();
      if (timer.soundEnabled) beep(3);
    }
  }, [capped, timer.running, timer]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Cronómetro ascendente com time cap. Para quando terminar o WOD ou atingir o cap.</p>
      <div className="flex items-end gap-3">
        <NumInput label="Time Cap (min)" value={capMin} onChange={setCapMin} />
        <Button variant="outline" size="sm" className="h-9" onClick={() => timer.reset(0)}>Aplicar</Button>
      </div>
      <TimerDisplay
        seconds={timer.seconds}
        total={cap}
        label="FOR TIME"
        subLabel={capped ? "⏰ TIME CAP ATINGIDO" : `Cap: ${capMin}:00`}
        running={timer.running}
        onStart={timer.start}
        onPause={timer.pause}
        onReset={() => timer.reset(0)}
        soundEnabled={timer.soundEnabled}
        onToggleSound={() => timer.setSoundEnabled(!timer.soundEnabled)}
        color={capped ? "text-destructive" : "text-primary"}
      />
      {/* Progress for "for time" goes up */}
    </div>
  );
};

/* ═══════════════════════════════════════
   Tab: Tabata
   ═══════════════════════════════════════ */
const TabataTimer = () => {
  const [workSec, setWorkSec] = useState(20);
  const [restSec, setRestSec] = useState(10);
  const [totalRounds, setTotalRounds] = useState(8);
  const [currentRound, setCurrentRound] = useState(1);
  const [phase, setPhase] = useState<"work" | "rest">("work");

  const currentTotal = phase === "work" ? workSec : restSec;
  const timer = useTimer("down", currentTotal, () => {
    if (phase === "work") {
      if (currentRound <= totalRounds) {
        setPhase("rest");
        timer.reset(restSec);
        setTimeout(() => timer.start(), 100);
      }
    } else {
      if (currentRound < totalRounds) {
        setCurrentRound((c) => c + 1);
        setPhase("work");
        timer.reset(workSec);
        setTimeout(() => timer.start(), 100);
      }
    }
  });

  const fullReset = () => {
    timer.reset(workSec);
    setCurrentRound(1);
    setPhase("work");
  };

  const overallProgress = ((currentRound - 1) / totalRounds) * 100 + (phase === "rest" ? 50 / totalRounds : 0);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Protocolo Tabata clássico — intervalos de alta intensidade com descanso curto.</p>
      <div className="flex items-end gap-3 flex-wrap">
        <NumInput label="Trabalho (seg)" value={workSec} onChange={setWorkSec} />
        <NumInput label="Descanso (seg)" value={restSec} onChange={setRestSec} />
        <NumInput label="Rondas" value={totalRounds} onChange={setTotalRounds} min={1} max={30} />
        <Button variant="outline" size="sm" className="h-9" onClick={fullReset}>Aplicar</Button>
      </div>
      <TimerDisplay
        seconds={timer.seconds}
        total={currentTotal}
        label={phase === "work" ? `WORK — Ronda ${currentRound}/${totalRounds}` : `REST — Ronda ${currentRound}/${totalRounds}`}
        running={timer.running}
        onStart={timer.start}
        onPause={timer.pause}
        onReset={fullReset}
        soundEnabled={timer.soundEnabled}
        onToggleSound={() => timer.setSoundEnabled(!timer.soundEnabled)}
        color={phase === "work" ? "text-primary" : "text-blue-400"}
      />
      <Progress value={overallProgress} className="h-1.5" />
    </div>
  );
};

/* ═══════════════════════════════════════
   Tab: EMOM
   ═══════════════════════════════════════ */
const EmomTimer = () => {
  const [intervalSec, setIntervalSec] = useState(60);
  const [totalRounds, setTotalRounds] = useState(10);
  const [currentRound, setCurrentRound] = useState(1);

  const timer = useTimer("down", intervalSec, () => {
    if (currentRound < totalRounds) {
      setCurrentRound((c) => c + 1);
      timer.reset(intervalSec);
      setTimeout(() => timer.start(), 100);
    }
  });

  const fullReset = () => {
    timer.reset(intervalSec);
    setCurrentRound(1);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Every Minute On the Minute — executa no início de cada minuto.</p>
      <div className="flex items-end gap-3 flex-wrap">
        <NumInput label="Intervalo (seg)" value={intervalSec} onChange={setIntervalSec} />
        <NumInput label="Rondas" value={totalRounds} onChange={setTotalRounds} min={1} max={50} />
        <Button variant="outline" size="sm" className="h-9" onClick={fullReset}>Aplicar</Button>
      </div>
      <TimerDisplay
        seconds={timer.seconds}
        total={intervalSec}
        label={`EMOM — Minuto ${currentRound}/${totalRounds}`}
        running={timer.running}
        onStart={timer.start}
        onPause={timer.pause}
        onReset={fullReset}
        soundEnabled={timer.soundEnabled}
        onToggleSound={() => timer.setSoundEnabled(!timer.soundEnabled)}
      />
      <Progress value={((currentRound - 1) / totalRounds) * 100} className="h-1.5" />
    </div>
  );
};

/* ═══════════════════════════════════════
   Main CrossFit Timer
   ═══════════════════════════════════════ */
const CrossFitTimer = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          Timer CrossFit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="simple">
          <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 h-auto">
            <TabsTrigger value="simple" className="text-xs">Simples</TabsTrigger>
            <TabsTrigger value="amrap" className="text-xs">AMRAP</TabsTrigger>
            <TabsTrigger value="amrap-intervals" className="text-xs">AMRAP Int.</TabsTrigger>
            <TabsTrigger value="fortime" className="text-xs">For Time</TabsTrigger>
            <TabsTrigger value="tabata" className="text-xs">Tabata</TabsTrigger>
            <TabsTrigger value="emom" className="text-xs">EMOM</TabsTrigger>
          </TabsList>
          <TabsContent value="simple"><SimpleTimer /></TabsContent>
          <TabsContent value="amrap"><AmrapTimer /></TabsContent>
          <TabsContent value="amrap-intervals"><AmrapIntervalsTimer /></TabsContent>
          <TabsContent value="fortime"><ForTimeTimer /></TabsContent>
          <TabsContent value="tabata"><TabataTimer /></TabsContent>
          <TabsContent value="emom"><EmomTimer /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CrossFitTimer;
