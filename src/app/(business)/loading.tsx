export default function BusinessLoading() {
  return (
    <div className="space-y-8 animate-pulse p-2 sm:p-4 font-rounded">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-black/25 rounded-xl" />
          <div className="h-4 w-96 max-w-full bg-black/15 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-11 w-32 bg-black/20 rounded-2xl border-2 border-black/30" />
          <div className="h-11 w-28 bg-black/20 rounded-2xl border-2 border-black/30" />
        </div>
      </div>

      {/* 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-[2rem] bg-white border-2 border-black shadow-[0_6px_0_#000] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-black/20 rounded-md" />
              <div className="w-10 h-10 rounded-2xl bg-[#FFE600]/40 border-2 border-black/40" />
            </div>
            <div className="h-9 w-20 bg-black/30 rounded-xl" />
            <div className="h-3 w-28 bg-black/15 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Table / Content Skeleton */}
      <div className="bg-white border-2 border-black rounded-[2.5rem] p-6 sm:p-8 shadow-[0_8px_0_#000] space-y-4">
        <div className="flex items-center justify-between pb-4 border-b-2 border-black/10">
          <div className="h-6 w-40 bg-black/20 rounded-lg" />
          <div className="h-4 w-24 bg-black/15 rounded-md" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between py-3.5 border-b-2 border-black/5 last:border-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF9D2] border-2 border-black/30" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-black/20 rounded-md" />
                  <div className="h-3 w-20 bg-black/10 rounded-md" />
                </div>
              </div>
              <div className="h-7 w-20 bg-black/15 rounded-xl border border-black/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
