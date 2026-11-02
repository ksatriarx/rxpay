export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-lg w-1/3 mb-6"></div>
      <div className="h-40 bg-slate-200 rounded-3xl w-full"></div>
      <div className="grid grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-slate-200 rounded-2xl"></div>
            <div className="h-3 bg-slate-200 rounded w-12"></div>
          </div>
        ))}
      </div>
      <div className="h-24 bg-slate-200 rounded-2xl w-full"></div>
    </div>
  );
}
