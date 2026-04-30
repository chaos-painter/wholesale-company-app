interface ErrorBannerProps {
  message: string;
  className?: string;
}

export default function ErrorBanner({
  message,
  className = "",
}: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      className={`py-2.5 px-3.5 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] 
                  rounded-lg text-danger text-sm ${className}`}
    >
      {message}
    </div>
  );
}
