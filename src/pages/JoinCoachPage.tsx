import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const JoinCoachPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const store = useStore();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setMessage("Código inválido.");
      return;
    }

    // Simulate athlete joining (using a1 for demo)
    const timer = setTimeout(() => {
      const result = store.joinCoach(code.toUpperCase(), "a1");
      if (result.success) {
        setStatus("success");
        setMessage(`Conectado ao coach ${result.coachName}!`);
        toast({ title: "Conectado com sucesso!" });
      } else {
        setStatus("error");
        setMessage(result.error ?? "Erro desconhecido");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Convite de Coach</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-muted-foreground">Conectando...</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="font-medium text-lg">{message}</p>
              <Button onClick={() => navigate("/dashboard")} className="mt-2">
                Ir para o Dashboard
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="font-medium">{message}</p>
              <Button variant="outline" onClick={() => navigate("/dashboard")} className="mt-2">
                Voltar ao Dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinCoachPage;
