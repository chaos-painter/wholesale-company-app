interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export default function LoadingSkeleton({
  count = 6,
  className = "",
}: LoadingSkeletonProps) {
  return (
    <div
      className={`grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4.5 ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-60 rounded-lg bg-gray-200 animate-[pulse_1.5s_ease-in-out_infinite]"
        />
      ))}
    </div>
  );
}
