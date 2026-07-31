export default function Card({
  children,
  className = '',
  hoverable = true,
  padding = 'p-6',
  ...props
}) {
  return (
    <div
      className={`gov-card ${padding} ${hoverable ? '' : '!shadow-card hover:!shadow-card hover:!transform-none'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, trend, trendUp, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary-light text-primary',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50 text-red-600',
    info: 'bg-cyan-50 text-cyan-600',
  };

  return (
    <div className="gov-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {trend && (
            <p
              className={`text-xs mt-1 font-medium ${
                trendUp ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
