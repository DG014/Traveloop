import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { apiClient } from '../lib/api-client';
import { SearchBar } from '../components/SearchBar';
import { MapPin, Calendar, Plus, UserCircle } from 'lucide-react';

interface City {
  id: string;
  name: string;
  country: string;
}

interface Trip {
  id: string;
  title: string;
  startDate: string;
  status: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [popularCities, setPopularCities] = useState<City[]>([]);
  const [previousTrips, setPreviousTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [citiesRes, tripsRes] = await Promise.all([
          apiClient('/cities?sort=popular&limit=8'),
          apiClient('/trips?status=completed&limit=3')
        ]);
        setPopularCities(citiesRes.data || []);
        setPreviousTrips(tripsRes.data || []);
      } catch (e) {
        // Handle error gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">T</span>
          </div>
          <span className="text-xl font-bold text-foreground">Traveloop</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium hidden sm:block">Hello, {user?.firstName}</span>
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-border">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-6 h-6 text-slate-500" />
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-primary text-white py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-5xl mx-auto z-10 text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Where to next?</h1>
          <p className="text-lg sm:text-xl text-primary-foreground max-w-2xl mx-auto opacity-90">
            Plan your perfect itinerary, track your budget, and explore top destinations all in one place.
          </p>
          <div className="max-w-3xl mx-auto pt-4 text-foreground text-left">
            <SearchBar />
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Popular Cities */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Top Regional Selections</h2>
            <button className="text-sm font-medium text-primary hover:underline">View all</button>
          </div>
          
          {loading ? (
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="w-64 h-48 bg-slate-200 animate-pulse rounded-xl shrink-0"></div>)}
            </div>
          ) : popularCities.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto pb-4 snap-x">
              {popularCities.map((city) => (
                <div key={city.id} className="relative w-64 h-48 rounded-xl overflow-hidden shrink-0 snap-start group cursor-pointer">
                  <div className="absolute inset-0 bg-slate-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold text-lg">{city.name}</h3>
                    <p className="text-sm opacity-90 flex items-center"><MapPin className="w-3 h-3 mr-1" /> {city.country}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No popular destinations found right now.</p>
          )}
        </section>

        {/* Previous Trips */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">Previous Trips</h2>
          
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
               {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-xl"></div>)}
             </div>
          ) : previousTrips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {previousTrips.map((trip) => (
                <Link to={`/trips/${trip.id}`} key={trip.id} className="block group">
                  <div className="bg-white border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">{trip.title}</h3>
                      <div className="flex items-center text-sm text-slate-500 mt-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(trip.startDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-xs font-medium px-2.5 py-1 bg-green-100 text-green-700 rounded-full">Completed</span>
                      <span className="text-sm font-medium text-primary group-hover:underline">View details</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
              <div className="mx-auto w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No trips yet</h3>
              <p className="text-slate-500 mt-1 mb-6">Start planning your first adventure.</p>
              <Link to="/trips/new" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4 mr-2" /> Plan a trip
              </Link>
            </div>
          )}
        </section>
      </main>

      {/* FAB for mobile planning */}
      <Link to="/trips/new" className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 z-50">
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
