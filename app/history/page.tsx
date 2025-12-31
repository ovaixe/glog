"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { formatDuration } from "@/lib/utils";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/workout-history");
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading history...</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">
          Workout History
        </h2>
        <div className="card p-6 sm:p-12 text-center">
          <p className="text-4xl sm:text-6xl mb-4">📊</p>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">
            No workouts completed yet
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Complete your first workout to see it here!
          </p>
          <a
            href="/"
            className="btn btn-primary mt-4 sm:mt-6 inline-block text-sm sm:text-base"
          >
            Go to Workouts
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
          Workout History
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          {history.length} workout{history.length !== 1 ? "s" : ""} completed
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {history.map((entry, index) => {
          const exercises = JSON.parse(entry.exercises_data);
          const isExpanded = expandedId === entry.id;
          // SQLite stores as UTC string "YYYY-MM-DD HH:MM:SS", treat as UTC by appending Z
          // Replace space with T to make it ISO format: "YYYY-MM-DDTHH:MM:SSZ"
          const dateStr = entry.completed_at.replace(" ", "T") + "Z";
          const completedDate = new Date(dateStr);

          return (
            <div
              key={entry.id}
              className="card p-3 md:p-6 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className="flex flex-col items-start justify-between cursor-pointer"
                onClick={() => toggleExpand(entry.id)}
              >
                <div className="flex items-center gap-2 justify-between w-full">
                  <span className="badge badge-primary text-[10px] sm:text-xs">
                    {exercises.length} exercise
                    {exercises.length !== 1 ? "s" : ""}
                  </span>
                  <button className="text-xl sm:text-2xl text-muted-foreground hover:text-foreground transition-transform p-1">
                    {isExpanded ? "▼" : "▶"}
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold">
                      {entry.workout_name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <span>📅 {format(completedDate, "MMM dd, yyyy")}</span>
                    <span>🕐 {format(completedDate, "hh:mm a")}</span>
                    {entry.duration_seconds && (
                      <span>⏱️ {formatDuration(entry.duration_seconds)}</span>
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border animate-slide-up">
                  <div className="space-y-2">
                    {exercises.map((exercise: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/30 rounded-lg gap-2 sm:gap-4"
                      >
                        <span className="font-medium text-sm sm:text-base">
                          {exercise.name}
                        </span>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {exercise.sets && (
                            <span className="badge badge-muted text-[10px] sm:text-xs">
                              {exercise.sets} sets
                            </span>
                          )}
                          {exercise.reps && (
                            <span className="badge badge-muted text-[10px] sm:text-xs">
                              {exercise.reps} reps
                            </span>
                          )}
                          {exercise.weight !== null &&
                            exercise.weight !== undefined && (
                              <span className="badge badge-muted text-[10px] sm:text-xs">
                                {exercise.weight} kg
                              </span>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
