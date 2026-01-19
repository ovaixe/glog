export default function HistoryLoader({ index = 0 }: { index?: number }) {
  return (
    <div
      className="card p-3 md:p-6 animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex flex-col items-start justify-between cursor-pointer">
        <div className="flex items-center gap-2 justify-between w-full">
          <span className="w-32 h-6 animate-pulse badge badge-primary text-[10px] sm:text-xs"></span>
          <button className="animate-pulse text-xl sm:text-2xl text-muted-foreground hover:text-foreground transition-transform p-1">
            ▶
          </button>
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <h3 className="bg-gray-400/50 w-50 h-4 animate-pulse rounded-md text-base sm:text-lg font-semibold"></h3>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              📅
              <div className="bg-gray-400/50 w-20 h-4 rounded-md animate-pulse"></div>
            </div>
            <div className="flex items-center gap-1">
              🕐
              <div className="bg-gray-400/50 w-12 h-4 rounded-md animate-pulse"></div>
            </div>
            <div className="flex items-center gap-1">
              🕐
              <div className="bg-gray-400/50 w-12 h-4 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
