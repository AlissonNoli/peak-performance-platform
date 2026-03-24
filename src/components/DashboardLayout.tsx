import { useState } from "react";
import { Flame, Dumbbell, Trophy, Wrench, Users, LogOut, User, ChevronDown, ClipboardPlus, Menu, LayoutDashboard, X } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Link, Outlet } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const sidebarLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dashboard/workouts", icon: Dumbbell, label: "Meus Treinos" },
  { to: "/dashboard/prs", icon: Trophy, label: "PRs" },
  { to: "/dashboard/tools", icon: Wrench, label: "Ferramentas" },
  { to: "/dashboard/groups", icon: Users, label: "Grupos" },
  { to: "/dashboard/builder", icon: ClipboardPlus, label: "Criar Treino" },
];

const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
  <nav className="flex-1 p-3 space-y-1">
    {sidebarLinks.map((link) => (
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

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
          <Flame className="h-6 w-6 text-primary" />
          <span className="font-bold">App CrossFit</span>
        </div>
        <SidebarNav />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
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
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
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
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" /> Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/" className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
