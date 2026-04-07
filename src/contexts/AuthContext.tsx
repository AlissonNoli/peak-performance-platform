import { createContext, useContext, useState, type ReactNode } from "react";
import type { UserRole } from "@/lib/api/types";

interface AuthState {
  role: UserRole;
  setRole: (r: UserRole) => void;
  userId: string;
  userName: string;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("coach");

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        userId: "mock-user-1",
        userName: role === "coach" ? "Coach Ricardo" : "João Atleta",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
