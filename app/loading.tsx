export default function Loading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto animate-pulse">
          <div className="w-8 h-8 bg-white rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-6 bg-surface rounded w-48 mx-auto animate-pulse" />
          <div className="h-4 bg-surface rounded w-32 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}
