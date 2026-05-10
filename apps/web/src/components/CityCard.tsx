interface City {
  id: string;
  name: string;
  country: string;
  region?: string;
  coverPhoto?: string;
  costIndex?: string;
  popularityRank?: number;
  description?: string;
}

interface CityCardProps {
  city: City;
  onClick?: (city: City) => void;
  compact?: boolean;
}

const COST_BADGE: Record<string, string> = {
  budget: 'bg-green-500',
  moderate: 'bg-yellow-500',
  premium: 'bg-red-500',
};

export function CityCard({ city, onClick, compact = false }: CityCardProps) {
  return (
    <div
      onClick={() => onClick?.(city)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(city) : undefined}
      className={`group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ${onClick ? 'cursor-pointer' : ''} ${compact ? 'w-44 shrink-0' : ''}`}
    >
      <div className={`${compact ? 'h-28' : 'h-44'} bg-gradient-to-br from-blue-400 to-indigo-600 relative`}>
        {city.coverPhoto && (
          <img src={city.coverPhoto} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {city.costIndex && (
          <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${COST_BADGE[city.costIndex] || 'bg-slate-400'}`} title={city.costIndex} />
        )}
        <div className="absolute bottom-2 left-3 text-white">
          <p className={`font-bold ${compact ? 'text-sm' : 'text-base'} leading-tight`}>{city.name}</p>
          <p className={`text-white/75 ${compact ? 'text-xs' : 'text-sm'}`}>{city.country}</p>
        </div>
      </div>
      {!compact && city.description && (
        <div className="p-3">
          <p className="text-xs text-slate-500 line-clamp-2">{city.description}</p>
        </div>
      )}
    </div>
  );
}
