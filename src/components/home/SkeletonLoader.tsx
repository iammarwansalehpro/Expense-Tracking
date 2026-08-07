export default function SkeletonLoader() {
  return (
    <div className="px-5 space-y-4 animate-fade-in">
      {/* Wallet selector skeleton */}
      <div className="skeleton h-9 w-36 rounded-full" />

      {/* Budget card skeleton */}
      <div className="skeleton h-72 rounded-3xl" />

      {/* Streak banner skeleton */}
      <div className="skeleton h-12 rounded-2xl" />

      {/* Auto scan skeleton */}
      <div className="skeleton h-52 rounded-2xl" />

      {/* Quick actions skeleton */}
      <div className="space-y-3">
        <div className="skeleton h-5 w-32 rounded-md" />
        <div className="skeleton h-16 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton h-16 rounded-2xl" />
          <div className="skeleton h-16 rounded-2xl" />
        </div>
      </div>

      {/* Today overview skeleton */}
      <div className="space-y-3">
        <div className="skeleton h-5 w-28 rounded-md" />
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
