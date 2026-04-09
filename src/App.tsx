import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import MyWorkoutsPage from "./pages/dashboard/MyWorkoutsPage";
import WorkoutExecution from "./pages/dashboard/WorkoutExecution";
import WorkoutBuilder from "./pages/dashboard/WorkoutBuilder";
import GroupsPage from "./pages/dashboard/GroupsPage";
import GroupWorkoutsPage from "./pages/dashboard/GroupWorkoutsPage";
import ToolsPage from "./pages/dashboard/ToolsPage";
import PRsPage from "./pages/dashboard/PRsPage";
import TemplatesPage from "./pages/dashboard/TemplatesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="workouts" element={<MyWorkoutsPage />} />
            <Route path="prs" element={<PRsPage />} />
            <Route path="tools" element={<ToolsPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="group-workouts" element={<GroupWorkoutsPage />} />
            <Route path="builder" element={<WorkoutBuilder />} />
            <Route path="templates" element={<TemplatesPage />} />
          </Route>
          <Route path="/dashboard/workout" element={<WorkoutExecution />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
