import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Save,
  Eye,
  X,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

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
  "General",
  "Warm-up",
  "Strength",
  "For Time",
  "AMRAP",
  "EMOM",
  "Tabata",
  "Rounds For Time",
  "Rest",
];

let nextId = 1;
const uid = () => `item-${nextId++}`;

const emptyExercise = (): ExerciseItem => ({
  id: uid(),
  name: "",
  sets: 3,
  reps: 10,
  loadType: "fixed",
  loadValue: 0,
  percentPR: 0,
  restSeconds: 60,
  videoUrl: "",
});

const emptyBlock = (): TrainingBlock => ({
  id: uid(),
  title: "",
  type: "General",
  capTimeSeconds: 0,
  rounds: 0,
  description: "",
  exercises: [],
  expanded: true,
});

/* ─── Helpers ──────────────────────────────────────── */

function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

/* ─── Component ────────────────────────────────────── */

const WorkoutBuilder = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [assignTo, setAssignTo] = useState("group");
  const [blocks, setBlocks] = useState<TrainingBlock[]>([emptyBlock()]);

  /* Block ops */
  const addBlock = () => setBlocks((prev) => [...prev, emptyBlock()]);

  const removeBlock = (blockId: string) =>
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));

  const updateBlock = (blockId: string, patch: Partial<TrainingBlock>) =>
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, ...patch } : b))
    );

  const toggleBlock = (blockId: string) =>
    updateBlock(blockId, {
      expanded: !blocks.find((b) => b.id === blockId)?.expanded,
    });

  /* Exercise ops */
  const addExercise = (blockId: string) =>
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, exercises: [...b.exercises, emptyExercise()] }
          : b
      )
    );

  const removeExercise = (blockId: string, exId: string) =>
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, exercises: b.exercises.filter((e) => e.id !== exId) }
          : b
      )
    );

  const updateExercise = (
    blockId: string,
    exId: string,
    patch: Partial<ExerciseItem>
  ) =>
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? {
              ...b,
              exercises: b.exercises.map((e) =>
                e.id === exId ? { ...e, ...patch } : e
              ),
            }
          : b
      )
    );

  const handleSave = () => {
    toast({
      title: "Treino salvo!",
      description: `"${title || "Sem título"}" foi salvo com ${blocks.length} bloco(s).`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Criar Novo Treino</h1>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard" className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" /> Cancelar
          </Link>
        </Button>
      </div>

      {/* Basic info */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Informações do Treino</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título do Treino</Label>
              <Input
                placeholder="Ex: Treino de Força - Semana 3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data do Treino</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição / Notas Gerais</Label>
            <Textarea
              placeholder="Notas gerais sobre o treino..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Atribuir a</Label>
              <Select value={assignTo} onValueChange={setAssignTo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Atleta Individual</SelectItem>
                  <SelectItem value="group">Grupo de Atletas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                {assignTo === "individual" ? "Selecionar Atleta" : "Selecionar Grupo"}
              </Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {assignTo === "individual" ? (
                    <>
                      <SelectItem value="athlete-1">João Silva</SelectItem>
                      <SelectItem value="athlete-2">Maria Souza</SelectItem>
                      <SelectItem value="athlete-3">Pedro Costa</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="group-1">BASE PRO</SelectItem>
                      <SelectItem value="group-2">Competição</SelectItem>
                      <SelectItem value="group-3">Iniciantes</SelectItem>
                    </>
                  )}
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
          <Badge variant="outline" className="text-xs">
            {blocks.length} bloco{blocks.length !== 1 ? "s" : ""}
          </Badge>
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
                  onChange={(e) =>
                    updateBlock(block.id, { title: e.target.value })
                  }
                  className="flex-1 bg-transparent border-none h-auto text-base font-semibold p-0 focus-visible:ring-0"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => toggleBlock(block.id)}
                >
                  {block.expanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={() => removeBlock(block.id)}
                  disabled={blocks.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {block.expanded && (
                <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-border pt-4">
                  {/* Block meta */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Tipo de Bloco</Label>
                      <Select
                        value={block.type}
                        onValueChange={(v) =>
                          updateBlock(block.id, { type: v })
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOCK_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {["For Time", "AMRAP", "EMOM", "Rounds For Time"].includes(
                      block.type
                    ) && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Cap Time (min)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={block.capTimeSeconds / 60 || ""}
                          onChange={(e) =>
                            updateBlock(block.id, {
                              capTimeSeconds: Number(e.target.value) * 60,
                            })
                          }
                          className="h-9"
                        />
                      </div>
                    )}
                    {["AMRAP", "EMOM", "Rounds For Time", "Tabata"].includes(
                      block.type
                    ) && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Rondas</Label>
                        <Input
                          type="number"
                          min={0}
                          value={block.rounds || ""}
                          onChange={(e) =>
                            updateBlock(block.id, {
                              rounds: Number(e.target.value),
                            })
                          }
                          className="h-9"
                        />
                      </div>
                    )}
                  </div>

                  {/* Block description */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      Descrição / Instruções do Bloco
                    </Label>
                    <Textarea
                      placeholder="Instruções detalhadas (uma por linha)..."
                      value={block.description}
                      onChange={(e) =>
                        updateBlock(block.id, { description: e.target.value })
                      }
                      className="min-h-[60px] text-sm"
                    />
                  </div>

                  {/* Exercises */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Exercícios
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-secondary border-secondary/30 hover:bg-secondary/10"
                        onClick={() => addExercise(block.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Adicionar Exercício
                      </Button>
                    </div>

                    {block.exercises.length === 0 && (
                      <p className="text-xs text-muted-foreground italic text-center py-4">
                        Nenhum exercício adicionado neste bloco.
                      </p>
                    )}

                    {block.exercises.map((ex) => (
                      <Card key={ex.id} className="bg-muted/30 border-border">
                        <CardContent className="p-3 sm:p-4 space-y-3">
                          {/* Exercise name */}
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Nome do exercício"
                              value={ex.name}
                              onChange={(e) =>
                                updateExercise(block.id, ex.id, {
                                  name: e.target.value,
                                })
                              }
                              className="flex-1 h-9"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0 text-destructive hover:text-destructive h-9 w-9"
                              onClick={() => removeExercise(block.id, ex.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          {/* Sets / Reps / Load */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">
                                Sets
                              </Label>
                              <Input
                                type="number"
                                min={1}
                                value={ex.sets}
                                onChange={(e) =>
                                  updateExercise(block.id, ex.id, {
                                    sets: Number(e.target.value),
                                  })
                                }
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">
                                Reps
                              </Label>
                              <Input
                                type="number"
                                min={1}
                                value={ex.reps}
                                onChange={(e) =>
                                  updateExercise(block.id, ex.id, {
                                    reps: Number(e.target.value),
                                  })
                                }
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">
                                Tipo de Carga
                              </Label>
                              <Select
                                value={ex.loadType}
                                onValueChange={(v: "fixed" | "percentPR") =>
                                  updateExercise(block.id, ex.id, {
                                    loadType: v,
                                  })
                                }
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fixed">
                                    Carga Fixa (kg)
                                  </SelectItem>
                                  <SelectItem value="percentPR">
                                    % do PR
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">
                                {ex.loadType === "fixed" ? "Carga (kg)" : "% PR"}
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                value={
                                  ex.loadType === "fixed"
                                    ? ex.loadValue || ""
                                    : ex.percentPR || ""
                                }
                                onChange={(e) =>
                                  updateExercise(block.id, ex.id, {
                                    [ex.loadType === "fixed"
                                      ? "loadValue"
                                      : "percentPR"]: Number(e.target.value),
                                  })
                                }
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>

                          {/* Rest + Video */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">
                                Descanso (seg)
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                value={ex.restSeconds || ""}
                                onChange={(e) =>
                                  updateExercise(block.id, ex.id, {
                                    restSeconds: Number(e.target.value),
                                  })
                                }
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">
                                URL do Vídeo (YouTube)
                              </Label>
                              <Input
                                placeholder="https://youtube.com/..."
                                value={ex.videoUrl}
                                onChange={(e) =>
                                  updateExercise(block.id, ex.id, {
                                    videoUrl: e.target.value,
                                  })
                                }
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>

                          {/* Video preview */}
                          {ex.videoUrl && getYouTubeId(ex.videoUrl) && (
                            <div className="flex items-center gap-2 p-2 rounded bg-accent text-xs">
                              <Video className="h-4 w-4 text-primary shrink-0" />
                              <span className="truncate text-muted-foreground">
                                Vídeo vinculado: {getYouTubeId(ex.videoUrl)}
                              </span>
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

        {/* Add block button */}
        <Button variant="hero" className="w-full" onClick={addBlock}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar Bloco de Treino
        </Button>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-8">
        <Button variant="hero" size="lg" className="flex-1" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" /> Salvar Treino
        </Button>
        <Button
          variant="hero-outline"
          size="lg"
          className="flex-1"
          onClick={() =>
            toast({
              title: "Pré-visualização",
              description: "Funcionalidade disponível em breve.",
            })
          }
        >
          <Eye className="h-4 w-4 mr-2" /> Pré-visualizar Treino
        </Button>
        <Button variant="ghost" size="lg" asChild>
          <Link to="/dashboard">Cancelar</Link>
        </Button>
      </div>
    </div>
  );
};

export default WorkoutBuilder;
