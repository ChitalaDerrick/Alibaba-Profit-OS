export function AdBanner() {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">AD</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-700">
                Free Trial Active
              </p>
              <p className="text-xs text-slate-500 truncate">
                Explore our profit calculator with 70 free calculations
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400 flex-shrink-0">
            Ad supported
          </div>
        </div>
      </div>
    </div>
  )
}
