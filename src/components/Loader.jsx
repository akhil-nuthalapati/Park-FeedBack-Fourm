export default function Loader({ size = 'md', text = 'Loading...' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-4 border-primary-light" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
      </div>
      {text && <p className="text-sm text-gray-500 animate-pulse">{text}</p>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="gov-card p-5 space-y-3 animate-pulse">
      <div className="h-4 skeleton w-3/4 rounded" />
      <div className="h-8 skeleton w-1/2 rounded" />
      <div className="h-3 skeleton w-1/3 rounded" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="gov-table overflow-hidden">
      <div className="bg-primary-light p-4 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 skeleton rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="p-4 flex gap-4 border-b border-gray-100">
          {Array.from({ length: cols }).map((_, col) => (
            <div key={col} className="h-3 skeleton rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
