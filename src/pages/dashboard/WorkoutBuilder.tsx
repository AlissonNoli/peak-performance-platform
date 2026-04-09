import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Save, Eye, X, Video, Copy, FileText,
} from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useStore, genId } from "@/lib/store";
import type { SavedWorkout, SavedBlock, SavedExercise } from "@/lib/store";

/* ─── Types ────────────────────────────────────────── */

interface ExerciseItem {
  id: string;
  name: string;
  sets: number;
  reps: number;
  loadType: "fixed" | "percentPR";
  loadValue: number;
  percentPR: number;
  restSeconds: number;
  videoUrl: string;
}

interface TrainingBlock {
  id: string;
  title: string;
  type: string;
  capTimeSeconds: number;
  rounds: number;
  description: string;
  exercises: ExerciseItem[];
  expanded: boolean;
}

const BLOCK_TYPES = [
  "General", "Warm-up", "Strength", "For Time", "AMRAP", "EMOM", "Tabata", "Rounds For Time", "Rest",
];

let nextId = 1;
const uid = () => `item-${nextId++}`;

const emptyExercise = (): ExerciseItem => ({
  id: uid(), name: "", sets: 3, reps: 10, loadType: "fixed", loadValue: 0, percentPR: 0, restSeconds: 60, videoUrl: "",
});

const emptyBlock = (): TrainingBlock => ({
  id: uid(), title: "", type: "General", capTimeSeconds: 0, rounds: 0, description: "", exercises: [], expanded: true,
});

/* ─── Helpers ──────────────────────────────────────── */

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function blocksToSaved(blocks: TrainingBlock[]): SavedBlock[] {
  return blocks.map((b) => ({
    id: b.id, title: b.title, type: b.type, capTimeSeconds: b.capTimeSeconds,
    rounds: b.rounds, description: b.description,
    exercises: b.exercises.map((e) => ({ ...e })),
  }));
}

function savedToBlocks(saved: SavedBlock[]): TrainingBlock[] {
  return saved.map((b) => ({ ...b, exercises: b.exercises.map((e) => ({ ...e })), expanded: true }));
}

