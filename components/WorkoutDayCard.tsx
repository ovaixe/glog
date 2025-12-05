"use client";

import { WorkoutPlan } from "@/lib/types";
import { useActiveWorkout } from "./ActiveWorkoutContext";

interface WorkoutDayCardProps {
  day: string;
  dayIndex: number;
  plan?: WorkoutPlan;
  onClick: () => void;
}

export default function WorkoutDayCard({
  day,
  dayIndex,
  plan,
  onClick,
}: WorkoutDayCardProps) {
  const { activeWorkout, startWorkout, toggleModal } = useActiveWorkout();
  const exerciseCount = plan?.exercises?.length || 0;
  const hasWorkout = !!plan;
  const isActive = activeWorkout?.plan.id === plan?.id;

  return (
    <div
      onClick={onClick}
      className="day-card animate-slide-up p-4 sm:p-6"
      style={{ animationDelay: `${dayIndex * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <h3 className="text-base sm:text-lg font-semibold">{day}</h3>
        {hasWorkout && (
          <span className="badge badge-primary text-[10px] sm:text-xs">
            {exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"}
          </span>
        )}
      </div>

      {hasWorkout ? (
        <div className="flex flex-col gap-4 h-full">
          <div className="">
            <p className="text-xs sm:text-sm font-medium text-primary mb-1.5 sm:mb-2">
              {plan.name}
            </p>
            {exerciseCount > 0 && (
              <div className="space-y-0.5 sm:space-y-1">
                {plan.exercises?.slice(0, 3).map((exercise) => (
                  <p
                    key={exercise.id}
                    className="text-[10px] sm:text-xs text-muted-foreground truncate"
                  >
                    • {exercise.name}
                    {exercise.sets && exercise.reps && (
                      <span className="ml-1">
                        ({exercise.sets}×{exercise.reps})
                      </span>
                    )}
                  </p>
                ))}
                {exerciseCount > 3 && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground italic">
                    +{exerciseCount - 3} more
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isActive) {
                toggleModal(true);
              } else {
                startWorkout(plan);
              }
            }}
            className={`w-full btn text-xs sm:text-sm py-1.5 sm:py-2 font-bold flex items-center justify-center gap-2 transition-all ${
              isActive ? "btn-secondary" : "btn-primary"
            }`}
          >
            {isActive ? (
              <>
                <span className="animate-spin">↻</span> In Progress
              </>
            ) : (
              <>▶ Start</>
            )}
          </button>
        </div>
      ) : (
        <div className="text-center py-3 sm:py-4">
          <div className="text-2xl sm:text-4xl mb-1 sm:mb-2 opacity-50">➕</div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            No workout planned
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
            Click to add
          </p>
        </div>
      )}
    </div>
  );
}
