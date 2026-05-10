import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiClient } from '../lib/api-client';
import { MapPin, Search } from 'lucide-react';

const tripSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  description: z.string().optional(),
  totalBudget: z.coerce.number().optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be after or equal to start date",
  path: ["endDate"]
});

type TripForm = z.infer<typeof tripSchema>;

export default function CreateTrip() {
  const navigate = useNavigate();
  const [citySearch, setCitySearch] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<any | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<TripForm>({
    resolver: zodResolver(tripSchema),
  });

  useEffect(() => {
    if (citySearch.length > 2) {
      const delay = setTimeout(() => {
        apiClient(`/cities?q=${encodeURIComponent(citySearch)}&limit=5`)
          .then(res => setCities(res.data || []))
          .catch(() => setCities([]));
      }, 300);
      return () => clearTimeout(delay);
    } else {
      setCities([]);
    }
  }, [citySearch]);

  const selectCity = async (city: any) => {
    setSelectedCity(city);
    setCitySearch('');
    setCities([]);
    if (!setValue('title')) {
      setValue('title', `Trip to ${city.name}`);
    }
    
    try {
      const res = await apiClient(`/cities/${city.id}/suggestions`);
      setSuggestions(res.data || []);
    } catch (e) {
      setSuggestions([]);
    }
  };

  const onSubmit = async (data: TripForm) => {
    try {
      setError(null);
      const res = await apiClient('/trips', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      navigate(`/trips/${res.data.id}/builder`);
    } catch (err: any) {
      setError(err.message || 'Failed to create trip');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Plan a New Trip</h1>
          <p className="text-slate-500 mt-2">Set up your dates and destination to start building your itinerary.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <h2 className="text-lg font-bold mb-4">Destination</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search destination city..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 pl-9 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
                
                {cities.length > 0 && (
                  <div className="absolute top-11 left-0 right-0 bg-white border border-border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {cities.map(city => (
                      <button
                        key={city.id}
                        onClick={() => selectCity(city)}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm flex items-center"
                      >
                        <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                        {city.name}, {city.country}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedCity && (
                <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md flex items-center">
                  <MapPin className="w-5 h-5 text-primary mr-2" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{selectedCity.name}</p>
                    <p className="text-xs text-slate-500">{selectedCity.country}</p>
                  </div>
                </div>
              )}
            </div>

            {suggestions.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
                <h2 className="text-lg font-bold mb-4">Top Activities</h2>
                <div className="space-y-3">
                  {suggestions.map(act => (
                    <div key={act.id} className="text-sm p-3 border border-border rounded-md hover:bg-slate-50">
                      <p className="font-medium text-slate-900">{act.name}</p>
                      <div className="flex justify-between items-center mt-1 text-xs text-slate-500">
                        <span>{act.category}</span>
                        <span>${act.avgCost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              {error && (
                <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Trip Title</label>
                  <input id="title" {...register('title')} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                  {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
                    <input id="startDate" type="date" {...register('startDate')} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="endDate" className="text-sm font-medium">End Date</label>
                    <input id="endDate" type="date" {...register('endDate')} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    {errors.endDate && <p className="text-xs text-red-500">{errors.endDate.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="totalBudget" className="text-sm font-medium">Total Budget (Optional)</label>
                  <input id="totalBudget" type="number" {...register('totalBudget')} placeholder="e.g. 1500" className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea id="description" {...register('description')} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Trip'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
