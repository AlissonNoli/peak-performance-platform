import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Users, Plus, Pencil, Trash2, UserPlus, UserMinus, Inbox, ShieldAlert, ChevronDown, ChevronUp, Mail,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

/* ─── Athlete fallback ─── */
const AthleteView = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <ShieldAlert className="h-12 w-12 text-muted-foreground/50" />
    <p className="text-muted-foreground text-sm">Disponível apenas para o seu coach.</p>
  </div>
);

/* ─── Create / Edit Group Dialog ─── */
const GroupFormDialog = ({
  trigger,
  initial,
  onSubmit,
}: {
  trigger: React.ReactNode;
  initial?: { name: string; description?: string };
  onSubmit: (name: string, desc?: string) => void;
}) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim(), desc.trim() || undefined);
      setOpen(false);
      toast.success(initial ? "Grupo atualizado!" : "Grupo criado!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) { setName(initial?.name ?? ""); setDesc(initial?.description ?? ""); } }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar Grupo" : "Criar Grupo"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nome do grupo</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Turma 08h" />
          </div>
          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Notas sobre o grupo" rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>{initial ? "Guardar" : "Criar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Group Card with Members ─── */
const GroupCard = ({ groupId }: { groupId: string }) => {
  const store = useStore();
  const group = store.groups.find((g) => g.id === groupId);
  const [expanded, setExpanded] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState("");

  if (!group) return null;

  const members = store.getGroupMembers(groupId);
  const nonMembers = store.getNonMembers(groupId);

  const handleAdd = () => {
    if (selectedAthlete) {
      store.addMember(groupId, selectedAthlete);
      setSelectedAthlete("");
      setAddOpen(false);
      toast.success("Atleta adicionado ao grupo!");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">{group.name}</CardTitle>
            {group.description && <CardDescription className="mt-1">{group.description}</CardDescription>}
          </div>
          <div className="flex gap-1 shrink-0">
            <GroupFormDialog
              trigger={<Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>}
              initial={{ name: group.name, description: group.description }}
              onSubmit={(name, desc) => store.updateGroup(group.id, name, desc)}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apagar grupo?</AlertDialogTitle>
                  <AlertDialogDescription>Esta ação não pode ser desfeita. O grupo "{group.name}" será removido permanentemente.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { store.deleteGroup(group.id); toast.success("Grupo apagado!"); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Apagar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Member count + toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" /> {members.length} membro{members.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {/* Member list */}
        {expanded && (
          <div className="space-y-2 pt-1">
            {members.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">Nenhum membro neste grupo.</p>
            ) : (
              members.map((athlete) => (
                <div key={athlete.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">{athlete.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{athlete.name}</p>
                      {athlete.email && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {athlete.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive shrink-0">
                        <UserMinus className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover atleta?</AlertDialogTitle>
                        <AlertDialogDescription>"{athlete.name}" será removido do grupo "{group.name}".</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { store.removeMember(groupId, athlete.id); toast.success("Atleta removido!"); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            )}

            {/* Add member */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-1 mt-1">
                  <UserPlus className="h-3.5 w-3.5" /> Adicionar Atleta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Adicionar Atleta ao {group.name}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  {nonMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Todos os atletas já fazem parte deste grupo.</p>
                  ) : (
                    <Select value={selectedAthlete} onValueChange={setSelectedAthlete}>
                      <SelectTrigger><SelectValue placeholder="Selecione um atleta" /></SelectTrigger>
                      <SelectContent>
                        {nonMembers.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
                  <Button disabled={!selectedAthlete} onClick={handleAdd}>Adicionar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* ─── Main ─── */
const GroupsPage = () => {
  const { role } = useAuth();
  if (role === "atleta") return <AthleteView />;

  const store = useStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Gestão de Grupos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Organize os seus atletas em grupos de treino. Adicione, remova e gira membros.</p>
        </div>
        <GroupFormDialog
          trigger={<Button className="gap-1"><Plus className="h-4 w-4" /> Criar Grupo</Button>}
          onSubmit={(name, desc) => store.createGroup(name, desc)}
        />
      </div>

      {store.groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Inbox className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Ainda não há grupos. Crie o primeiro!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {store.groups.map((g) => (
            <GroupCard key={g.id} groupId={g.id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
