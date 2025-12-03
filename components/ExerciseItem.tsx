"use client";

import { useState } from "react";
import { Exercise } from "@/lib/types";

interface ExerciseItemProps {
  exercise: Exercise;
  completedSets: number[];
  onToggleSet: (setIndex: number) => void;
  onDelete: () => void;
  onUpdate: (exercise: Exercise) => void;
}

export default function ExerciseItem({
  exercise,
  completedSets,
  onToggleSet,
  onDelete,
  onUpdate, // Added onUpdate
}: ExerciseItemProps) {
  const totalSets = exercise.sets || 1;
  const allSetsCompleted = completedSets.length === totalSets;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(exercise.name);
  const [editSets, setEditSets] = useState(exercise.sets?.toString() || "");
  const [editReps, setEditReps] = useState(exercise.reps?.toString() || "");
  const [editWeight, setEditWeight] = useState(
    exercise.weight?.toString() || ""
  );

  const handleSave = () => {
    onUpdate({
      ...exercise,
      name: editName,
      sets: editSets ? parseInt(editSets) : null,
      reps: editReps ? parseInt(editReps) : null,
      weight: editWeight ? parseFloat(editWeight) : null,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="exercise-card p-3 sm:p-4 flex flex-col gap-3 bg-muted/30 border-primary/50">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="input text-sm"
          placeholder="Exercise Name"
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            value={editSets}
            onChange={(e) => setEditSets(e.target.value)}
            className="input text-sm"
            placeholder="Sets"
          />
          <input
            type="number"
            value={editReps}
            onChange={(e) => setEditReps(e.target.value)}
            className="input text-sm"
            placeholder="Reps"
          />
          <input
            type="number"
            step="0.5"
            value={editWeight}
            onChange={(e) => setEditWeight(e.target.value)}
            className="input text-sm"
            placeholder="kg"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setIsEditing(false)}
            className="btn btn-ghost text-xs py-1"
          >
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary text-xs py-1">
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`exercise-card ${allSetsCompleted ? "done" : ""} p-3 sm:p-4`}
    >
      <div className="flex-1">
        <div className="flex items-start justify-between mb-1.5 sm:mb-2">
          <h4
            className={`font-medium text-sm sm:text-base exercise-name ${
              allSetsCompleted ? "line-through text-muted-foreground" : ""
            }`}
          >
            {exercise.name}
          </h4>
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-primary transition-colors p-1"
              title="Edit exercise"
            >
              ✏️
            </button>
            <button
              onClick={onDelete}
              className="text-muted-foreground hover:text-red-500 transition-colors p-1"
              title="Delete exercise"
            >
              🗑️
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2 text-xs sm:text-sm text-muted-foreground">
          {exercise.reps && <span>{exercise.reps} reps</span>}
          {exercise.weight !== null && exercise.weight !== undefined && (
            <span>• {exercise.weight} kg</span>
          )}
        </div>

        {/* Set checkboxes */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {Array.from({ length: totalSets }, (_, i) => (
            <button
              key={i}
              onClick={() => onToggleSet(i)}
              className={`
                px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all
                ${
                  completedSets.includes(i)
                    ? "bg-green-500 text-white border-2 border-green-500"
                    : "bg-gray-800 text-gray-200 border-2 border-gray-700 hover:border-green-500/50"
                }
              `}
            >
              {completedSets.includes(i) ? "✓ " : ""}Set {i + 1}
            </button>
          ))}
        </div>

        {/* Progress indicator */}
        {totalSets > 1 && (
          <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">
            {completedSets.length} / {totalSets} sets completed
          </div>
        )}
      </div>
    </div>
  );
}
