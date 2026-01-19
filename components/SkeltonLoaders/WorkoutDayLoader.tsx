interface WorkoutDayProps {
  day: string;
  dayIndex: number;
}

export default function WorkoutDayLoader({ day, dayIndex }: WorkoutDayProps) {
  return (
    <div
      className="day-card animate-slide-up p-4 sm:p-6"
      style={{ animationDelay: `${dayIndex * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <h3 className="text-base sm:text-lg font-semibold">{day}</h3>
        <span className="w-30 h-6 badge badge-primary text-[10px] sm:text-xs animate-pulse"></span>
      </div>

      <div className="flex flex-col gap-4 h-full">
        <div className="">
          <p className="bg-gray-400/50 w-50 h-4 animate-pulse rounded-md text-xs sm:text-sm font-medium text-primary mb-1.5 sm:mb-2"></p>
          <div className="space-y-0.5 sm:space-y-1">
            <p className="bg-gray-500/50 w-32 h-4 animate-pulse rounded-md text-[10px] sm:text-xs text-muted-foreground truncate"></p>
            <p className="bg-gray-500/50 w-32 h-4 animate-pulse rounded-md text-[10px] sm:text-xs text-muted-foreground truncate"></p>
            <p className="bg-gray-500/50 w-32 h-4 animate-pulse rounded-md text-[10px] sm:text-xs text-muted-foreground truncate"></p>
            <p className="bg-gray-500/50 w-32 h-4 animate-pulse rounded-md text-[10px] sm:text-xs text-muted-foreground truncate"></p>
          </div>
        </div>

        <button
          className={`w-full h-9 btn text-xs sm:text-sm py-1.5 sm:py-2 font-bold flex items-center justify-center gap-2 transition-all 
            btn-primary animate-pulse`}
        ></button>
      </div>
    </div>
  );
}
