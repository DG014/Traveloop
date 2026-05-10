import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { apiClient } from '../lib/api-client';
import { SearchBar } from '../components/SearchBar';
import { MapPin, Calendar, Plus, ArrowRight } from 'lucide-react';

interface City {
  id: string;
  name: string;
  country: string;
  coverPhoto?: string;
  costIndex?: string;
}

interface Trip {
  id: string;
  title: string;
  startDate: string;
  status: string;
}

const HERO_WORDS = ['next?', 'explore?', 'discover?', 'travel?'];

export default function Dashboard() {
  const { user } = useAuth();
  const [popularCities, setPopularCities] = useState<City[]>([]);
  const [previousTrips, setPreviousTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [wordIdx, setWordIdx] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  // Word rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % HERO_WORDS.length);
        setFadeIn(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [citiesRes, tripsRes] = await Promise.all([
          apiClient('/cities?sort=popular&limit=8'),
          apiClient('/trips?status=completed&limit=3'),
        ]);
        setPopularCities(citiesRes.data?.cities || citiesRes.data || []);
        setPreviousTrips(tripsRes.data?.trips || tripsRes.data || []);
      } catch {
        // Graceful degradation — show empty states
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-slate-50 pb-20 md:pb-0 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 text-white py-20 px-6 overflow-hidden">
        {/* Animated grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Radial fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-900/40" />

        <div className="relative max-w-5xl mx-auto z-10 text-center space-y-7 animate-[fadeUp_0.6s_ease_both]"
          style={{ animation: 'fadeUp 0.6s ease both' }}>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight drop-shadow-sm">
            Where to{' '}
            <span
              key={wordIdx}
              className="text-blue-200 inline-block transition-all duration-300"
              style={{ opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(8px)' }}
            >
              {HERO_WORDS[wordIdx]}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto font-medium">
            Plan your perfect itinerary, track your budget, and explore top destinations — all in one place.
          </p>
          <div className="max-w-3xl mx-auto pt-2 text-left drop-shadow-2xl hover:-translate-y-1 transition-transform duration-300">
            <SearchBar />
          </div>
        </div>

        {/* Greeting ribbon */}
        {user && (
          <div className="relative max-w-5xl mx-auto mt-8 text-center z-10">
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 text-sm font-medium text-white">
              👋 Welcome back, {user.firstName}!
            </span>
          </div>
        )}
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-14">
        {/* Popular Cities */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Top Destinations</h2>
            <Link to="/search" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-64 h-48 bg-slate-200 animate-pulse rounded-2xl shrink-0" />
              ))}
            </div>
          ) : popularCities.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto pb-6 pt-2 snap-x px-1 -mx-1">
              {popularCities.map((city) => (
                <Link
                  key={city.id}
                  to={`/trips/new?cityId=${city.id}&cityName=${encodeURIComponent(city.name)}`}
                  className="relative w-64 h-48 rounded-2xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 shrink-0 snap-start"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 group-hover:scale-110 transition-transform duration-500">
                    {city.coverPhoto && (
                      <img src={city.coverPhoto} alt={city.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-extrabold text-xl tracking-tight">{city.name}</h3>
                    <p className="text-sm text-slate-200 flex items-center mt-1">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-blue-300" /> {city.country}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <MapPin className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p>No destinations available yet.</p>
            </div>
          )}
        </section>

        {/* Previous Trips */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Previous Trips</h2>
            <Link to="/trips" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
              All trips <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-xl" />)}
            </div>
          ) : previousTrips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {previousTrips.map((trip) => (
                <Link key={trip.id} to={`/trips/${trip.id}`} className="block group">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{trip.title}</h3>
                      <div className="flex items-center text-sm text-slate-500 mt-2">
                        <Calendar className="w-4 h-4 mr-1.5 text-blue-400" />
                        {new Date(trip.startDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-wider">Completed</span>
                      <span className="text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-14 text-center">
              <div className="w-14 h-14 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">No trips yet</h3>
              <p className="text-slate-500 mt-1 mb-6 text-sm">Start planning your first adventure.</p>
              <Link to="/trips/new" className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> Plan a trip
              </Link>
            </div>
          )}
        </section>
      </main>

      {/* FAB */}
      <Link
        to="/trips/new"
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200 z-50"
        aria-label="Create new trip"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