/* ─── Athlete Preview Component ─── */
const AthletePreview = ({ title, description, blocks }: { title: string; description: string; blocks: TrainingBlock[] }) => {
  const typeColors: Record<string, string> = {
    "For Time": "bg-primary/20 text-primary",
    AMRAP: "bg-secondary/20 text-secondary",
    EMOM: "bg-secondary/20 text-secondary",
    Tabata: "bg-primary/20 text-primary",
    Strength: "bg-primary/20 text-primary",
    Rest: "bg-muted text-muted-foreground",
    General: "bg-accent text-accent-foreground",
    "Warm-up": "bg-accent text-accent-foreground",
    "Rounds For Time": "bg-primary/20 text-primary",
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1 pb-2 border-b border-border">
        <h3 className="text-lg font-bold">{title || "Sem título"}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {blocks.filter((b) => b.title || b.exercises.length > 0 || b.description).map((block, idx) => (
        <Card key={block.id} className="border-border">
          <CardContent className="p-0">
            <div className="flex items-start gap-3 p-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold">{block.title || `Bloco ${idx + 1}`}</h4>
                  {block.type && block.type !== "General" && (
                    <Badge variant="outline" className={`text-[9px] uppercase ${typeColors[block.type] || ""}`}>
                      {block.type}
                    </Badge>
                  )}
                </div>
                {block.description && (
                  <div className="mt-2 space-y-1">
                    {block.description.split("\n").map((line, i) => (
                      <p key={i} className={`text-sm ${line.startsWith("*") ? "text-muted-foreground italic" : ""}`}>
                        {line}
                      </p>
                    ))}
                  </div>
                )}
                {block.exercises.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {block.exercises.filter((e) => e.name).map((ex) => (
                      <div key={ex.id} className="bg-primary/5 border border-primary/10 rounded-lg p-2.5">
                        <p className="text-sm font-semibold">{ex.name}</p>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{ex.sets} × {ex.reps}</span>
                          {ex.loadType === "fixed" && ex.loadValue > 0 && <span>· {ex.loadValue} kg</span>}
                          {ex.loadType === "percentPR" && ex.percentPR > 0 && <span>· {ex.percentPR}% PR</span>}
                          {ex.restSeconds > 0 && <span>· {ex.restSeconds}s desc.</span>}
                        </div>
                        {ex.videoUrl && getYouTubeId(ex.videoUrl) && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                            <Video className="h-3 w-3" /> Vídeo disponível
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {block.capTimeSeconds > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">⏱ Cap: {block.capTimeSeconds / 60} min</p>
                )}
                {block.rounds > 0 && (
                  <p className="text-xs text-muted-foreground">🔄 {block.rounds} rondas</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {blocks.every((b) => !b.title && b.exercises.length === 0 && !b.description) && (
        <p className="text-sm text-muted-foreground text-center py-8">Comece a preencher o treino para ver a pré-visualização.</p>
      )}
    </div>
  );
};

/* ─── Template Picker Dialog ─── */
const TemplatePicker = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const store = useStore();
  const templates = store.getTemplates();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <FileText className="h-3.5 w-3.5" /> Usar Template
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Templates Salvos</DialogTitle></DialogHeader>
        <div className="space-y-2 max-h-80 overflow-y-auto py-2">
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum template salvo. Salve um treino como template primeiro.</p>
          ) : (
            templates.map((t) => (
              <button
                key={t.id}
                onClick={() => { onSelect(t.id); setOpen(false); }}
                className="w-full text-left rounded-lg border border-border p-3 hover:bg-accent transition-colors"
              >
                <p className="text-sm font-semibold">{t.title || "Sem título"}</p>
                <p className="text-xs text-muted-foreground">{t.blocks.length} blocos · {t.date || "Sem data"}</p>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Main Component ────────────────────────────────── */

const WorkoutBuilder = () => {
  const store = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editId = searchParams.get("edit");
  const templateId = searchParams.get("template");
  const prefillDate = searchParams.get("date");
  const prefillGroup = searchParams.get("group");

  const [workoutId, setWorkoutId] = useState(() => editId || genId());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(prefillDate || "");
  const [assignTo, setAssignTo] = useState<"individual" | "group">(prefillGroup ? "group" : "group");
  const [assignId, setAssignId] = useState(prefillGroup || "");
  const [blocks, setBlocks] = useState<TrainingBlock[]>([emptyBlock()]);
  const [isTemplate, setIsTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");

  // Load edit/template data
  useEffect(() => {
    const sourceId = editId || templateId;
    if (sourceId) {
      const source = store.workouts.find((w) => w.id === sourceId);
      if (source) {
        if (editId) setWorkoutId(source.id);
        else setWorkoutId(genId()); // template = new workout
        setTitle(templateId ? `${source.title} (cópia)` : source.title);
        setDescription(source.description);
        setDate(templateId ? (prefillDate || "") : source.date);
        setAssignTo(source.assignTo);
        setAssignId(templateId ? (prefillGroup || source.assignId) : source.assignId);
        setBlocks(savedToBlocks(source.blocks));
        setIsTemplate(source.isTemplate);
      }
    }
  }, []);

  const assignName = useMemo(() => {
    if (assignTo === "group") {
      return store.groups.find((g) => g.id === assignId)?.name || "";
    }
    return store.athletes.find((a) => a.id === assignId)?.name || "";
  }, [assignTo, assignId, store.groups, store.athletes]);

  /* Block ops */
  const addBlock = () => setBlocks((prev) => [...prev, emptyBlock()]);
  const removeBlock = (blockId: string) => setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  const updateBlock = (blockId: string, patch: Partial<TrainingBlock>) =>
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, ...patch } : b)));
  const toggleBlock = (blockId: string) =>
    updateBlock(blockId, { expanded: !blocks.find((b) => b.id === blockId)?.expanded });

  /* Exercise ops */
  const addExercise = (blockId: string) =>
    setBlocks((prev) => prev.map((b) => b.id === blockId ? { ...b, exercises: [...b.exercises, emptyExercise()] } : b));
  const removeExercise = (blockId: string, exId: string) =>
    setBlocks((prev) => prev.map((b) => b.id === blockId ? { ...b, exercises: b.exercises.filter((e) => e.id !== exId) } : b));
  const updateExercise = (blockId: string, exId: string, patch: Partial<ExerciseItem>) =>
    setBlocks((prev) => prev.map((b) => b.id === blockId ? { ...b, exercises: b.exercises.map((e) => e.id === exId ? { ...e, ...patch } : e) } : b));

  const handleSave = (asTemplate: boolean = false) => {
    const workout: SavedWorkout = {
      id: workoutId,
      title: title || "Sem título",
      description,
      date,
      assignTo,
      assignId,
      assignName,
      blocks: blocksToSaved(blocks),
      isTemplate: asTemplate || isTemplate,
      createdAt: new Date().toISOString(),
    };
    store.saveWorkout(workout);
    toast({
      title: asTemplate ? "Template salvo!" : (editId ? "Treino atualizado!" : "Treino salvo!"),
      description: `"${workout.title}" foi salvo com ${blocks.length} bloco(s).`,
    });
    if (!editId) {
      navigate("/dashboard/group-workouts");
    }
  };

  const loadTemplate = (templateWorkoutId: string) => {
    const source = store.workouts.find((w) => w.id === templateWorkoutId);
    if (source) {
      setTitle(`${source.title} (cópia)`);
      setDescription(source.description);
      setBlocks(savedToBlocks(source.blocks));
      toast({ title: "Template carregado!", description: `Baseado em "${source.title}".` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {isTemplate ? (editId ? "Editar Template" : "Criar Novo Template") : (editId ? "Editar Treino" : "Criar Novo Treino")}
        </h1>
        <div className="flex items-center gap-2">
          <TemplatePicker onSelect={loadTemplate} />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard" className="text-muted-foreground">
              <X className="h-4 w-4 mr-1" /> Cancelar
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs: Editor / Preview */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="editor" className="gap-1"><Trash2 className="h-3.5 w-3.5 hidden" />Editor</TabsTrigger>
          <TabsTrigger value="preview" className="gap-1"><Eye className="h-3.5 w-3.5" />Visão Atleta</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Eye className="h-4 w-4" /> Pré-visualização — como o atleta verá o treino
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AthletePreview title={title} description={description} blocks={blocks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="mt-4 space-y-6">
          {/* Basic info */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Informações do Treino</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título do Treino</Label>
                  <Input placeholder="Ex: Treino de Força - Semana 3" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Data do Treino</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição / Notas Gerais</Label>
                <Textarea placeholder="Notas gerais sobre o treino..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[80px]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Atribuir a</Label>
                  <Select value={assignTo} onValueChange={(v: "individual" | "group") => { setAssignTo(v); setAssignId(""); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Atleta Individual</SelectItem>
                      <SelectItem value="group">Grupo de Atletas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{assignTo === "individual" ? "Selecionar Atleta" : "Selecionar Grupo"}</Label>
                  <Select value={assignId} onValueChange={setAssignId}>
                    <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                    <SelectContent>
                      {assignTo === "individual"
                        ? store.athletes.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)
                        : store.groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training blocks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Blocos de Treino</h2>
              <Badge variant="outline" className="text-xs">{blocks.length} bloco{blocks.length !== 1 ? "s" : ""}</Badge>
            </div>

            {blocks.map((block, blockIdx) => (
              <Card key={block.id} className="border-border">
                <CardContent className="p-0">
                  {/* Block header */}
                  <div className="flex items-center gap-2 p-4 sm:p-5">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                      {blockIdx + 1}
                    </span>
                    <Input
                      placeholder="Título do bloco (ex: Warm-up)"
                      value={block.title}
                      onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                      className="flex-1 bg-transparent border-none h-auto text-base font-semibold p-0 focus-visible:ring-0"
                    />
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => toggleBlock(block.id)}>
                      {block.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive" onClick={() => removeBlock(block.id)} disabled={blocks.length === 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {block.expanded && (
                    <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-border pt-4">
                      {/* Block meta */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Tipo de Bloco</Label>
                          <Select value={block.type} onValueChange={(v) => updateBlock(block.id, { type: v })}>
                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {BLOCK_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        {["For Time", "AMRAP", "EMOM", "Rounds For Time"].includes(block.type) && (
                          <div className="space-y-1.5">
                            <Label className="text-xs">Cap Time (min)</Label>
                            <Input type="number" min={0} value={block.capTimeSeconds / 60 || ""} onChange={(e) => updateBlock(block.id, { capTimeSeconds: Number(e.target.value) * 60 })} className="h-9" />
                          </div>
                        )}
                        {["AMRAP", "EMOM", "Rounds For Time", "Tabata"].includes(block.type) && (
                          <div className="space-y-1.5">
                            <Label className="text-xs">Rondas</Label>
                            <Input type="number" min={0} value={block.rounds || ""} onChange={(e) => updateBlock(block.id, { rounds: Number(e.target.value) })} className="h-9" />
                          </div>
                        )}
                      </div>

                      {/* Block description */}
                      <div className="space-y-1.5">
                        <Label className="text-xs">Descrição / Instruções do Bloco</Label>
                        <Textarea placeholder="Instruções detalhadas (uma por linha)..." value={block.description} onChange={(e) => updateBlock(block.id, { description: e.target.value })} className="min-h-[60px] text-sm" />
                      </div>

                      {/* Exercises */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Exercícios</Label>
                          <Button variant="outline" size="sm" className="text-secondary border-secondary/30 hover:bg-secondary/10" onClick={() => addExercise(block.id)}>
                            <Plus className="h-3 w-3 mr-1" /> Adicionar Exercício
                          </Button>
                        </div>

                        {block.exercises.length === 0 && (
                          <p className="text-xs text-muted-foreground italic text-center py-4">Nenhum exercício adicionado neste bloco.</p>
                        )}

                        {block.exercises.map((ex) => (
                          <Card key={ex.id} className="bg-muted/30 border-border">
                            <CardContent className="p-3 sm:p-4 space-y-3">
                              <div className="flex items-center gap-2">
                                <Input placeholder="Nome do exercício" value={ex.name} onChange={(e) => updateExercise(block.id, ex.id, { name: e.target.value })} className="flex-1 h-9" />
                                <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive h-9 w-9" onClick={() => removeExercise(block.id, ex.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-[10px] text-muted-foreground">Sets</Label>
                                  <Input type="number" min={1} value={ex.sets} onChange={(e) => updateExercise(block.id, ex.id, { sets: Number(e.target.value) })} className="h-8 text-sm" />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] text-muted-foreground">Reps</Label>
                                  <Input type="number" min={1} value={ex.reps} onChange={(e) => updateExercise(block.id, ex.id, { reps: Number(e.target.value) })} className="h-8 text-sm" />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] text-muted-foreground">Tipo de Carga</Label>
                                  <Select value={ex.loadType} onValueChange={(v: "fixed" | "percentPR") => updateExercise(block.id, ex.id, { loadType: v })}>
                                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="fixed">Carga Fixa (kg)</SelectItem>
                                      <SelectItem value="percentPR">% do PR</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] text-muted-foreground">{ex.loadType === "fixed" ? "Carga (kg)" : "% PR"}</Label>
                                  <Input type="number" min={0} value={ex.loadType === "fixed" ? ex.loadValue || "" : ex.percentPR || ""} onChange={(e) => updateExercise(block.id, ex.id, { [ex.loadType === "fixed" ? "loadValue" : "percentPR"]: Number(e.target.value) })} className="h-8 text-sm" />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-[10px] text-muted-foreground">Descanso (seg)</Label>
                                  <Input type="number" min={0} value={ex.restSeconds || ""} onChange={(e) => updateExercise(block.id, ex.id, { restSeconds: Number(e.target.value) })} className="h-8 text-sm" />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] text-muted-foreground">URL do Vídeo (YouTube)</Label>
                                  <Input placeholder="https://youtube.com/..." value={ex.videoUrl} onChange={(e) => updateExercise(block.id, ex.id, { videoUrl: e.target.value })} className="h-8 text-sm" />
                                </div>
                              </div>
                              {ex.videoUrl && getYouTubeId(ex.videoUrl) && (
                                <div className="flex items-center gap-2 p-2 rounded bg-accent text-xs">
                                  <Video className="h-4 w-4 text-primary shrink-0" />
                                  <span className="truncate text-muted-foreground">Vídeo vinculado: {getYouTubeId(ex.videoUrl)}</span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button variant="hero" className="w-full" onClick={addBlock}>
              <Plus className="h-4 w-4 mr-2" /> Adicionar Bloco de Treino
            </Button>
          </div>

          {/* Action buttons */}
           <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-8">
            {isTemplate ? (
              <Button variant="hero" size="lg" className="flex-1" onClick={() => handleSave(true)}>
                <Save className="h-4 w-4 mr-2" /> {editId ? "Atualizar Template" : "Salvar Template"}
              </Button>
            ) : (
              <>
                <Button variant="hero" size="lg" className="flex-1" onClick={() => handleSave(false)}>
                  <Save className="h-4 w-4 mr-2" /> {editId ? "Atualizar Treino" : "Salvar Treino"}
                </Button>
                <Button variant="outline" size="lg" className="flex-1 gap-1" onClick={() => handleSave(true)}>
                  <Copy className="h-4 w-4" /> Salvar como Template
                </Button>
              </>
            )}
            <Button variant="ghost" size="lg" className="gap-1" onClick={() => setActiveTab("preview")}>
              <Eye className="h-4 w-4" /> Pré-visualizar
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link to="/dashboard">Cancelar</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutBuilder;
