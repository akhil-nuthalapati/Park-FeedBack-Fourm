import { Star } from 'lucide-react';

export default function RatingStars({
  value = 0,
  onChange,
  label,
  size = 24,
  readOnly = false,
  error,
}) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="gov-form-group">
      {label && <label className="gov-label">{label}</label>}
      <div className="flex items-center gap-1">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            className={`transition-all duration-200 ${
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
          >
            <Star
              size={size}
              className={`transition-colors duration-200 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm text-gray-500 font-medium">{value}/5</span>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
