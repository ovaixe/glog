"use client";

import { useEffect, useState } from "react";
import { WorkoutPlan, DAYS_OF_WEEK } from "@/lib/types";
import { fetchWithAuth } from "@/lib/api";
import WorkoutDayCard from "@/components/WorkoutDayCard";
import WorkoutModal from "@/components/WorkoutModal";
import WorkoutDayLoader from "@/components/SkeltonLoaders/WorkoutDayLoader";

export default function Home() {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWorkoutPlans();
  }, []);

  const fetchWorkoutPlans = async () => {
    try {
      const response = await fetchWithAuth("/api/workout-plans");
      const data = await response.json();
      setWorkoutPlans(data);
    } catch (error) {
      console.error("Error fetching workout plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDay(null);
    fetchWorkoutPlans(); // Refresh data
  };

  const getPlanForDay = (dayIndex: number) => {
    return workoutPlans.find((plan) => plan.day_of_week === dayIndex);
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-4 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
            Weekly Workout Plan
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Click on a day to view or create your workout plan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DAYS_OF_WEEK.map((day, index) => (
            <WorkoutDayLoader key={index} day={day} dayIndex={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
          Weekly Workout Plan
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Click on a day to view or create your workout plan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DAYS_OF_WEEK.map((day, index) => {
          const plan = getPlanForDay(index);
          return (
            <WorkoutDayCard
              key={index}
              day={day}
              dayIndex={index}
              plan={plan}
              onClick={() => handleDayClick(index)}
            />
          );
        })}
      </div>

      {isModalOpen && selectedDay !== null && (
        <WorkoutModal
          dayIndex={selectedDay}
          dayName={DAYS_OF_WEEK[selectedDay]}
          existingPlan={getPlanForDay(selectedDay)}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
