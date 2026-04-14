import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Wrench, Download, Upload, FileSpreadsheet, Timer, Inbox } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CrossFitTimer from "@/components/tools/CrossFitTimer";
import { toast } from "sonner";

/* ─── CSV helpers (stubs) ─── */
async function downloadCsv(path: string, filename: string) {
  toast.info("API não conectada — exportação indisponível por agora.");
  // const res = await apiFetch(path);
  // const blob = await res.blob();
  // const url = URL.createObjectURL(blob);
  // const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  void path; void filename;
}

async function uploadCsv(path: string, file: File, dryRun: boolean) {
  toast.info(`API não conectada — importação de "${file.name}" (dry_run=${dryRun}) indisponível.`);
  // const form = new FormData(); form.append("file", file);
  // const res = await apiFetchJson(path + `?dry_run=${dryRun ? 1 : 0}`, { method: "POST", body: form, headers: {} });
  void path;
}

/* ─── Reusable import card ─── */
const ImportCard = ({
  title,
  description,
  uploadPath,
  supportsDryRun,
}: {
  title: string;
  description: string;
  uploadPath: string;
  supportsDryRun?: boolean;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dryRun, setDryRun] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="h-4 w-4 text-secondary" /> {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            {file ? file.name : "Selecionar ficheiro CSV"}
          </Button>
        </div>
        {supportsDryRun && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="dry-run"
              checked={dryRun}
              onCheckedChange={(v) => setDryRun(!!v)}
            />
            <Label htmlFor="dry-run" className="text-sm">Dry run (simular sem gravar)</Label>
          </div>
        )}
        <Button
          disabled={!file}
          size="sm"
          onClick={() => file && uploadCsv(uploadPath, file, dryRun)}
        >
          Importar
        </Button>
      </CardContent>
    </Card>
  );
};

/* ─── Export card ─── */
const ExportCard = ({
  title,
  description,
  exportPath,
  filename,
}: {
  title: string;
  description: string;
  exportPath: string;
  filename: string;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-base flex items-center gap-2">
        <Download className="h-4 w-4 text-secondary" /> {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button variant="outline" size="sm" onClick={() => downloadCsv(exportPath, filename)} className="gap-1">
        <Download className="h-3.5 w-3.5" /> Exportar CSV
      </Button>
    </CardContent>
  </Card>
);

/* ─── Placeholder section ─── */
const PlaceholderSection = ({ title, icon: Icon }: { title: string; icon: React.ElementType }) => (
  <Card className="border-dashed">
    <CardContent className="flex flex-col items-center justify-center py-10 gap-2">
      <Icon className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{title} — brevemente</p>
    </CardContent>
  </Card>
);

/* ─── Main ─── */
const ToolsPage = () => {
  const { role } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          Ferramentas
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Importe, exporte e aceda a utilitários.
        </p>
      </div>

      {role === "coach" ? (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Treinos — CSV</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ExportCard
              title="Exportar Treinos"
              description="Descarregue todos os treinos em formato CSV."
              exportPath="/coach/workouts/export/"
              filename="treinos_export.csv"
            />
            <ImportCard
              title="Importar Treinos"
              description="Carregue um CSV com treinos. Use dry-run para simular primeiro."
              uploadPath="/coach/workouts/import/"
              supportsDryRun
            />
          </div>
          <CrossFitTimer />
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">PRs — CSV</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ExportCard
              title="Exportar PRs"
              description="Descarregue os seus Personal Records em CSV."
              exportPath="/athlete/prs/export/"
              filename="prs_export.csv"
            />
            <ImportCard
              title="Importar PRs"
              description="Carregue um CSV com os seus PRs."
              uploadPath="/athlete/prs/import/"
            />
          </div>
          <h2 className="text-lg font-semibold">Logs de Treino</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ExportCard
              title="Exportar Logs"
              description="Descarregue o histórico dos seus treinos."
              exportPath="/athlete/logs/export/"
              filename="logs_export.csv"
            />
          </div>
          <CrossFitTimer />
        </div>
      )}
    </div>
  );
};

export default ToolsPage;
