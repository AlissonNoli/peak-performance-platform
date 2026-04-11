import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import type { WorkoutBlock } from "./WorkoutBlockCard";

interface WorkoutSimpleViewProps {
  blocks: WorkoutBlock[];
}

const WorkoutSimpleView = ({ blocks }: WorkoutSimpleViewProps) => {
  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <Card
          key={block.id}
          className={`border transition-all ${
            block.completed ? "border-primary/40 opacity-70" : "border-border"
          }`}
        >
          <CardContent className="p-4 sm:p-5">
            {/* Block header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                {block.number}
              </span>
              <h3 className="text-base font-bold">{block.title}</h3>
              {block.type && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                  {block.type}
                </Badge>
              )}
              {block.completed && (
                <Badge className="bg-primary/20 text-primary text-[10px] ml-auto">
                  <Check className="h-3 w-3 mr-0.5" /> Concluído
                </Badge>
              )}
            </div>

            {/* Table view for sets-based blocks */}
            {block.sets && block.sets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Exercício</th>
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Séries × Repetições</th>
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Carga</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Descrição / Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.sets.map((set, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="py-2.5 pr-4 font-medium">{block.title}</td>
                        <td className="py-2.5 pr-4 tabular-nums">
                          1×{set.reps}
                        </td>
                        <td className="py-2.5 pr-4 tabular-nums">
                          {set.loadKg ? `${set.loadKg} kg` : "—"}
                          {set.percentPR != null && set.prKg ? (
                            <span className="text-muted-foreground text-xs ml-1">
                              ({set.percentPR}% do PR)
                            </span>
                          ) : null}
                        </td>
                        <td className="py-2.5 text-muted-foreground text-xs">
                          {block.restSeconds
                            ? `Descanso ${Math.floor(block.restSeconds / 60)}'-${Math.ceil(block.restSeconds / 60) + 1}' entre séries`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Table view for description-based blocks */
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Exercício</th>
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Séries × Repetições</th>
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Carga</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Descrição / Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.description
                      .filter((line) => line.trim().length > 0)
                      .map((line, i) => {
                        const isNote = line.startsWith("*") || line.startsWith("depois");
                        if (isNote) {
                          return (
                            <tr key={i} className="border-b border-border last:border-0">
                              <td colSpan={4} className="py-2 text-muted-foreground italic text-xs">
                                {line}
                              </td>
                            </tr>
                          );
                        }

                        // Try to parse "NxN" or "N/N" patterns for sets/reps
                        const setsMatch = line.match(/^(\d+(?:\/\d+)?)\s+(.+)/);
                        const exerciseName = setsMatch ? setsMatch[2] : line;
                        const setsReps = setsMatch ? setsMatch[1] : "—";

                        return (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="py-2.5 pr-4 font-medium">{exerciseName}</td>
                            <td className="py-2.5 pr-4 tabular-nums">{setsReps}</td>
                            <td className="py-2.5 pr-4 text-muted-foreground">—</td>
                            <td className="py-2.5 text-muted-foreground text-xs">—</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Timer info */}
            {block.timerSeconds != null && block.timerSeconds > 0 && (
              <div className="mt-3 text-xs text-muted-foreground">
                ⏱ {block.timerLabel || "Timer"}: {Math.floor(block.timerSeconds / 60)}min
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WorkoutSimpleView;
