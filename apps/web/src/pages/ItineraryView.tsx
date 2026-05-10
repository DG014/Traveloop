import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { MapPin, Calendar, DollarSign, Clock, LayoutList, CheckCircle2, Plus, Trash2 } from 'lucide-react';

export default function ItineraryView() {
  const { id: tripId } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableActivities, setAvailableActivities] = useState<any[]>([]);
  const [addingToSection, setAddingToSection] = useState<string | null>(null);
  const [newActivityForm, setNewActivityForm] = useState({
    activityId: '',
    dayNumber: 1,
    scheduledTime: '09:00',
    actualCost: 0,
    notes: ''
  });

  useEffect(() => {
    fetchItinerary();
    fetchAvailableActivities();
  }, [tripId]);

  const fetchAvailableActivities = async () => {
    try {
      const res = await apiClient('/activities?limit=100');
      setAvailableActivities(res.data || []);
    } catch (e) {
      console.error('Failed to load activities', e);
    }
  };

  const fetchItinerary = async () => {
    try {
      setLoading(true);
      const tripRes = await apiClient(`/trips/${tripId}`);
      setTrip(tripRes.data);

      const itinRes = await apiClient(`/trips/${tripId}/itinerary`);
      setSections(itinRes.data?.sections || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load itinerary');
    } finally {
      setLoading(false);
    }
  };

  const updateCost = async (sectionId: string, activityId: string, newCost: number) => {
    try {
      await apiClient(`/trips/${tripId}/sections/${sectionId}/activities/${activityId}`, {
        method: 'PATCH',
        body: JSON.stringify({ actualCost: newCost }),
      });
      // update local state
      setSections(prev => prev.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            activities: s.activities.map((a: any) => 
              a.id === activityId ? { ...a, actualCost: newCost } : a
            )
          };
        }
        return s;
      }));
    } catch (e: any) {
      alert('Failed to update cost: ' + e.message);
    }
  };

  const handleAddActivity = async (sectionId: string) => {
    if (!newActivityForm.activityId) return alert('Please select an activity');
    try {
      const res = await apiClient(`/trips/${tripId}/sections/${sectionId}/activities`, {
        method: 'POST',
        body: JSON.stringify(newActivityForm),
      });
      setSections(prev => prev.map(s => {
        if (s.id === sectionId) {
          return { ...s, activities: [...(s.activities || []), res.data] };
        }
        return s;
      }));
      setAddingToSection(null);
      setNewActivityForm({ activityId: '', dayNumber: 1, scheduledTime: '09:00', actualCost: 0, notes: '' });
    } catch (e: any) {
      alert('Failed to add activity: ' + e.message);
    }
  };

  const removeActivity = async (sectionId: string, activityId: string) => {
    if (!window.confirm('Remove this activity?')) return;
    try {
      await apiClient(`/trips/${tripId}/sections/${sectionId}/activities/${activityId}`, {
        method: 'DELETE',
      });
      setSections(prev => prev.map(s => {
        if (s.id === sectionId) {
          return { ...s, activities: s.activities.filter((a: any) => a.id !== activityId) };
        }
        return s;
      }));
    } catch (e: any) {
      alert('Failed to remove activity: ' + e.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500">{error}</div>;

  const totalTripCost = sections.reduce((sum, s) => {
    return sum + (s.activities || []).reduce((acc: number, a: any) => acc + (Number(a.actualCost) || Number(a.activity?.avgCost) || 0), 0);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link to="/trips" className="text-sm text-primary hover:underline mb-1 inline-block">&larr; Back to Trips</Link>
              <h1 className="text-2xl font-bold text-slate-900">{trip?.title}</h1>
              <div className="flex items-center text-sm text-slate-500 mt-1 space-x-4">
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {new Date(trip?.startDate).toLocaleDateString()} - {new Date(trip?.endDate).toLocaleDateString()}</span>
                {trip?.status === 'completed' && <span className="flex items-center text-green-600"><CheckCircle2 className="w-4 h-4 mr-1" /> Completed</span>}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link to={`/trips/${tripId}/builder`} className="inline-flex items-center justify-center rounded-md border border-input bg-background h-9 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                <LayoutList className="w-4 h-4 mr-2" /> Edit Sections
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex justify-between items-end mb-8 border-b border-border pb-4">
          <h2 className="text-xl font-bold text-slate-900">Detailed Itinerary</h2>
          <div className="text-right">
            <p className="text-sm text-slate-500 mb-1">Total Trip Expense</p>
            <p className="text-2xl font-bold text-slate-900">${totalTripCost.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-12 relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200 -z-10 hidden sm:block"></div>

          {sections.map((section, sIdx) => {
            const sectionTotal = (section.activities || []).reduce((acc: number, a: any) => acc + (Number(a.actualCost) || Number(a.activity?.avgCost) || 0), 0);
            
            return (
              <div key={section.id} className="relative">
                {/* Section Header */}
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-white rounded-full border-4 border-slate-50 flex flex-col items-center justify-center shadow-sm shrink-0 relative z-10 hidden sm:flex">
                    <span className="text-xs text-slate-400 font-bold uppercase">Sec</span>
                    <span className="text-lg font-bold text-primary">{sIdx + 1}</span>
                  </div>
                  <div className="sm:ml-6 flex-1 bg-primary/5 p-4 rounded-xl border border-primary/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{section.title}</h3>
                        <div className="flex space-x-4 text-sm text-slate-600 mt-1">
                          {section.cityName && <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {section.cityName}</span>}
                          <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {new Date(section.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500 uppercase font-semibold">Section Total</span>
                        <div className="font-bold text-slate-900">${sectionTotal.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activities List */}
                <div className="sm:ml-22 space-y-4">
                  {(section.activities || []).map((act: any, aIdx: number) => {
                    const cost = act.actualCost || act.activity?.avgCost || 0;
                    return (
                      <div key={act.id} className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row gap-4 hover:border-slate-300 transition-colors">
                        <div className="flex-1 flex gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                            {act.activity?.category === 'Food' ? '🍽️' : 
                             act.activity?.category === 'Transport' ? '🚆' : 
                             act.activity?.category === 'Accommodation' ? '🏨' : '🏛️'}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Day {act.dayNumber || 1}</span>
                              <h4 className="font-bold text-slate-900">{act.activity?.name || 'Activity'}</h4>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">{act.notes || act.activity?.description}</p>
                            
                            <div className="flex items-center space-x-4 mt-3 text-xs text-slate-500 font-medium">
                              {act.scheduledTime && (
                                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {act.scheduledTime}</span>
                              )}
                              {act.activity?.category && (
                                <span className="bg-slate-50 px-2 py-1 rounded">{act.activity.category}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="sm:w-32 flex flex-col justify-center sm:items-end border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-4">
                           <span className="text-xs text-slate-400 mb-1">Expense</span>
                           <div className="flex items-center">
                             <DollarSign className="w-4 h-4 text-slate-400" />
                             <input 
                               type="number" 
                               defaultValue={cost}
                               onBlur={(e) => updateCost(section.id, act.id, Number(e.target.value))}
                               className="w-16 font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary focus:outline-none text-right px-1"
                             />
                           </div>
                         </div>
                         <button 
                           onClick={() => removeActivity(section.id, act.id)}
                           className="text-slate-300 hover:text-red-500 transition-colors p-1 mt-2 sm:mt-0 sm:absolute sm:top-2 sm:right-2 rounded-md hover:bg-red-50 opacity-0 group-hover:opacity-100"
                           title="Remove Activity"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    );
                  })}
                  
                  {addingToSection === section.id && (
                    <div className="bg-primary/5 p-5 rounded-xl border border-primary/20 shadow-sm mt-4">
                      <h4 className="font-semibold text-slate-900 mb-3">Add New Activity</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Select Activity</label>
                          <select 
                            value={newActivityForm.activityId} 
                            onChange={e => {
                              const act = availableActivities.find(a => a.id === e.target.value);
                              setNewActivityForm(f => ({ ...f, activityId: e.target.value, actualCost: act?.avgCost || 0 }));
                            }}
                            className="w-full text-sm p-2 border border-border rounded-md bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                          >
                            <option value="">-- Choose an Activity --</option>
                            {availableActivities.map(a => (
                              <option key={a.id} value={a.id}>{a.name} ({a.category})</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-700 mb-1">Day</label>
                            <input 
                              type="number" min="1" 
                              value={newActivityForm.dayNumber} 
                              onChange={e => setNewActivityForm(f => ({ ...f, dayNumber: Number(e.target.value) }))}
                              className="w-full text-sm p-2 border border-border rounded-md bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-700 mb-1">Time</label>
                            <input 
                              type="time" 
                              value={newActivityForm.scheduledTime} 
                              onChange={e => setNewActivityForm(f => ({ ...f, scheduledTime: e.target.value }))}
                              className="w-full text-sm p-2 border border-border rounded-md bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
                          <input 
                            type="text" 
                            placeholder="Optional notes..."
                            value={newActivityForm.notes} 
                            onChange={e => setNewActivityForm(f => ({ ...f, notes: e.target.value }))}
                            className="w-full text-sm p-2 border border-border rounded-md bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button 
                          onClick={() => setAddingToSection(null)} 
                          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleAddActivity(section.id)}
                          className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 font-medium shadow-sm"
                        >
                          Save Activity
                        </button>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      setAddingToSection(section.id);
                      setNewActivityForm({ activityId: '', dayNumber: 1, scheduledTime: '09:00', actualCost: 0, notes: '' });
                    }}
                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center font-medium text-sm mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Activity
                  </button>

                  
                  {(!section.activities || section.activities.length === 0) && (
                    <div className="text-sm text-slate-400 italic p-4 bg-white/50 border border-dashed border-slate-200 rounded-xl">
                      No activities planned for this section yet.
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {sections.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              Your itinerary is empty. Build out your trip sections first.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
