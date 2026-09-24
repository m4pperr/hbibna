export default function BusinessLoading() {
  return (
    <div className="space-y-8 animate-pulse p-2 sm:p-4">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-[#E6DDCF]/60 rounded-xl" />
          <div className="h-4 w-96 max-w-full bg-[#E6DDCF]/40 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 bg-[#E6DDCF]/50 rounded-xl" />
          <div className="h-10 w-28 bg-[#E6DDCF]/50 rounded-xl" />
        </div>
      </div>

      {/* 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E6DDCF] shadow-soft space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-[#E6DDCF]/50 rounded-md" />
              <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#E6DDCF]/60" />
            </div>
            <div className="h-9 w-20 bg-[#E6DDCF]/60 rounded-xl" />
            <div className="h-3 w-28 bg-[#E6DDCF]/40 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Table / Content Skeleton */}
      <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl p-6 sm:p-8 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-[#E6DDCF]/60">
          <div className="h-5 w-40 bg-[#E6DDCF]/60 rounded-lg" />
          <div className="h-4 w-24 bg-[#E6DDCF]/40 rounded-md" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between py-3 border-b border-[#E6DDCF]/40 last:border-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E6DDCF]/60" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-[#E6DDCF]/60 rounded-md" />
                  <div className="h-3 w-20 bg-[#E6DDCF]/40 rounded-md" />
                </div>
              </div>
              <div className="h-6 w-20 bg-[#E6DDCF]/50 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
