import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { SearchBar } from '../components/SearchBar';
import { Calendar, MapPin, Trash2, Map, ArrowRight } from 'lucide-react';
import { BlurFade } from '../components/ui/blur-fade';

export default function TripListing() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await apiClient('/trips');
      setTrips(res.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      try {
        await apiClient(`/trips/${id}`, { method: 'DELETE' });
        setTrips(trips.filter(t => t.id !== id));
      } catch (e: any) {
        alert(e.message || 'Failed to delete trip');
      }
    }
  };

  const renderTripGroup = (title: string, filteredTrips: any[]) => {
    if (filteredTrips.length === 0) return null;

    return (
      <div className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
          {title} <span className="ml-3 bg-slate-200 text-slate-700 text-xs py-1 px-2.5 rounded-full">{filteredTrips.length}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrips.map((trip, index) => (
            <BlurFade key={trip.id} delay={0.1 + index * 0.05} inView>
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 group relative flex flex-col h-full">
                <div className="h-40 bg-gradient-to-br from-slate-200 to-slate-100 relative overflow-hidden">
                  {trip.coverPhoto ? (
                    <img src={trip.coverPhoto} alt={trip.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-blue-50/50 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                      <Map className="w-10 h-10 text-blue-200" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full shadow-sm backdrop-blur-md bg-white/90 ${trip.status === 'completed' ? 'text-green-600' : trip.status === 'ongoing' ? 'text-blue-600' : 'text-slate-700'}`}>
                      {trip.status || 'Planned'}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between relative bg-white/50">
                  <div className="absolute -top-6 right-6 w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                    <span className="text-xl font-bold text-blue-600">{trip.sectionCount || 0}</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-slate-900 mb-2 line-clamp-1 pr-10">{trip.title}</h3>
                    <div className="flex items-center text-slate-500 text-sm mb-3 font-medium">
                      <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                      {new Date(trip.startDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {new Date(trip.endDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                    </div>
                    <div className="flex items-center text-slate-500 text-sm font-medium">
                      <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                      {trip.sectionCount || 0} destinations
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link to={`/trips/${trip.id}`} className="text-sm font-bold text-blue-600 flex items-center group/link">
                      View itinerary <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-300" />
                    </Link>
                    <div className="flex space-x-2">
                      <button onClick={() => deleteTrip(trip.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    );
  };

  const ongoingTrips = trips.filter(t => t.status === 'ongoing');
  const upcomingTrips = trips.filter(t => !t.status || t.status === 'planned' || t.status === 'upcoming');
  const completedTrips = trips.filter(t => t.status === 'completed');

  return (
    <div className="bg-slate-50 h-full pb-20 md:pb-0">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Trips</h1>
            <p className="text-slate-500 mt-1">Manage and organize all your travel plans</p>
          </div>
          <Link to="/trips/new" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-5 text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
            Plan a New Trip
          </Link>
        </div>

        <SearchBar />

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-xl"></div>)}
          </div>
        ) : trips.length > 0 ? (
          <div>
            {renderTripGroup('Ongoing Trips', ongoingTrips)}
            {renderTripGroup('Upcoming Trips', upcomingTrips)}
            {renderTripGroup('Completed Trips', completedTrips)}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-16 text-center max-w-2xl mx-auto mt-12">
            <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <Map className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No trips planned yet</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Your next great adventure is waiting. Start planning your itinerary, tracking budgets, and more.</p>
            <Link to="/trips/new" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-11 px-8 text-base font-medium hover:bg-primary/90 transition-colors shadow-sm">
              Create your first trip
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
