"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Exercise } from "@/lib/types";

interface ExerciseItemProps {
  id: number;
  exercise: Exercise;
  onDelete: () => void;
  onUpdate: (exercise: Exercise) => void;
}

export default function ExerciseItem({
  id,
  exercise,
  onDelete,
  onUpdate,
}: ExerciseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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
      <div
        ref={setNodeRef}
        style={style}
        className="exercise-card p-3 sm:p-4 flex flex-col gap-3 bg-muted/30 border-primary/50"
      >
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
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`exercise-card p-3 sm:p-4 cursor-grab active:cursor-grabbing ${
        isDragging ? "ring-2 ring-primary" : ""
      }`}
    >
      <div className="w-full flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-sm sm:text-base mb-2">
            {exercise.name}
          </h4>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
            {exercise.sets && <span>{exercise.sets} sets</span>}
            {exercise.reps && <span>• {exercise.reps} reps</span>}
            {exercise.weight !== null && exercise.weight !== undefined && (
              <span>• {exercise.weight} kg</span>
            )}
          </div>
        </div>

        <div className="flex gap-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="text-muted-foreground hover:text-primary transition-colors p-1"
            title="Edit exercise"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-muted-foreground hover:text-red-500 transition-colors p-1"
            title="Delete exercise"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
