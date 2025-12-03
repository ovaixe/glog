"use client";

import { useState } from "react";
import { WorkoutPlan, Exercise } from "@/lib/types";
import ExerciseItem from "./ExerciseItem";

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
  const [workoutName, setWorkoutName] = useState(existingPlan?.name || "");
  const [exercises, setExercises] = useState<Exercise[]>(
    existingPlan?.exercises || []
  );
  // Track completed sets per exercise: Map<exerciseId, number[]>
  const [completedSets, setCompletedSets] = useState<Map<number, number[]>>(
    new Map()
  );
  const [isEditing, setIsEditing] = useState(!existingPlan);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<number | undefined>(
    existingPlan?.id
  );
  const [showAddForm, setShowAddForm] = useState(false);

  // New exercise form state
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseSets, setNewExerciseSets] = useState("");
  const [newExerciseReps, setNewExerciseReps] = useState("");
  const [newExerciseWeight, setNewExerciseWeight] = useState("");

  const handleAddExercise = async () => {
    if (!newExerciseName.trim()) return;

    if (!currentPlanId) {
      // If no plan exists, create it first
      try {
        const response = await fetch("/api/workout-plans", {
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
        alert(error instanceof Error ? error.message : "Failed to create workout plan");
      }
    } else {
      await addExerciseToPlan(currentPlanId);
    }
  };

  const addExerciseToPlan = async (planId: number) => {
    try {
      const response = await fetch("/api/exercises", {
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
      alert("Failed to add exercise");
    }
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    try {
      const response = await fetch(`/api/exercises?id=${exerciseId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete exercise");
      setExercises(exercises.filter((ex) => ex.id !== exerciseId));
    } catch (error) {
      console.error("Error deleting exercise:", error);
      alert("Failed to delete exercise");
    }
  };

  const handleToggleSet = (exerciseId: number, setIndex: number) => {
    const newCompletedSets = new Map(completedSets);
    const exerciseSets = newCompletedSets.get(exerciseId) || [];

    if (exerciseSets.includes(setIndex)) {
      // Remove the set
      newCompletedSets.set(
        exerciseId,
        exerciseSets.filter((s) => s !== setIndex)
      );
    } else {
      // Add the set
      newCompletedSets.set(exerciseId, [...exerciseSets, setIndex]);
    }

    setCompletedSets(newCompletedSets);
  };

  const handleCompleteWorkout = async () => {
    if (!existingPlan) {
      alert("Please create a workout plan first");
      return;
    }

    if (exercises.length === 0) {
      alert("Add some exercises before completing the workout");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/workout-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workout_plan_id: existingPlan.id,
          exercises: exercises,
        }),
      });

      if (!response.ok) throw new Error("Failed to save workout");

      alert("Workout completed and saved! 🎉");
      onClose();
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Failed to save workout");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateOrUpdateWorkout = async () => {
    if (!workoutName.trim()) {
      alert("Please enter a workout name");
      return;
    }

    try {
      if (existingPlan) {
        // Update existing plan
        const response = await fetch("/api/workout-plans", {
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
        const response = await fetch("/api/workout-plans", {
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
      alert(error instanceof Error ? error.message : "Failed to save workout");
    }
  };

  const handleUpdateWorkoutName = async () => {
    if (!existingPlan || !workoutName.trim()) return;

    try {
      const response = await fetch("/api/workout-plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: existingPlan.id,
          name: workoutName,
        }),
      });

      if (!response.ok) throw new Error("Failed to update workout name");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating workout name:", error);
      alert("Failed to update workout name");
    }
  };

  const handleDeleteWorkout = async () => {
    if (!existingPlan) return;

    if (!confirm("Are you sure you want to delete this workout plan?")) return;

    try {
      const response = await fetch(`/api/workout-plans?id=${existingPlan.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete workout");
      onClose();
    } catch (error) {
      console.error("Error deleting workout:", error);
      alert("Failed to delete workout");
    }
  };

  // Calculate total sets and completed sets
  const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets || 1), 0);
  const completedSetsCount = Array.from(completedSets.values()).reduce(
    (sum, sets) => sum + sets.length,
    0
  );
  const handleUpdateExercise = async (updatedExercise: Exercise) => {
    try {
      const response = await fetch("/api/exercises", {
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
      alert("Failed to update exercise");
    }
  };

  const completionPercentage =
    totalSets > 0 ? (completedSetsCount / totalSets) * 100 : 0;

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
                    onKeyPress={(e) => e.key === "Enter" && handleCreateOrUpdateWorkout()}
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
                  {existingPlan && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-xl sm:text-2xl p-2"
            >
              ✕
            </button>
          </div>

          {/* Progress bar */}
          {exercises.length > 0 && (
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {completedSetsCount} / {totalSets} sets
                </span>
              </div>
              <div className="progress-bar h-1.5 sm:h-2">
                <div
                  className="progress-fill"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Exercise List */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 min-h-0 bg-background/50">
          {exercises.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {exercises.map((exercise) => (
                <ExerciseItem
                  key={exercise.id}
                  exercise={exercise}
                  completedSets={completedSets.get(exercise.id) || []}
                  onToggleSet={(setIndex: number) =>
                    handleToggleSet(exercise.id, setIndex)
                  }
                  onDelete={() => handleDeleteExercise(exercise.id)}
                  onUpdate={handleUpdateExercise}
                />
              ))}
            </div>
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
        <div className="p-3 sm:p-6 border-t border-border flex gap-2 sm:gap-3 flex-shrink-0 bg-card pb-safe">
          {existingPlan && (
            <>
              <button
                onClick={handleCompleteWorkout}
                disabled={isSaving || exercises.length === 0}
                className="btn btn-secondary flex-1 text-sm sm:text-base py-2 sm:py-2.5"
              >
                {isSaving ? "Saving..." : "✓ Complete"}
              </button>
              <button
                onClick={handleDeleteWorkout}
                className="btn btn-danger text-sm sm:text-base py-2 sm:py-2.5 px-3 sm:px-4"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
