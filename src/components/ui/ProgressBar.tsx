export function ProgressBar({ progress, colorClass = "bg-forest", className = "" }: { progress: number, colorClass?: string, className?: string }) {
  return (
    <div className={`prog-bar ${className}`}>
      <div className={`prog-fill ${colorClass}`} style={{ width: `${progress}%` }}></div>
    </div>
  );
}
