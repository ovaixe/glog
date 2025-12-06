"use client";

import { useEffect } from "react";
import { useActiveWorkout } from "./ActiveWorkoutContext";
import { formatDuration } from "@/lib/utils";

export default function ActiveWorkoutModal() {
  const {
    activeWorkout,
    isModalOpen,
    toggleModal,
    cancelWorkout,
    finishWorkout,
    toggleSet,
    elapsedSeconds,
  } = useActiveWorkout();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  if (!isModalOpen || !activeWorkout) return null;

  const { plan, completedSets } = activeWorkout;
  const exercises = plan.exercises || [];

  const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets || 1), 0);
  const completedSetsCount = Object.values(completedSets).reduce(
    (sum, sets) => sum + sets.length,
    0
  );
  const progress = totalSets > 0 ? (completedSetsCount / totalSets) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:max-w-3xl flex flex-col animate-scale-in border-primary/20 shadow-2xl shadow-primary/10">
        {/* Header */}
        <div className="p-4 sm:p-6 sm:rounded-t-2xl border-b border-border gradient-card flex-shrink-0">
          <div className="flex flex-col mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 mb-1">
                <span className="animate-pulse text-primary">●</span>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  In Progress
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-30 text-center text-md md:text-xl font-bold bg-black/30 px-2 py-1 rounded-md border border-white/10">
                  {formatDuration(elapsedSeconds)}
                </div>

                <button
                  onClick={() => toggleModal(false)}
                  className="rounded-md px-3 py-1 bg-slate-800 p-2 hover:bg-slate-900 focus:outline-none focus:ring-0"
                  title="Minimize"
                >
                  ▼
                </button>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold">{plan.name}</h2>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span className="text-muted-foreground">
                {completedSetsCount} of {totalSets} sets completed
              </span>
              <span className="font-bold text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="progress-bar h-2 sm:h-3 bg-black/40">
              <div
                className="progress-fill shadow-[0_0_10px_rgba(74,158,255,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 min-h-0 bg-background/50 space-y-4">
          {exercises.map((exercise) => {
            const exerciseCompletedSets = completedSets[exercise.id] || [];
            const isFullyComplete =
              exerciseCompletedSets.length === (exercise.sets || 1);

            return (
              <div
                key={exercise.id}
                className={`p-4 transition-all duration-300 ${
                  isFullyComplete ? "card-active bg-green-500/5" : "card"
                }`}
              >
                <div className="flex flex-col mb-3">
                  <h3
                    className={`font-bold text-lg ${
                      isFullyComplete ? "text-green-400" : ""
                    }`}
                  >
                    {exercise.name}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="bg-black/20 px-3 py-1 rounded-lg">
                      {exercise.weight ? `${exercise.weight} kg` : "BW"}
                    </div>
                    <div className="bg-black/20 px-3 py-1 rounded-lg">{exercise.reps} reps</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  {Array.from({ length: exercise.sets || 1 }, (_, i) => {
                    const isSetComplete = exerciseCompletedSets.includes(i);
                    return (
                      <button
                        key={i}
                        onClick={() => toggleSet(exercise.id, i)}
                        className={`
                          flex-1 min-w-[60px] h-10 rounded-lg font-bold text-sm transition-all duration-200
                          flex items-center justify-center gap-1
                          ${
                            isSetComplete
                              ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)] scale-105"
                              : "bg-muted hover:bg-muted/80 border border-white/5"
                          }
                        `}
                      >
                        {isSetComplete ? "✓" : ""} {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-6 md:p-4 border-t border-border flex gap-3 flex-shrink-0 bg-card pb-safe">
          <button
            onClick={cancelWorkout}
            className="btn btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-1 py-3"
          >
            Cancel
          </button>
          <button
            onClick={finishWorkout}
            className="btn btn-primary flex-[2] py-3 text-lg font-bold shadow-lg shadow-primary/20"
          >
            Finish Workout
          </button>
        </div>
      </div>
    </div>
  );
}
