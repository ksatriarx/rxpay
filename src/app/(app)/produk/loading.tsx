export default function LoadingProduk() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-lg w-1/2 mb-6"></div>
      <div className="flex gap-2 overflow-hidden mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-200 rounded-full w-24 shrink-0"></div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
        ))}
      </div>
    </div>
  );
}
