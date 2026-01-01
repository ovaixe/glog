"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { fetchWithAuth } from "@/lib/api";
import { WorkoutPlan, Exercise } from "@/lib/types";
import ExerciseItem from "./ExerciseItem";
import { useToast } from "./Toast";
import { useConfirm } from "./Confirm";
import { useActiveWorkout } from "./ActiveWorkoutContext";

interface WorkoutModalProps {
  dayIndex: number;
  dayName: string;
  existingPlan?: WorkoutPlan;
  onClose: () => void;
}

export default function WorkoutModal({
  dayIndex,
  dayName,
  existingPlan,
  onClose,
}: WorkoutModalProps) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { startWorkout } = useActiveWorkout();
  const [workoutName, setWorkoutName] = useState(existingPlan?.name || "");
  const [exercises, setExercises] = useState<Exercise[]>(
    existingPlan?.exercises || []
  );
  const [isEditing, setIsEditing] = useState(!existingPlan);
  const [currentPlanId, setCurrentPlanId] = useState<number | undefined>(
    existingPlan?.id
  );
  const [showAddForm, setShowAddForm] = useState(false);

  // New exercise form state
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseSets, setNewExerciseSets] = useState("");
  const [newExerciseReps, setNewExerciseReps] = useState("");
  const [newExerciseWeight, setNewExerciseWeight] = useState("");

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleAddExercise = async () => {
    if (!newExerciseName.trim()) return;

    if (!currentPlanId) {
      // If no plan exists, create it first
      try {
        const response = await fetchWithAuth("/api/workout-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dayOfWeek: dayIndex,
            name: workoutName || `${dayName} Workout`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create workout plan");
        }
        const plan = await response.json();
        setCurrentPlanId(plan.id);

        // Now add the exercise
        await addExerciseToPlan(plan.id);
      } catch (error) {
        console.error("Error creating workout plan:", error);
        showToast(
          error instanceof Error
            ? error.message
            : "Failed to create workout plan",
          "error"
        );
      }
    } else {
      await addExerciseToPlan(currentPlanId);
    }
  };

  const addExerciseToPlan = async (planId: number) => {
    try {
      const response = await fetchWithAuth("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workout_plan_id: planId,
          name: newExerciseName,
          sets: newExerciseSets ? parseInt(newExerciseSets) : null,
          reps: newExerciseReps ? parseInt(newExerciseReps) : null,
          weight: newExerciseWeight ? parseFloat(newExerciseWeight) : null,
          order_index: exercises.length,
        }),
      });

      if (!response.ok) throw new Error("Failed to add exercise");
      const exercise = await response.json();

      setExercises([...exercises, exercise]);
      // Reset form
      setNewExerciseName("");
      setNewExerciseSets("");
      setNewExerciseReps("");
      setNewExerciseWeight("");
    } catch (error) {
      console.error("Error adding exercise:", error);
      showToast("Failed to add exercise", "error");
    }
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    const exercise = exercises.find((ex) => ex.id === exerciseId);

    const confirmed = await confirm({
      title: "Delete Exercise",
      message: `Are you sure you want to delete "${
        exercise?.name || "this exercise"
      }"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      const response = await fetchWithAuth(`/api/exercises?id=${exerciseId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete exercise");
      setExercises(exercises.filter((ex) => ex.id !== exerciseId));
    } catch (error) {
      console.error("Error deleting exercise:", error);
      showToast("Failed to delete exercise", "error");
    }
  };

  const handleCreateOrUpdateWorkout = async () => {
    if (!workoutName.trim()) {
      showToast("Please enter a workout name", "warning");
      return;
    }

    try {
      if (existingPlan) {
        // Update existing plan
        const response = await fetchWithAuth("/api/workout-plans", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: existingPlan.id,
            name: workoutName,
          }),
        });

        if (!response.ok) throw new Error("Failed to update workout name");
        setIsEditing(false);
      } else {
        // Create new plan
        const response = await fetchWithAuth("/api/workout-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dayOfWeek: dayIndex,
            name: workoutName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create workout plan");
        }
        const plan = await response.json();
        setCurrentPlanId(plan.id);
        setIsEditing(false);
        // Don't close the modal - let user add exercises
        // Parent will refresh when modal closes naturally
      }
    } catch (error) {
      console.error("Error saving workout:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to save workout",
        "error"
      );
    }
  };

  const handleDeleteWorkout = async () => {
    if (!existingPlan) return;

    const confirmed = await confirm({
      title: "Delete Workout Plan",
      message:
        "Are you sure you want to delete this workout plan? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      const response = await fetchWithAuth(
        `/api/workout-plans?id=${existingPlan.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete workout");
      onClose();
    } catch (error) {
      console.error("Error deleting workout:", error);
      showToast("Failed to delete workout", "error");
    }
  };

  const handleUpdateExercise = async (updatedExercise: Exercise) => {
    try {
      const response = await fetchWithAuth("/api/exercises", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedExercise),
      });

      if (!response.ok) throw new Error("Failed to update exercise");

      setExercises(
        exercises.map((ex) =>
          ex.id === updatedExercise.id ? updatedExercise : ex
        )
      );
    } catch (error) {
      console.error("Error updating exercise:", error);
      showToast("Failed to update exercise", "error");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = exercises.findIndex((ex) => ex.id === active.id);
    const newIndex = exercises.findIndex((ex) => ex.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Update local state immediately for better UX
    const newExercises = arrayMove(exercises, oldIndex, newIndex);
    setExercises(newExercises);

    // Persist to database
    try {
      const exerciseIds = newExercises.map((ex) => ex.id);
      const response = await fetchWithAuth("/api/exercises", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reorder: true,
          exercise_ids: exerciseIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save exercise order");
      }
    } catch (error) {
      console.error("Error reordering exercises:", error);
      // Revert on error
      setExercises(exercises);
      showToast("Failed to save exercise order", "error");
    }
  };

  // Configure sensors for drag and drop
  // Add activation distance to prevent accidental drags when clicking buttons
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before activating drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:max-w-3xl flex flex-col animate-scale-in">
        {/* Header */}
        <div className="p-4 sm:p-6 sm:rounded-t-2xl border-b border-border gradient-card flex-shrink-0">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold mb-1">{dayName}</h2>
              {isEditing ? (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    placeholder="Workout name"
                    className="input flex-1 text-sm"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleCreateOrUpdateWorkout()
                    }
                  />
                  <button
                    onClick={handleCreateOrUpdateWorkout}
                    className="btn btn-primary text-xs sm:text-sm py-1.5"
                  >
                    {existingPlan ? "Save" : "Create"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-base sm:text-lg text-primary font-medium">
                    {workoutName || "Enter workout name"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {existingPlan && (
                <button
                  onClick={() => setIsEditing((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✏️
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 min-h-0 bg-background/50">
          {exercises.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={exercises.map((ex) => ex.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 sm:space-y-3">
                  {exercises.map((exercise) => (
                    <ExerciseItem
                      key={exercise.id}
                      id={exercise.id}
                      exercise={exercise}
                      onDelete={() => handleDeleteExercise(exercise.id)}
                      onUpdate={handleUpdateExercise}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-3xl sm:text-4xl mb-2">🏋️</p>
              <p className="text-sm sm:text-base">
                No exercises yet. Add your first exercise below!
              </p>
            </div>
          )}
        </div>

        {/* Add Exercise Toggle/Form */}
        <div className="border-t border-border flex-shrink-0 bg-card">
          {!showAddForm ? (
            <div className="p-3 sm:p-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary w-full text-sm sm:text-base py-2 sm:py-2.5"
              >
                ➕ Add Exercise
              </button>
            </div>
          ) : (
            <div className="p-4 sm:p-6 bg-muted/20 animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm sm:text-base">
                  Add Exercise
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                <input
                  type="text"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="Exercise Name"
                  className="input col-span-2 text-sm"
                  onKeyPress={(e) => e.key === "Enter" && handleAddExercise()}
                />
                <input
                  type="number"
                  value={newExerciseSets}
                  onChange={(e) => setNewExerciseSets(e.target.value)}
                  placeholder="Sets"
                  className="input text-sm"
                />
                <input
                  type="number"
                  value={newExerciseReps}
                  onChange={(e) => setNewExerciseReps(e.target.value)}
                  placeholder="Reps"
                  className="input text-sm"
                />
                <input
                  type="number"
                  step="0.5"
                  value={newExerciseWeight}
                  onChange={(e) => setNewExerciseWeight(e.target.value)}
                  placeholder="Weight (kg)"
                  className="input col-span-2 text-sm"
                />
              </div>
              <button
                onClick={handleAddExercise}
                className="btn btn-primary w-full text-sm sm:text-base py-2"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 md:p-3 border-t border-border flex gap-2 sm:gap-3 flex-shrink-0 bg-card pb-safe">
          <button
            onClick={onClose}
            className="btn btn-ghost opacity-100 hover:opacity-90 focus:outline-none flex-1 text-sm sm:text-base py-2 sm:py-2.5"
          >
            Close
          </button>
          {existingPlan && (
            <button
              onClick={handleDeleteWorkout}
              className="btn btn-danger text-sm sm:text-base py-2 sm:py-2.5 px-3 sm:px-4"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
