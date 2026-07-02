export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero dark:gradient-dark-hero">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-lavender-400 to-blossom-400 flex items-center justify-center shadow-glow mx-auto mb-4 animate-float">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Clarity Circle</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>A calm space to grow.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
