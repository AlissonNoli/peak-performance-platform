import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowUp, ArrowDown, Edit, Plus, Search, Trash2, Trophy, TrendingUp, Minus,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { genId } from "@/lib/store";
import { toast } from "sonner";

/* ─── Types ─── */

interface PREntry {
  id: string;
  weight: number;
  reps: number;
  date: string;
  notes?: string;
}

interface ExercisePR {
  id: string;
  name: string;
  category: string;
  entries: PREntry[];
}

/* ─── Initial Data ─── */

const CATEGORIES = ["Weightlifting", "Powerlifting", "Gymnastics", "Cardio", "Outro"];

const INITIAL_DATA: ExercisePR[] = [
  {
    id: "ex1", name: "Back Squat", category: "Powerlifting",
    entries: [
      { id: "e1", weight: 120, reps: 1, date: "2025-12-01" },
      { id: "e2", weight: 125, reps: 1, date: "2026-01-15" },
      { id: "e3", weight: 130, reps: 1, date: "2026-03-10" },
    ],
  },
  {
    id: "ex2", name: "Clean & Jerk", category: "Weightlifting",
    entries: [
      { id: "e4", weight: 85, reps: 1, date: "2025-11-20" },
      { id: "e5", weight: 90, reps: 1, date: "2026-02-05" },
    ],
  },
  {
    id: "ex3", name: "Deadlift", category: "Powerlifting",
    entries: [
      { id: "e6", weight: 150, reps: 1, date: "2025-10-10" },
      { id: "e7", weight: 160, reps: 1, date: "2026-01-20" },
      { id: "e8", weight: 165, reps: 1, date: "2026-03-25" },
    ],
  },
  {
    id: "ex4", name: "Snatch", category: "Weightlifting",
    entries: [
      { id: "e9", weight: 70, reps: 1, date: "2026-02-14" },
    ],
  },
];

/* ─── Component ─── */

