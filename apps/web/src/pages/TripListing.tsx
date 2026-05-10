import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { SearchBar } from '../components/SearchBar';
import { Calendar, MoreVertical, MapPin, Trash2, Edit2, Map } from 'lucide-react';

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map(trip => (
            <div key={trip.id} className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
              <div className="h-32 bg-slate-200 relative">
                {trip.coverPhoto ? (
                  <img src={trip.coverPhoto} alt={trip.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <Map className="w-8 h-8 text-primary/40" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex space-x-2">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm backdrop-blur-md bg-white/90 text-slate-800`}>
                    {trip.status || 'Planned'}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1">{trip.title}</h3>
                  <div className="flex items-center text-slate-500 text-sm mb-3">
                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-slate-500 text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                    {trip.sectionCount || 0} destinations
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                  <Link to={`/trips/${trip.id}`} className="text-sm font-medium text-primary hover:underline">
                    View full itinerary
                  </Link>
                  <div className="flex space-x-2">
                    <button onClick={() => deleteTrip(trip.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ongoingTrips = trips.filter(t => t.status === 'ongoing');
  const upcomingTrips = trips.filter(t => !t.status || t.status === 'planned' || t.status === 'upcoming');
  const completedTrips = trips.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen bg-slate-50">
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
