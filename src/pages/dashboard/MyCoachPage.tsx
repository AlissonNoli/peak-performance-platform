import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link2, UserX, ShieldCheck, UserPlus } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MyCoachPage = () => {
  const { userId } = useAuth();
  const store = useStore();
  const { toast } = useToast();
  const [code, setCode] = useState("");

  // For demo, athlete id mapped from userId
  const athleteId = userId === "mock-user-1" ? "a1" : "a1";
  const coaches = store.getCoachesForAthlete(athleteId);

  const handleJoin = () => {
    if (!code.trim()) return;
    const result = store.joinCoach(code.trim().toUpperCase(), athleteId);
    if (result.success) {
      toast({ title: "Conectado!", description: `Você agora é atleta de ${result.coachName}` });
      setCode("");
    } else {
      toast({ title: "Erro", description: result.error, variant: "destructive" });
    }
  };

  const handleLeave = (coachId: string, coachName: string) => {
    store.leaveCoach(coachId, athleteId);
    toast({ title: "Desconectado", description: `Você saiu do coach ${coachName}` });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Meu Coach</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Conecte-se a um coach usando o código ou link de convite.
        </p>
      </div>

      {/* Join via code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" /> Conectar a um Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o código do convite (ex: AB12CD)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono"
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
            <Button onClick={handleJoin} disabled={!code.trim()}>
              <Link2 className="mr-2 h-4 w-4" /> Conectar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Peça ao seu coach o código de convite ou escaneie o QR Code que ele gerar.
          </p>
        </CardContent>
      </Card>

      {/* Connected coaches */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Coaches Conectados
            <Badge variant="outline" className="ml-auto">{coaches.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coaches.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Você ainda não está conectado a nenhum coach.
            </p>
          ) : (
            <div className="space-y-2">
              {coaches.map((conn) => (
                <div key={conn.coachId} className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{conn.coachName}</p>
                      <p className="text-xs text-muted-foreground">
                        Conectado em {new Date(conn.connectedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                        <UserX className="mr-2 h-4 w-4" /> Sair
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deixar de treinar com {conn.coachName}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Você perderá acesso aos treinos atribuídos por este coach. Pode reconectar-se a qualquer momento com um novo código.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleLeave(conn.coachId, conn.coachName)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Confirmar saída
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyCoachPage;
