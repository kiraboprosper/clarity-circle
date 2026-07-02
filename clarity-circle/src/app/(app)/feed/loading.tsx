export default function FeedLoading() {
  return (
    <div className="section-container py-6 max-w-2xl space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-4 space-y-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full" style={{ backgroundColor: "var(--bg-subtle)" }} />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-32 rounded-full" style={{ backgroundColor: "var(--bg-subtle)" }} />
              <div className="h-3 w-20 rounded-full" style={{ backgroundColor: "var(--bg-subtle)" }} />
            </div>
          </div>
          <div className="h-4 rounded-full" style={{ backgroundColor: "var(--bg-subtle)" }} />
          <div className="h-4 w-3/4 rounded-full" style={{ backgroundColor: "var(--bg-subtle)" }} />
        </div>
      ))}
    </div>
  );
}
