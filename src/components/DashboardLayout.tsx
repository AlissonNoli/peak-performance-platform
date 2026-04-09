import { useState } from "react";
import {
  Flame, Dumbbell, Trophy, Wrench, Users, LogOut, User,
  ChevronDown, ClipboardPlus, Menu, LayoutDashboard, Layers,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Link, Outlet } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";

const allLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["coach", "atleta"] as const },
  { to: "/dashboard/workouts", icon: Dumbbell, label: "Meus Treinos", roles: ["coach", "atleta"] as const },
  { to: "/dashboard/prs", icon: Trophy, label: "PRs", roles: ["coach", "atleta"] as const },
  { to: "/dashboard/tools", icon: Wrench, label: "Ferramentas", roles: ["coach", "atleta"] as const },
  { to: "/dashboard/groups", icon: Users, label: "Grupos", roles: ["coach"] as const },
  { to: "/dashboard/group-workouts", icon: Dumbbell, label: "Treinos Grupo", roles: ["coach"] as const },
  { to: "/dashboard/builder", icon: ClipboardPlus, label: "Criar Treino", roles: ["coach"] as const },
  { to: "/dashboard/templates", icon: Layers, label: "Templates", roles: ["coach"] as const },
];

const SidebarNav = ({ role, onNavigate }: { role: string; onNavigate?: () => void }) => {
  const links = allLinks.filter((l) => (l.roles as readonly string[]).includes(role));
  return (
    <nav className="flex-1 p-3 space-y-1">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/dashboard"}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
          activeClassName="bg-accent text-foreground font-medium"
          onClick={onNavigate}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
};

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role, setRole, userName } = useAuth();

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
          <Flame className="h-6 w-6 text-primary" />
          <span className="font-bold">App CrossFit</span>
        </div>
        <SidebarNav role={role} />
        {/* Role toggle */}
        <div className="p-4 border-t border-border space-y-2">
          <Label className="text-xs text-muted-foreground">Modo de visualização</Label>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${role === "atleta" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Atleta</span>
            <Switch checked={role === "coach"} onCheckedChange={(v) => setRole(v ? "coach" : "atleta")} />
            <span className={`text-xs ${role === "coach" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Coach</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="h-16 flex flex-row items-center gap-2 px-5 border-b border-border">
                  <Flame className="h-6 w-6 text-primary" />
                  <SheetTitle className="font-bold text-base">App CrossFit</SheetTitle>
                </SheetHeader>
                <SidebarNav role={role} onNavigate={() => setMobileOpen(false)} />
                <div className="p-4 border-t border-border space-y-2">
                  <Label className="text-xs text-muted-foreground">Modo</Label>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${role === "atleta" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Atleta</span>
                    <Switch checked={role === "coach"} onCheckedChange={(v) => setRole(v ? "coach" : "atleta")} />
                    <span className={`text-xs ${role === "coach" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Coach</span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <h2 className="font-semibold text-sm">Dashboard</h2>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden sm:inline text-xs text-muted-foreground">{userName}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Perfil</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/"><LogOut className="mr-2 h-4 w-4" /> Sair</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
