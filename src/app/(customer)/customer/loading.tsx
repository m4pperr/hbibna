export default function CustomerLoading() {
  return (
    <div className="space-y-8 animate-pulse p-2 sm:p-4 max-w-2xl mx-auto">
      {/* Header skeleton */}
      <div className="space-y-2 pb-2 border-b border-[#E6DDCF]/60">
        <div className="h-4 w-32 bg-[#E6DDCF]/50 rounded-md" />
        <div className="h-8 w-56 bg-[#E6DDCF]/60 rounded-xl" />
        <div className="h-4 w-80 max-w-full bg-[#E6DDCF]/40 rounded-lg" />
      </div>

      {/* Loyalty Pass Card Skeleton */}
      <div className="rounded-3xl bg-[#191817]/90 p-6 sm:p-8 space-y-6 shadow-xl border border-[#DFC99F]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10" />
            <div className="space-y-1.5">
              <div className="h-4 w-28 bg-white/20 rounded-md" />
              <div className="h-3 w-20 bg-white/10 rounded-md" />
            </div>
          </div>
          <div className="h-6 w-16 bg-white/10 rounded-full" />
        </div>

        <div className="py-4 space-y-2 text-center">
          <div className="h-4 w-24 bg-white/20 rounded-md mx-auto" />
          <div className="h-12 w-36 bg-white/25 rounded-2xl mx-auto" />
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="h-3 w-32 bg-white/15 rounded-md" />
          <div className="h-8 w-24 bg-white/20 rounded-xl" />
        </div>
      </div>

      {/* Rewards / Activity Skeleton */}
      <div className="space-y-4">
        <div className="h-5 w-40 bg-[#E6DDCF]/60 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6DDCF] shadow-soft space-y-3"
            >
              <div className="h-4 w-36 bg-[#E6DDCF]/60 rounded-md" />
              <div className="h-3 w-48 bg-[#E6DDCF]/40 rounded-md" />
              <div className="h-6 w-20 bg-[#E6DDCF]/50 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
