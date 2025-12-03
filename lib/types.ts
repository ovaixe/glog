export interface WorkoutPlan {
  id: number;
  day_of_week: number;
  name: string;
  created_at: string;
  exercises?: Exercise[];
}

export interface Exercise {
  id: number;
  workout_plan_id: number;
  name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  order_index: number;
  done?: boolean; // Client-side state for marking exercises as done
}

export interface WorkoutHistory {
  id: number;
  workout_plan_id: number;
  completed_at: string;
  exercises_data: string;
  workout_name?: string;
  day_of_week?: number;
}

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
