/* ─── In-Memory Mock Store ───
 * Shared state for groups, athletes, and workouts.
 * Will be replaced by API calls when backend is connected.
 */

import { useState, useCallback } from "react";
import type { Group, AthleteProfile } from "@/lib/api/types";

/* ─── Types ─── */

export interface SavedWorkout {
  id: string;
  title: string;
  description: string;
  date: string;
  assignTo: "individual" | "group";
  assignId: string;
  assignName: string;
  blocks: SavedBlock[];
  isTemplate: boolean;
  createdAt: string;
}

export interface SavedBlock {
  id: string;
  title: string;
  type: string;
  capTimeSeconds: number;
  rounds: number;
  description: string;
  exercises: SavedExercise[];
}

export interface SavedExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  loadType: "fixed" | "percentPR";
  loadValue: number;
  percentPR: number;
  restSeconds: number;
  videoUrl: string;
}

/* ─── Initial Data ─── */

const INITIAL_ATHLETES: AthleteProfile[] = [
  { id: "a1", user_id: "u1", name: "João Silva", email: "joao@email.com" },
  { id: "a2", user_id: "u2", name: "Maria Souza", email: "maria@email.com" },
  { id: "a3", user_id: "u3", name: "Pedro Costa", email: "pedro@email.com" },
  { id: "a4", user_id: "u4", name: "Ana Santos", email: "ana@email.com" },
  { id: "a5", user_id: "u5", name: "Lucas Oliveira", email: "lucas@email.com" },
];

const INITIAL_GROUPS: (Group & { members: string[] })[] = [
  { id: "g1", name: "BASE PRO", description: "Programa base para competição", member_count: 3, members: ["a1", "a2", "a3"] },
  { id: "g2", name: "Competição", description: "Atletas de competição avançados", member_count: 2, members: ["a1", "a4"] },
  { id: "g3", name: "Iniciantes", description: "Turma de iniciantes", member_count: 1, members: ["a5"] },
];

let _nextId = 100;
export const genId = () => `id-${_nextId++}`;

/* ─── Hooks ─── */

// Singleton state (persists across component mounts within same session)
let _groups = [...INITIAL_GROUPS];
let _athletes = [...INITIAL_ATHLETES];
let _workouts: SavedWorkout[] = [];
let _listeners: (() => void)[] = [];

// Coach-athlete connections
export interface CoachConnection {
  coachId: string;
  coachName: string;
  athleteId: string;
  connectedAt: string;
}

export interface InviteCode {
  code: string;
  coachId: string;
  coachName: string;
  createdAt: string;
}

let _connections: CoachConnection[] = [
  { coachId: "mock-user-1", coachName: "Coach Ricardo", athleteId: "a1", connectedAt: "2025-01-15" },
  { coachId: "mock-user-1", coachName: "Coach Ricardo", athleteId: "a2", connectedAt: "2025-02-10" },
];
let _inviteCodes: InviteCode[] = [];

function notify() {
  _listeners.forEach((l) => l());
}

export function useStore() {
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  // Subscribe on mount
  useState(() => {
    _listeners.push(rerender);
    return () => {
      _listeners = _listeners.filter((l) => l !== rerender);
    };
  });

  return {
    groups: _groups,
    athletes: _athletes,
    workouts: _workouts,

    // Group CRUD
    createGroup: (name: string, description?: string) => {
      _groups = [..._groups, { id: genId(), name, description, member_count: 0, members: [] }];
      notify();
    },
    updateGroup: (id: string, name: string, description?: string) => {
      _groups = _groups.map((g) => (g.id === id ? { ...g, name, description } : g));
      notify();
    },
    deleteGroup: (id: string) => {
      _groups = _groups.filter((g) => g.id !== id);
      notify();
    },

    // Member management
    addMember: (groupId: string, athleteId: string) => {
      _groups = _groups.map((g) => {
        if (g.id === groupId && !g.members.includes(athleteId)) {
          const members = [...g.members, athleteId];
          return { ...g, members, member_count: members.length };
        }
        return g;
      });
      notify();
    },
    removeMember: (groupId: string, athleteId: string) => {
      _groups = _groups.map((g) => {
        if (g.id === groupId) {
          const members = g.members.filter((m) => m !== athleteId);
          return { ...g, members, member_count: members.length };
        }
        return g;
      });
      notify();
    },

    // Athlete helpers
    getAthlete: (id: string) => _athletes.find((a) => a.id === id),
    getGroupMembers: (groupId: string) => {
      const group = _groups.find((g) => g.id === groupId);
      if (!group) return [];
      return group.members.map((mid) => _athletes.find((a) => a.id === mid)).filter(Boolean) as AthleteProfile[];
    },
    getNonMembers: (groupId: string) => {
      const group = _groups.find((g) => g.id === groupId);
      if (!group) return _athletes;
      return _athletes.filter((a) => !group.members.includes(a.id));
    },

    // Workout CRUD
    saveWorkout: (workout: SavedWorkout) => {
      const existing = _workouts.findIndex((w) => w.id === workout.id);
      if (existing >= 0) {
        _workouts = _workouts.map((w, i) => (i === existing ? workout : w));
      } else {
        _workouts = [..._workouts, workout];
      }
      notify();
    },
    deleteWorkout: (id: string) => {
      _workouts = _workouts.filter((w) => w.id !== id);
      notify();
    },
    getWorkoutsForGroup: (groupId: string) => {
      return _workouts.filter((w) => w.assignTo === "group" && w.assignId === groupId);
    },
    getTemplates: () => _workouts.filter((w) => w.isTemplate),

    // Connection management
    connections: _connections,
    inviteCodes: _inviteCodes,

    generateInviteCode: (coachId: string, coachName: string) => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const invite: InviteCode = { code, coachId, coachName, createdAt: new Date().toISOString() };
      _inviteCodes = [..._inviteCodes, invite];
      notify();
      return invite;
    },

    joinCoach: (code: string, athleteId: string) => {
      const invite = _inviteCodes.find((i) => i.code === code);
      if (!invite) return { success: false, error: "Código inválido" };
      const already = _connections.find((c) => c.coachId === invite.coachId && c.athleteId === athleteId);
      if (already) return { success: false, error: "Já está conectado a este coach" };
      _connections = [..._connections, {
        coachId: invite.coachId,
        coachName: invite.coachName,
        athleteId: athleteId,
        connectedAt: new Date().toISOString(),
      }];
      notify();
      return { success: true, coachName: invite.coachName };
    },

    leaveCoach: (coachId: string, athleteId: string) => {
      _connections = _connections.filter((c) => !(c.coachId === coachId && c.athleteId === athleteId));
      notify();
    },

    getCoachesForAthlete: (athleteId: string) => {
      return _connections.filter((c) => c.athleteId === athleteId);
    },

    getAthletesForCoach: (coachId: string) => {
      return _connections.filter((c) => c.coachId === coachId);
    },
  };
}
