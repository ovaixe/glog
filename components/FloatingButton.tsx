import { useActiveWorkout } from "./ActiveWorkoutContext";
import { formatDuration } from "@/lib/utils";

export function FloatingResumeButton() {
  const { activeWorkout, isModalOpen, toggleModal, elapsedSeconds } =
    useActiveWorkout();

  if (!activeWorkout || isModalOpen) return null;

  return (
    <button
      onClick={() => toggleModal(true)}
      className="fixed bottom-6 right-6 bg-slate-800 text-slate-300 font-bold py-3 px-5 rounded-full shadow-[0_0_20px_rgba(74,158,255,0.4)] hover:scale-105 hover:shadow-[0_0_30px_rgba(74,158,255,0.6)] transition-all animate-bounce-slow flex items-center gap-3"
    >
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-500 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
      </span>
      <span>Resume Workout</span>
      <span className="font-mono bg-black/20 px-2 py-0.5 rounded text-sm">
        {formatDuration(elapsedSeconds)}
      </span>
    </button>
  );
}
