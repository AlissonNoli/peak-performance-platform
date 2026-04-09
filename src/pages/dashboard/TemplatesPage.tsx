import { useState } from "react";
import { useStore, type SavedWorkout, genId } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Copy, Edit, MoreVertical, Plus, Search, Trash2, Dumbbell, Clock, Layers,
} from "lucide-react";
import { toast } from "sonner";

const TemplatesPage = () => {
  const store = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [assignId, setAssignId] = useState<string | null>(null);
  const [assignTarget, setAssignTarget] = useState<{ type: "individual" | "group"; id: string }>({ type: "group", id: "" });

  const templates = store.getTemplates().filter(
    (t) => t.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDuplicate = (template: SavedWorkout) => {
    const newWorkout: SavedWorkout = {
      ...template,
      id: genId(),
      title: `${template.title} (Cópia)`,
      isTemplate: true,
      createdAt: new Date().toISOString(),
    };
    store.saveWorkout(newWorkout);
    toast.success("Template duplicado com sucesso!");
  };

  const handleDelete = () => {
    if (deleteId) {
      store.deleteWorkout(deleteId);
      setDeleteId(null);
      toast.success("Template removido.");
    }
  };

  const handleAssign = () => {
    if (!assignId || !assignTarget.id) return;
    const template = store.workouts.find((w) => w.id === assignId);
    if (!template) return;

    const targetName = assignTarget.type === "group"
      ? store.groups.find((g) => g.id === assignTarget.id)?.name || ""
      : store.athletes.find((a) => a.id === assignTarget.id)?.name || "";

    const newWorkout: SavedWorkout = {
      ...template,
      id: genId(),
      isTemplate: false,
      assignTo: assignTarget.type,
      assignId: assignTarget.id,
      assignName: targetName,
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };
    store.saveWorkout(newWorkout);
    setAssignId(null);
    setAssignTarget({ type: "group", id: "" });
    toast.success(`Treino atribuído a ${targetName}!`);
  };

  const totalExercises = (t: SavedWorkout) =>
    t.blocks.reduce((sum, b) => sum + b.exercises.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Templates de Treino</h1>
          <p className="text-sm text-muted-foreground">
            Crie e gerencie modelos reutilizáveis para seus treinos
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/builder?template=true")} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Template
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg">Nenhum template encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Crie seu primeiro template de treino para reutilizar em diferentes grupos e atletas.
            </p>
            <Button onClick={() => navigate("/dashboard/builder?template=true")} className="mt-4 gap-2">
              <Plus className="h-4 w-4" /> Criar Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="group hover:border-primary/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{template.title}</CardTitle>
                    {template.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/dashboard/builder?edit=${template.id}`)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                        <Copy className="mr-2 h-4 w-4" /> Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setAssignId(template.id)}>
                        <Dumbbell className="mr-2 h-4 w-4" /> Atribuir
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(template.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" />
                    {template.blocks.length} bloco{template.blocks.length !== 1 && "s"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Dumbbell className="h-3.5 w-3.5" />
                    {totalExercises(template)} exercício{totalExercises(template) !== 1 && "s"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {template.blocks.slice(0, 3).map((b) => (
                    <Badge key={b.id} variant="secondary" className="text-[10px] font-normal">
                      {b.type || b.title}
                    </Badge>
                  ))}
                  {template.blocks.length > 3 && (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      +{template.blocks.length - 3}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => navigate(`/dashboard/builder?edit=${template.id}`)}
                  >
                    <Edit className="mr-1.5 h-3 w-3" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setAssignId(template.id)}
                  >
                    <Dumbbell className="mr-1.5 h-3 w-3" /> Atribuir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Dialog */}
      <Dialog open={!!assignId} onOpenChange={(o) => !o && setAssignId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={assignTarget.type === "group" ? "default" : "outline"}
                size="sm"
                onClick={() => setAssignTarget({ type: "group", id: "" })}
              >
                Grupo
              </Button>
              <Button
                variant={assignTarget.type === "individual" ? "default" : "outline"}
                size="sm"
                onClick={() => setAssignTarget({ type: "individual", id: "" })}
              >
                Atleta
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {assignTarget.type === "group"
                ? store.groups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setAssignTarget({ type: "group", id: g.id })}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        assignTarget.id === g.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-accent"
                      }`}
                    >
                      {g.name}
                      <span className="text-xs opacity-70 ml-2">{g.member_count} membros</span>
                    </button>
                  ))
                : store.athletes.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAssignTarget({ type: "individual", id: a.id })}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        assignTarget.id === a.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-accent"
                      }`}
                    >
                      {a.name}
                    </button>
                  ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignId(null)}>Cancelar</Button>
            <Button onClick={handleAssign} disabled={!assignTarget.id}>Atribuir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O template será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TemplatesPage;
