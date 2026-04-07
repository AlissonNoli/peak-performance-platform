import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Users, Plus, Pencil, Trash2, UserPlus, Inbox, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Group, AthleteProfile } from "@/lib/api/types";

/* ─── Hooks (stubs) ─── */
function useGroups() {
  const [groups] = useState<Group[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const createGroup = async (_name: string, _desc?: string) => { toast.info("API não conectada"); };
  const updateGroup = async (_id: string, _name: string, _desc?: string) => { toast.info("API não conectada"); };
  const deleteGroup = async (_id: string) => { toast.info("API não conectada"); };
  const addMember = async (_groupId: string, _athleteId: string) => { toast.info("API não conectada"); };
  return { groups, loading, error, createGroup, updateGroup, deleteGroup, addMember };
}

function useAthletes() {
  const [athletes] = useState<AthleteProfile[]>([]);
  return { athletes };
}

/* ─── Athlete fallback ─── */
const AthleteView = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <ShieldAlert className="h-12 w-12 text-muted-foreground/50" />
    <p className="text-muted-foreground text-sm">Disponível apenas para o seu coach.</p>
  </div>
);

/* ─── Create / Edit Dialog ─── */
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

  return (
    <Dialog>
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
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <DialogClose asChild>
            <Button onClick={() => { if (name.trim()) onSubmit(name.trim(), desc.trim() || undefined); }}>
              {initial ? "Guardar" : "Criar"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Add Member Dialog ─── */
const AddMemberDialog = ({
  groupId,
  athletes,
  onAdd,
}: {
  groupId: string;
  athletes: AthleteProfile[];
  onAdd: (groupId: string, athleteId: string) => void;
}) => {
  const [selected, setSelected] = useState("");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <UserPlus className="h-3.5 w-3.5" /> Adicionar atleta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Adicionar Atleta</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          {athletes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum atleta disponível.</p>
          ) : (
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger><SelectValue placeholder="Selecione um atleta" /></SelectTrigger>
              <SelectContent>
                {athletes.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <DialogClose asChild>
            <Button disabled={!selected} onClick={() => { if (selected) onAdd(groupId, selected); }}>Adicionar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Main ─── */
const GroupsPage = () => {
  const { role } = useAuth();
  if (role === "atleta") return <AthleteView />;

  const { groups, loading, error, createGroup, updateGroup, deleteGroup, addMember } = useGroups();
  const { athletes } = useAthletes();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Gestão de Grupos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Organize os seus atletas em grupos de treino.</p>
        </div>
        <GroupFormDialog
          trigger={<Button className="gap-1"><Plus className="h-4 w-4" /> Criar Grupo</Button>}
          onSubmit={(name, desc) => createGroup(name, desc)}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Erro ao carregar grupos: {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Inbox className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Ainda não há grupos. Crie o primeiro!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((g) => (
            <Card key={g.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{g.name}</CardTitle>
                    {g.description && <CardDescription className="mt-1">{g.description}</CardDescription>}
                  </div>
                  <div className="flex gap-1">
                    <GroupFormDialog
                      trigger={<Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>}
                      initial={{ name: g.name, description: g.description }}
                      onSubmit={(name, desc) => updateGroup(g.id, name, desc)}
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
                          <AlertDialogDescription>Esta ação não pode ser desfeita. O grupo "{g.name}" será removido permanentemente.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteGroup(g.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Apagar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{g.member_count ?? 0} membro(s)</p>
                  <AddMemberDialog groupId={g.id} athletes={athletes} onAdd={addMember} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
