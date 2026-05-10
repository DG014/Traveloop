import { Link } from 'react-router-dom';

interface Trip {
  id: string;
  title: string;
  description?: string;
  coverPhoto?: string;
  startDate: string;
  endDate: string;
  status?: string;
  isPublic?: boolean;
  publicSlug?: string;
  _count?: { sections: number };
}

interface TripCardProps {
  trip: Trip;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-600',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function TripCard({ trip, onDelete, showActions = true }: TripCardProps) {
  const status = trip.status || 'planned';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Cover */}
      <div className="h-40 bg-gradient-to-br from-blue-400 to-indigo-600 relative">
        {trip.coverPhoto && (
          <img src={trip.coverPhoto} alt={trip.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/10" />
        <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[status] || STATUS_COLORS.planned}`}>
          {status}
        </span>
        {trip.isPublic && (
          <span className="absolute top-3 right-3 px-2 py-1 bg-white/90 rounded-full text-xs font-medium text-emerald-700">
            🌐 Public
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 text-base truncate mb-1">{trip.title}</h3>
        <p className="text-xs text-slate-500 mb-3">
          📅 {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
        </p>
        {trip._count && (
          <p className="text-xs text-slate-400 mb-3">🗂 {trip._count.sections} section{trip._count.sections !== 1 ? 's' : ''}</p>
        )}

        {showActions && (
          <div className="flex gap-2 mt-3">
            <Link
              to={`/trips/${trip.id}`}
              className="flex-1 text-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              View
            </Link>
            <Link
              to={`/trips/${trip.id}/builder`}
              className="flex-1 text-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
            >
              Edit
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(trip.id)}
                className="px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs transition-colors"
                aria-label={`Delete trip ${trip.title}`}
              >
                🗑
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
