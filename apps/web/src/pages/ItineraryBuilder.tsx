import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { SectionCard } from '../components/SectionCard';
import { Plus, ArrowLeft, ArrowRight, Save, LayoutList } from 'lucide-react';

export default function ItineraryBuilder() {
  const { id: tripId } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const fetchTripData = async () => {
    try {
      setLoading(true);
      const tripRes = await apiClient(`/trips/${tripId}`);
      setTrip(tripRes.data);
      
      const itinRes = await apiClient(`/trips/${tripId}/itinerary`);
      // Extrapolate sections from itinerary payload (which groups by section)
      // or if API returns sections directly, map it. Assuming standard sections structure for builder.
      const fetchedSections = itinRes.data?.sections || [];
      setSections(fetchedSections);
    } catch (e: any) {
      setError(e.message || 'Failed to load itinerary');
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    const newSection = {
      id: `new-${Date.now()}`,
      title: '',
      startDate: trip?.startDate || new Date().toISOString(),
      endDate: trip?.endDate || new Date().toISOString(),
      sortOrder: sections.length,
    };
    setSections([...sections, newSection]);
  };

  const updateSection = async (sectionId: string, data: any) => {
    try {
      setIsSaving(true);
      let res;
      if (sectionId.startsWith('new-')) {
        // Create new section
        const payload = { ...data, sortOrder: sections.length };
        delete payload.id;
        res = await apiClient(`/trips/${tripId}/sections`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } else {
        // Update existing
        res = await apiClient(`/trips/${tripId}/sections/${sectionId}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      }

      setSections(prev => prev.map(s => s.id === sectionId ? { ...s, ...res.data, id: res.data.id } : s));
    } catch (e: any) {
      alert(e.message || 'Failed to save section');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (sectionId.startsWith('new-')) {
      setSections(prev => prev.filter(s => s.id !== sectionId));
      return;
    }

    if (window.confirm('Delete this section?')) {
      try {
        await apiClient(`/trips/${tripId}/sections/${sectionId}`, { method: 'DELETE' });
        setSections(prev => prev.filter(s => s.id !== sectionId));
      } catch (e: any) {
        alert(e.message || 'Failed to delete section');
      }
    }
  };

  const totalBudget = sections.reduce((sum, s) => sum + (Number(s.budget) || 0), 0);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/trips" className="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-slate-900">{trip?.title}</h1>
              <div className="text-xs text-slate-500 flex items-center">
                <LayoutList className="w-3 h-3 mr-1" />
                Itinerary Builder
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-slate-500">Allocated Budget: </span>
              <span className="font-bold text-slate-900">${totalBudget}</span>
              {trip?.totalBudget > 0 && <span className="text-slate-400"> / ${trip.totalBudget}</span>}
            </div>
            {isSaving && <span className="text-xs text-slate-400 flex items-center"><Save className="w-3 h-3 mr-1 animate-pulse" /> Saving</span>}
            <Link to={`/trips/${tripId}`} className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-9 px-4 text-sm font-medium hover:bg-primary/90 transition-colors">
              Continue to Itinerary <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Trip Sections</h2>
          <p className="text-slate-500 mt-1">Break your trip down into smaller, manageable sections or cities.</p>
        </div>

        <div className="space-y-2">
          {sections.map((section, idx) => (
            <SectionCard
              key={section.id}
              section={section}
              index={idx}
              onUpdate={updateSection}
              onDelete={deleteSection}
            />
          ))}

          {sections.length === 0 && (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-500">
              No sections yet. Start by adding your first destination or phase of the trip.
            </div>
          )}
        </div>

        <button
          onClick={addSection}
          className="mt-6 w-full py-4 border-2 border-dashed border-primary/30 rounded-xl text-primary font-medium hover:bg-primary/5 hover:border-primary/50 transition-all flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Section
        </button>
      </main>
    </div>
  );
}
