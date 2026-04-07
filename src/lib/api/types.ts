/* ─── Shared API Types ─── */

export type UserRole = "coach" | "atleta";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Workout {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date
  coach_name?: string;
  status?: "done" | "scheduled" | "missed";
  duration?: string;
  type?: string;
  blocks?: WorkoutBlock[];
}

export interface WorkoutBlock {
  id: string;
  title: string;
  block_type?: string;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  load_type?: "fixed" | "percentage";
  load_value?: number;
  rest_seconds?: number;
  video_url?: string;
  image_url?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  member_count?: number;
  created_at?: string;
}

export interface GroupMember {
  id: string;
  athlete_id: string;
  athlete_name: string;
  athlete_email?: string;
}

export interface AthleteProfile {
  id: string;
  user_id: string;
  name: string;
  email?: string;
}

export interface ApiError {
  detail?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string | null;
  previous?: string | null;
}
