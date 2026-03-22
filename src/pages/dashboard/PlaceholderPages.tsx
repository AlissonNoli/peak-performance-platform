const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center space-y-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">Em construção — disponível em breve.</p>
    </div>
  </div>
);

export const PRsPage = () => <PlaceholderPage title="Personal Records" />;
export const ToolsPage = () => <PlaceholderPage title="Ferramentas" />;
export const GroupsPage = () => <PlaceholderPage title="Gestão de Grupos" />;
