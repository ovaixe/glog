"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { WorkoutPlan } from "@/lib/types";
import { useToast } from "./Toast";
import { useConfirm } from "./Confirm";
import { fetchWithAuth } from "@/lib/api";

interface ActiveWorkoutState {
  plan: WorkoutPlan;
  startTime: number;
  completedSets: Record<number, number[]>; // exerciseId -> array of completed set indices
}

interface ActiveWorkoutContextType {
  activeWorkout: ActiveWorkoutState | null;
  isModalOpen: boolean;
  startWorkout: (plan: WorkoutPlan) => void;
  cancelWorkout: () => void;
  finishWorkout: () => Promise<void>;
  toggleSet: (exerciseId: number, setIndex: number) => void;
  toggleModal: (isOpen?: boolean) => void;
  elapsedSeconds: number;
}

const ActiveWorkoutContext = createContext<
  ActiveWorkoutContextType | undefined
>(undefined);

export function useActiveWorkout() {
  const context = useContext(ActiveWorkoutContext);
  if (!context) {
    throw new Error(
      "useActiveWorkout must be used within ActiveWorkoutProvider"
    );
  }
  return context;
}

const STORAGE_KEY = "glog_active_workout";

export function ActiveWorkoutProvider({ children }: { children: ReactNode }) {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setActiveWorkout(parsed);
        // Don't auto-open modal, let user resume via floating button
      } catch (e) {
        console.error("Failed to parse active workout", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (!activeWorkout) {
      setElapsedSeconds(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.floor((now - activeWorkout.startTime) / 1000);
      setElapsedSeconds(diff);
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout]);

  // Save to local storage whenever state changes
  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [activeWorkout]);

  const startWorkout = useCallback(
    (plan: WorkoutPlan) => {
      const newState: ActiveWorkoutState = {
        plan,
        startTime: Date.now(),
        completedSets: {},
      };
      setActiveWorkout(newState);
      setIsModalOpen(true);
      showToast(`Started ${plan.name}`, "success");
    },
    [showToast]
  );

  const cancelWorkout = useCallback(async () => {
    const confirmed = await confirm({
      title: "Cancel Workout",
      message:
        "Are you sure you want to cancel this workout? All progress will be lost.",
      confirmText: "Yes, Cancel",
      cancelText: "No, Keep Going",
      type: "danger",
    });

    if (confirmed) {
      setActiveWorkout(null);
      setIsModalOpen(false);
      showToast("Workout canceled", "info");
    }
  }, [confirm, showToast]);

  const toggleSet = useCallback((exerciseId: number, setIndex: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;

      const currentSets = prev.completedSets[exerciseId] || [];
      let newSets;

      if (currentSets.includes(setIndex)) {
        newSets = currentSets.filter((s) => s !== setIndex);
      } else {
        newSets = [...currentSets, setIndex];
      }

      return {
        ...prev,
        completedSets: {
          ...prev.completedSets,
          [exerciseId]: newSets,
        },
      };
    });
  }, []);

  const finishWorkout = useCallback(async () => {
    if (!activeWorkout) return;

    // Filter exercises that have at least one set completed
    const exercisesWithProgress =
      activeWorkout.plan.exercises
        ?.map((ex) => {
          const completed = activeWorkout.completedSets[ex.id] || [];
          return {
            ...ex,
            sets: completed.length, // Record actual completed sets
          };
        })
        .filter((ex) => ex.sets > 0) || [];

    if (exercisesWithProgress.length === 0) {
      showToast("Complete at least one set to finish", "warning");
      return;
    }

    try {
      const response = await fetchWithAuth("/api/workout-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutPlanId: activeWorkout.plan.id,
          exercisesData: exercisesWithProgress,
          completedAt: new Date().toISOString(),
          durationSeconds: elapsedSeconds,
        }),
      });

      if (!response.ok) throw new Error("Failed to save workout");

      setActiveWorkout(null);
      setIsModalOpen(false);
      showToast("Workout finished! Great job! 🎉", "success");
    } catch (error) {
      console.error("Error finishing workout:", error);
      showToast("Failed to save workout", "error");
    }
  }, [activeWorkout, elapsedSeconds, showToast]);

  const toggleModal = useCallback((isOpen?: boolean) => {
    setIsModalOpen((prev) => (isOpen !== undefined ? isOpen : !prev));
  }, []);

  return (
    <ActiveWorkoutContext.Provider
      value={{
        activeWorkout,
        isModalOpen,
        startWorkout,
        cancelWorkout,
        finishWorkout,
        toggleSet,
        toggleModal,
        elapsedSeconds,
      }}
    >
      {children}
    </ActiveWorkoutContext.Provider>
  );
}
