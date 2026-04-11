import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { Link2, QrCode, Copy, Check, UserMinus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const InviteAthletesPage = () => {
  const { userId, userName } = useAuth();
  const store = useStore();
  const { toast } = useToast();
  const [activeCode, setActiveCode] = useState<{ code: string; link: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const connectedAthletes = store.getAthletesForCoach(userId);

  const handleGenerate = () => {
    const invite = store.generateInviteCode(userId, userName);
    const link = `${window.location.origin}/join/${invite.code}`;
    setActiveCode({ code: invite.code, link });
    setCopied(false);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Link copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveAthlete = (athleteId: string, name: string) => {
    store.leaveCoach(userId, athleteId);
    toast({ title: `${name} desconectado` });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Convidar Atletas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gere um link ou QR Code para que seus atletas se conectem a você.
        </p>
      </div>

      {/* Generate invite */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" /> Gerar Convite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGenerate} className="w-full sm:w-auto">
            <QrCode className="mr-2 h-4 w-4" /> Gerar novo código
          </Button>

          {activeCode && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Link de convite</label>
                  <div className="flex gap-2">
                    <Input value={activeCode.link} readOnly className="text-xs" />
                    <Button size="icon" variant="outline" onClick={() => handleCopy(activeCode.link)}>
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="text-center">
                  <label className="text-xs text-muted-foreground mb-1 block">Código</label>
                  <Badge variant="secondary" className="text-lg px-4 py-1 font-mono">
                    {activeCode.code}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-center p-4 bg-foreground/5 rounded-lg">
                <div className="bg-white p-3 rounded-lg">
                  <QRCodeSVG value={activeCode.link} size={180} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                O atleta pode escanear o QR Code ou acessar o link para se conectar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connected athletes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Atletas Conectados
            <Badge variant="outline" className="ml-auto">{connectedAthletes.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connectedAthletes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum atleta conectado ainda. Gere um convite acima.
            </p>
          ) : (
            <div className="space-y-2">
              {connectedAthletes.map((conn) => {
                const athlete = store.getAthlete(conn.athleteId);
                return (
                  <div key={conn.athleteId} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                    <div>
                      <p className="text-sm font-medium">{athlete?.name ?? conn.athleteId}</p>
                      <p className="text-xs text-muted-foreground">
                        Conectado em {new Date(conn.connectedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover atleta?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {athlete?.name} será desconectado e perderá acesso aos treinos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveAthlete(conn.athleteId, athlete?.name ?? "")}>
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteAthletesPage;