const PRsPage = () => {
  const [exercises, setExercises] = useState<ExercisePR[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // Dialog states
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editEntry, setEditEntry] = useState<{ exerciseId: string; entry: PREntry } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ exerciseId: string; entryId?: string } | null>(null);

  // Form states
  const [newExName, setNewExName] = useState("");
  const [newExCat, setNewExCat] = useState("Weightlifting");
  const [entryWeight, setEntryWeight] = useState("");
  const [entryReps, setEntryReps] = useState("1");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [entryNotes, setEntryNotes] = useState("");

  const filtered = exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterCat === "all" || ex.category === filterCat)
  );

  const getBestPR = (ex: ExercisePR) => {
    if (ex.entries.length === 0) return null;
    return ex.entries.reduce((best, e) => (e.weight > best.weight ? e : best));
  };

  const getProgressIcon = (ex: ExercisePR) => {
    if (ex.entries.length < 2) return <Minus className="h-4 w-4 text-muted-foreground" />;
    const sorted = [...ex.entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sorted[0].weight > sorted[1].weight) return <ArrowUp className="h-4 w-4 text-secondary" />;
    if (sorted[0].weight < sorted[1].weight) return <ArrowDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  // CRUD handlers
  const handleAddExercise = () => {
    if (!newExName.trim()) return;
    setExercises([...exercises, { id: genId(), name: newExName.trim(), category: newExCat, entries: [] }]);
    setNewExName("");
    setShowAddExercise(false);
    toast.success("Exercício adicionado!");
  };

  const handleDeleteExercise = (exId: string) => {
    setExercises(exercises.filter((e) => e.id !== exId));
    if (selectedExercise === exId) setSelectedExercise(null);
    setDeleteTarget(null);
    toast.success("Exercício removido.");
  };

  const handleAddEntry = () => {
    if (!selectedExercise || !entryWeight) return;
    const entry: PREntry = {
      id: genId(),
      weight: parseFloat(entryWeight),
      reps: parseInt(entryReps) || 1,
      date: entryDate,
      notes: entryNotes || undefined,
    };
    setExercises(exercises.map((ex) =>
      ex.id === selectedExercise ? { ...ex, entries: [...ex.entries, entry] } : ex
    ));
    setEntryWeight("");
    setEntryReps("1");
    setEntryNotes("");
    setShowAddEntry(false);
    toast.success("PR registrado!");
  };

  const handleEditEntry = () => {
    if (!editEntry || !entryWeight) return;
    const updated: PREntry = {
      ...editEntry.entry,
      weight: parseFloat(entryWeight),
      reps: parseInt(entryReps) || 1,
      date: entryDate,
      notes: entryNotes || undefined,
    };
    setExercises(exercises.map((ex) =>
      ex.id === editEntry.exerciseId
        ? { ...ex, entries: ex.entries.map((e) => (e.id === updated.id ? updated : e)) }
        : ex
    ));
    setEditEntry(null);
    toast.success("PR atualizado!");
  };

  const handleDeleteEntry = () => {
    if (!deleteTarget?.entryId) return;
    setExercises(exercises.map((ex) =>
      ex.id === deleteTarget.exerciseId
        ? { ...ex, entries: ex.entries.filter((e) => e.id !== deleteTarget.entryId) }
        : ex
    ));
    setDeleteTarget(null);
    toast.success("Registro removido.");
  };

  const openEditEntry = (exerciseId: string, entry: PREntry) => {
    setEditEntry({ exerciseId, entry });
    setEntryWeight(entry.weight.toString());
    setEntryReps(entry.reps.toString());
    setEntryDate(entry.date);
    setEntryNotes(entry.notes || "");
  };

  const openAddEntry = () => {
    setEntryWeight("");
    setEntryReps("1");
    setEntryDate(new Date().toISOString().split("T")[0]);
    setEntryNotes("");
    setShowAddEntry(true);
  };

  const selectedEx = exercises.find((e) => e.id === selectedExercise);

  // Stats
  const totalPRs = exercises.reduce((s, e) => s + e.entries.length, 0);
  const bestPRsThisMonth = exercises.reduce((count, ex) => {
    const best = getBestPR(ex);
    if (best && best.date.startsWith(new Date().toISOString().slice(0, 7))) return count + 1;
    return count;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Personal Records</h1>
          <p className="text-sm text-muted-foreground">Acompanhe sua evolução e registre seus PRs</p>
        </div>
        <Button onClick={() => setShowAddExercise(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Exercício
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{exercises.length}</p>
              <p className="text-xs text-muted-foreground">Exercícios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalPRs}</p>
              <p className="text-xs text-muted-foreground">Registros</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <ArrowUp className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{bestPRsThisMonth}</p>
              <p className="text-xs text-muted-foreground">PRs este mês</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {exercises.length > 0 ? Math.max(...exercises.map((e) => getBestPR(e)?.weight || 0)) : 0}kg
              </p>
              <p className="text-xs text-muted-foreground">Maior PR</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar exercício..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Exercise List */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Exercícios</h3>
          {filtered.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Trophy className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum exercício encontrado</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((ex) => {
              const best = getBestPR(ex);
              const isSelected = selectedExercise === ex.id;
              return (
                <Card
                  key={ex.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? "border-primary ring-1 ring-primary/30" : "hover:border-primary/20"
                  }`}
                  onClick={() => setSelectedExercise(isSelected ? null : ex.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getProgressIcon(ex)}
                        <div>
                          <p className="font-medium text-sm">{ex.name}</p>
                          <Badge variant="secondary" className="text-[10px] mt-1">{ex.category}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        {best ? (
                          <>
                            <p className="text-lg font-bold text-primary">{best.weight}kg</p>
                            <p className="text-[10px] text-muted-foreground">
                              {best.reps}RM • {format(new Date(best.date), "dd MMM yy", { locale: ptBR })}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">Sem registros</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* History Panel */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {selectedEx ? selectedEx.name : "Selecione um exercício"}
              </CardTitle>
              {selectedEx && (
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={openAddEntry} className="gap-1.5 text-xs">
                    <Plus className="h-3 w-3" /> Novo PR
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteTarget({ exerciseId: selectedEx.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedEx ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
                Clique em um exercício para ver o histórico completo
              </div>
            ) : selectedEx.entries.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground mb-3">Nenhum PR registrado</p>
                <Button size="sm" onClick={openAddEntry} className="gap-1.5">
                  <Plus className="h-3 w-3" /> Adicionar PR
                </Button>
              </div>
            ) : (
              <>
                {/* Progress bar visual */}
                <div className="mb-4 space-y-2">
                  <p className="text-xs text-muted-foreground">Evolução de carga</p>
                  <div className="flex items-end gap-1 h-20">
                    {[...selectedEx.entries]
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((entry, i, arr) => {
                        const max = Math.max(...arr.map((e) => e.weight));
                        const height = max > 0 ? (entry.weight / max) * 100 : 50;
                        const isLast = i === arr.length - 1;
                        return (
                          <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">{entry.weight}kg</span>
                            <div
                              className={`w-full rounded-t-sm transition-all ${
                                isLast ? "bg-primary" : "bg-primary/30"
                              }`}
                              style={{ height: `${height}%`, minHeight: 4 }}
                            />
                            <span className="text-[9px] text-muted-foreground">
                              {format(new Date(entry.date), "MMM yy", { locale: ptBR })}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Data</TableHead>
                      <TableHead className="text-xs">Peso</TableHead>
                      <TableHead className="text-xs">Reps</TableHead>
                      <TableHead className="text-xs">Notas</TableHead>
                      <TableHead className="text-xs w-20" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...selectedEx.entries]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((entry, i) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-xs">
                            {format(new Date(entry.date), "dd/MM/yyyy")}
                            {i === 0 && <Badge className="ml-2 text-[9px]" variant="default">Atual</Badge>}
                          </TableCell>
                          <TableCell className="font-semibold text-sm">{entry.weight}kg</TableCell>
                          <TableCell className="text-xs">{entry.reps}RM</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                            {entry.notes || "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditEntry(selectedEx.id, entry)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => setDeleteTarget({ exerciseId: selectedEx.id, entryId: entry.id })}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Exercise Dialog */}
      <Dialog open={showAddExercise} onOpenChange={setShowAddExercise}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Exercício</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do exercício</Label>
              <Input value={newExName} onChange={(e) => setNewExName(e.target.value)} placeholder="Ex: Back Squat" />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={newExCat} onValueChange={setNewExCat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddExercise(false)}>Cancelar</Button>
            <Button onClick={handleAddExercise} disabled={!newExName.trim()}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Entry Dialog */}
      <Dialog open={showAddEntry} onOpenChange={setShowAddEntry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo PR — {selectedEx?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input type="number" value={entryWeight} onChange={(e) => setEntryWeight(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Repetições</Label>
                <Input type="number" value={entryReps} onChange={(e) => setEntryReps(e.target.value)} placeholder="1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Input value={entryNotes} onChange={(e) => setEntryNotes(e.target.value)} placeholder="Observações..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEntry(false)}>Cancelar</Button>
            <Button onClick={handleAddEntry} disabled={!entryWeight}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={!!editEntry} onOpenChange={(o) => !o && setEditEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar PR</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input type="number" value={entryWeight} onChange={(e) => setEntryWeight(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Repetições</Label>
                <Input type="number" value={entryReps} onChange={(e) => setEntryReps(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Input value={entryNotes} onChange={(e) => setEntryNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEntry(null)}>Cancelar</Button>
            <Button onClick={handleEditEntry} disabled={!entryWeight}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.entryId ? "Excluir registro?" : "Excluir exercício?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.entryId
                ? "Este registro de PR será removido permanentemente."
                : "O exercício e todo seu histórico serão removidos permanentemente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget?.entryId
                  ? handleDeleteEntry()
                  : handleDeleteExercise(deleteTarget!.exerciseId)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PRsPage;
