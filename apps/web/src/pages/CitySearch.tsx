import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import BlurFade from '../components/ui/blur-fade';

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

interface Activity {
  id: string;
  cityId: string;
  name: string;
  description?: string;
  category?: string;
  avgCost?: number;
  durationHrs?: number;
  coverPhoto?: string;
  city?: { name: string };
}

const COST_FILTERS = ['all', 'budget', 'moderate', 'premium'];
const ACTIVITY_CATEGORIES = ['all', 'sightseeing', 'adventure', 'food', 'culture', 'relaxation'];

export default function CitySearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'cities' | 'activities'>('cities');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [costFilter, setCostFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cities, setCities] = useState<City[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 12;
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchData();
      setSearchParams(query ? { q: query } : {});
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, costFilter, categoryFilter, tab, page]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'cities') {
        const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
        if (query) params.set('q', query);
        if (costFilter !== 'all') params.set('costIndex', costFilter);
        const res = await apiClient(`/cities?${params}`);
        setCities(res.data?.cities || res.data || []);
        setTotal(res.meta?.total || 0);
      } else {
        const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
        if (query) params.set('q', query);
        if (categoryFilter !== 'all') params.set('category', categoryFilter);
        const res = await apiClient(`/activities?${params}`);
        setActivities(res.data?.activities || res.data || []);
        setTotal(res.meta?.total || 0);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Explore Cities & Activities</h1>
          <p className="text-slate-500 mt-1">Discover destinations and add activities to your trips</p>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="city-search-input"
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder={tab === 'cities' ? 'Search cities by name or country…' : 'Search activities by name…'}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-base"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
          {(['cities', 'activities'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1); }}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                tab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {tab === 'cities' ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 font-medium">Budget:</span>
              {COST_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => { setCostFilter(f); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                    costFilter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f === 'all' ? 'All budgets' : f}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-500 font-medium">Category:</span>
              {ACTIVITY_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCategoryFilter(c); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                    categoryFilter === c ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c === 'all' ? 'All types' : c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
                <div className="h-48 bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-slate-200 rounded w-2/3" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-slate-600 text-lg">{error}</p>
            <button onClick={fetchData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Retry</button>
          </div>
        ) : tab === 'cities' ? (
          cities.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold text-slate-700">No cities found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city, index) => (
                <BlurFade key={city.id} delay={0.1 + index * 0.05} inView>
                  <div
                    onClick={() => navigate(`/trips/new?cityId=${city.id}&cityName=${encodeURIComponent(city.name)}`)}
                    className="group bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col"
                  >
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-600 relative overflow-hidden">
                      {city.coverPhoto && (
                        <img src={city.coverPhoto} alt={city.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      {city.costIndex && (
                        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          city.costIndex === 'budget' ? 'bg-green-500 text-white' :
                          city.costIndex === 'moderate' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {city.costIndex}
                        </span>
                      )}
                      <div className="absolute bottom-4 left-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="font-extrabold text-xl tracking-tight leading-tight">{city.name}</h3>
                        <p className="text-white/90 text-sm font-medium mt-1">{city.country}</p>
                      </div>
                    </div>
                    {city.description && (
                      <div className="p-5 flex-1 bg-white">
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{city.description}</p>
                      </div>
                    )}
                  </div>
                </BlurFade>
              ))}
            </div>
          )
        ) : (
          activities.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-slate-700">No activities found</h3>
              <p className="text-slate-500 mt-2">Try different keywords or categories</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((act, index) => (
                <BlurFade key={act.id} delay={0.1 + index * 0.05} inView>
                  <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group">
                    <div className="h-48 bg-gradient-to-br from-emerald-400 to-teal-600 relative overflow-hidden">
                      {act.coverPhoto && (
                        <img src={act.coverPhoto} alt={act.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                      {act.category && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-800 capitalize shadow-sm">
                          {act.category}
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col bg-white">
                      <h3 className="font-bold text-lg text-slate-900 mb-1.5 tracking-tight group-hover:text-blue-600 transition-colors">{act.name}</h3>
                      {act.city && <p className="text-sm text-slate-500 mb-3 font-medium flex items-center">📍 <span className="ml-1">{act.city.name}</span></p>}
                      <div className="flex items-center gap-4 text-sm text-slate-600 font-medium bg-slate-50 p-2.5 rounded-xl mt-auto mb-3">
                        {act.avgCost && <span className="flex items-center">💰 <span className="ml-1.5">~${Number(act.avgCost).toFixed(0)}</span></span>}
                        {act.durationHrs && <span className="flex items-center">⏱ <span className="ml-1.5">{Number(act.durationHrs)}h</span></span>}
                      </div>
                      {act.description && (
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{act.description}</p>
                      )}
                    </div>
                  </div>
                </BlurFade>
              ))}
            </div>
          )
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="px-4 py-2 text-sm text-slate-600">
              Page {page} of {totalPages} ({total} results)
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
    </div>
  );
}
