export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-mesh relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl animate-pulse-glow [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-700/10 rounded-full blur-3xl animate-pulse-glow [animation-delay:0.5s]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {children}
      </div>
    </div>
  );
}
