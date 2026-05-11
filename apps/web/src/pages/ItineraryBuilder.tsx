import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronDown, ChevronRight, GripVertical, Plus, MapPin, Edit2, Copy, Trash2, 
  Inbox, Sparkles, Map, MousePointer, X 
} from 'lucide-react';
import { MOCK_TRIPS, MOCK_ACTIVITIES, categoryColors } from '../lib/mock-data';

export default function ItineraryBuilder() {
  const { id: tripId } = useParams<{ id: string }>();
  
  const trip = MOCK_TRIPS['t_001']; // Hardcoded active trip context per prompt
  
  const [activeDay, setActiveDay] = useState(1);
  const [activities, setActivities] = useState([...MOCK_ACTIVITIES]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [showAISuggest, setShowAISuggest] = useState(false);
  const [mapPanelVisible, setMapPanelVisible] = useState(true);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [mobileTab, setMobileTab] = useState<'days' | 'activities' | 'map'>('activities');
  const [days, setDays] = useState([1, 2, 3, 4, 5, 6, 7]);
  
  const [newActivity, setNewActivity] = useState({
    title: '', type: 'Activity', startTime: '10:00', duration: 60, cost: 0, location: '', notes: ''
  });

  const dayActivities = activities.filter(a => a.day === activeDay).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const dayTotal = dayActivities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
  
  const handleUpdateInline = (id: string, field: string, value: any) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
    setEditingActivity(null);
  };

  const handleAddActivity = () => {
    const activity = {
      ...newActivity,
      id: `a${Date.now()}`,
      day: activeDay,
    };
    setActivities([...activities, activity]);
    setShowAddActivity(false);
    setNewActivity({ title: '', type: 'Activity', startTime: '10:00', duration: 60, cost: 0, location: '', notes: '' });
  };

  const selectedActivityData = activities.find(a => a.id === selectedActivity);

  return (
    <>
      <style>{`
        :root {
          --glass-border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .map-grid {
          background: #1a2035;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-pin {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6); }
          70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
      `}</style>

      {/* Mobile Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-t border-[var(--glass-border)] z-50 flex sm:hidden justify-around items-center">
        <button onClick={() => setMobileTab('days')} className={`flex flex-col items-center ${mobileTab === 'days' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className="text-xl">📅</div><span className="text-[10px] font-bold">Days</span>
        </button>
        <button onClick={() => setMobileTab('activities')} className={`flex flex-col items-center ${mobileTab === 'activities' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className="text-xl">🗓</div><span className="text-[10px] font-bold">Activities</span>
        </button>
        <button onClick={() => setMobileTab('map')} className={`flex flex-col items-center ${mobileTab === 'map' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className="text-xl">🗺</div><span className="text-[10px] font-bold">Map</span>
        </button>
      </div>

      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 text-slate-900 pb-16 sm:pb-0">
        
        {/* LEFT PANEL — DAY LIST */}
        <div className={`w-full sm:w-[220px] sm:min-w-[220px] bg-black/5 border-r border-[var(--glass-border)] flex-col h-full overflow-y-auto ${mobileTab === 'days' ? 'flex' : 'hidden sm:flex'}`}>
          <div className="p-4 border-b border-[var(--glass-border)]">
            <h2 className="text-sm font-bold truncate">{trip.name}</h2>
            <p className="text-xs text-slate-500 truncate">{trip.destinations.join(' · ')}</p>
            <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
              Active
            </div>
          </div>
          
          <div className="flex-grow py-2">
            {days.map((day) => {
              const count = activities.filter(a => a.day === day).length;
              const date = new Date(trip.startDate);
              date.setDate(date.getDate() + day - 1);
              const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
              
              return (
                <div 
                  key={day}
                  onClick={() => { setActiveDay(day); setMobileTab('activities'); }}
                  className={`flex items-center px-3 py-2 cursor-pointer group ${activeDay === day ? 'border-l-4 border-indigo-600 bg-indigo-600/10' : 'border-l-4 border-transparent hover:bg-black/5'}`}
                >
                  <GripVertical className="w-3 h-3 text-transparent group-hover:text-slate-400 mr-1" />
                  {activeDay === day ? <ChevronDown className="w-3 h-3 text-slate-500 mr-2" /> : <ChevronRight className="w-3 h-3 text-slate-500 mr-2" />}
                  <div className="flex-grow">
                    <div className="text-[13px] font-bold">Day {day}</div>
                    <div className="text-[10px] text-slate-500">{dateStr}</div>
                  </div>
                  <div className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold">
                    [{count}]
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="p-4">
            <button 
              onClick={() => setDays([...days, days.length + 1])}
              className="w-full py-2 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:text-indigo-600 hover:border-indigo-400 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Day
            </button>
          </div>
        </div>

        {/* CENTER PANEL — DAY DETAIL */}
        <div className={`flex-grow bg-white flex-col h-full relative ${mobileTab === 'activities' ? 'flex' : 'hidden sm:flex'}`}>
          <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold">
                Day {activeDay} — {new Date(new Date(trip.startDate).getTime() + (activeDay - 1)*86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h1>
              <p className="text-xs text-slate-500 mt-1">{dayActivities.length} activities planned</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">~12km</span>
              <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">${dayTotal}</span>
              <button 
                className="hidden lg:flex sm:flex ml-2 p-1.5 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                onClick={() => setMapPanelVisible(!mapPanelVisible)}
                title="Toggle Map"
              >
                <Map className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-3 pb-32">
            {dayActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Inbox className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium mb-4">No activities yet for Day {activeDay}</p>
                <button onClick={() => setShowAddActivity(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Activity
                </button>
              </div>
            ) : (
              dayActivities.map((act) => (
                <div 
                  key={act.id} 
                  onClick={() => { setSelectedActivity(act.id); if(window.innerWidth < 640) setMobileTab('map'); }}
                  className={`group relative flex bg-white border rounded-lg shadow-sm overflow-hidden transition-all cursor-pointer ${selectedActivity === act.id ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className={`w-1 transition-colors ${selectedActivity === act.id ? 'brightness-110' : ''}`} style={{ backgroundColor: categoryColors[act.type] || '#94a3b8' }} />
                  <div className="absolute left-1 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity px-1">
                    <GripVertical className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex-grow p-3 pl-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ backgroundColor: categoryColors[act.type] || '#94a3b8' }}>
                          {act.type.charAt(0)}
                        </div>
                        <div>
                          {editingActivity === `${act.id}-title` ? (
                            <input 
                              autoFocus
                              defaultValue={act.title}
                              onBlur={(e) => handleUpdateInline(act.id, 'title', e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleUpdateInline(act.id, 'title', e.currentTarget.value)}
                              className="text-[15px] font-bold border-b border-indigo-400 focus:outline-none"
                            />
                          ) : (
                            <h3 className="text-[15px] font-bold hover:text-indigo-600 transition-colors" onClick={(e) => { e.stopPropagation(); setEditingActivity(`${act.id}-title`); }}>
                              {act.title}
                            </h3>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-2.5 h-2.5 text-slate-400" />
                            <span className="text-[12px] text-slate-500">{act.location}</span>
                            <span className="text-[12px] text-slate-400 px-1">·</span>
                            <span className="text-[12px] text-slate-500 truncate max-w-[200px]" title={act.notes}>{act.notes}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="hidden group-hover:flex items-center gap-1 mr-2 animate-[fadeInUp_200ms]">
                          <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" onClick={(e) => { e.stopPropagation(); setEditingActivity(`${act.id}-title`); }}><Edit2 className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" onClick={(e) => { e.stopPropagation(); }}><Copy className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" onClick={(e) => { e.stopPropagation(); setActivities(prev => prev.filter(a => a.id !== act.id)); }}><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        {editingActivity === `${act.id}-time` ? (
                          <input 
                            type="time" autoFocus defaultValue={act.startTime}
                            onBlur={(e) => handleUpdateInline(act.id, 'startTime', e.target.value)}
                            className="text-[12px] border-b border-indigo-400 focus:outline-none"
                          />
                        ) : (
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-[12px] font-medium" onClick={(e) => { e.stopPropagation(); setEditingActivity(`${act.id}-time`); }}>
                            {act.startTime}
                          </span>
                        )}
                        {act.cost > 0 ? (
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-[12px] font-bold whitespace-nowrap">
                            ${act.cost}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-[12px] font-bold whitespace-nowrap">
                            Free
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {showAddActivity && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg shadow-inner animate-[fadeInUp_200ms]">
                <h4 className="font-bold text-sm mb-3">Add New Activity</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <input className="w-full p-2 border rounded text-sm focus:border-indigo-500 focus:outline-none" placeholder="Title" value={newActivity.title} onChange={e => setNewActivity({...newActivity, title: e.target.value})} />
                  </div>
                  <select className="w-full p-2 border rounded text-sm focus:border-indigo-500 focus:outline-none" value={newActivity.type} onChange={e => setNewActivity({...newActivity, type: e.target.value})}>
                    {Object.keys(categoryColors).map(t => <option key={t}>{t}</option>)}
                  </select>
                  <input type="time" className="w-full p-2 border rounded text-sm focus:border-indigo-500 focus:outline-none" value={newActivity.startTime} onChange={e => setNewActivity({...newActivity, startTime: e.target.value})} />
                  <input type="number" placeholder="Duration (min)" className="w-full p-2 border rounded text-sm focus:border-indigo-500 focus:outline-none" value={newActivity.duration} onChange={e => setNewActivity({...newActivity, duration: Number(e.target.value)})} />
                  <input type="number" placeholder="Cost ($)" className="w-full p-2 border rounded text-sm focus:border-indigo-500 focus:outline-none" value={newActivity.cost} onChange={e => setNewActivity({...newActivity, cost: Number(e.target.value)})} />
                  <div className="col-span-2">
                    <input className="w-full p-2 border rounded text-sm focus:border-indigo-500 focus:outline-none" placeholder="Location" value={newActivity.location} onChange={e => setNewActivity({...newActivity, location: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <textarea rows={2} className="w-full p-2 border rounded text-sm focus:border-indigo-500 focus:outline-none resize-none" placeholder="Notes" value={newActivity.notes} onChange={e => setNewActivity({...newActivity, notes: e.target.value})} />
                  </div>
                  <div className="col-span-2 flex justify-end gap-2 mt-2">
                    <button onClick={() => setShowAddActivity(false)} className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-200 rounded-md">Cancel</button>
                    <button onClick={handleAddActivity} className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-md shadow-sm hover:from-indigo-700 hover:to-indigo-600">Add Activity</button>
                  </div>
                </div>
              </div>
            )}

            {!showAddActivity && (
              <button 
                onClick={() => setShowAddActivity(true)} 
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-sm font-medium text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Activity
              </button>
            )}
          </div>

          <button 
            onClick={() => setShowAISuggest(true)}
            className="absolute bottom-20 right-6 px-4 py-2.5 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-600/30 font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-transform hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> AI Suggestions
          </button>

          <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--glass-border)] p-4 bg-[#0a0f1e]/80 backdrop-blur-xl text-white flex justify-between items-center sm:mb-0 mb-16">
            <div className="text-[13px] text-slate-300">
              <span className="font-bold text-white">Total: ${dayTotal}</span> <span className="mx-1">·</span> {dayActivities.length} Activities <span className="mx-1">·</span> ~12km traveled
            </div>
            <Link to={`/trips/${tripId}/timeline`} className="text-[13px] font-bold text-amber-400 hover:text-amber-300 flex items-center transition-colors">
              View Timeline <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

        {/* RIGHT PANEL — MAP + EDITOR */}
        {(mapPanelVisible || mobileTab === 'map') && (
          <div className={`w-full sm:w-[320px] sm:min-w-[320px] bg-black/10 border-l border-[var(--glass-border)] flex flex-col h-full ${mobileTab === 'map' ? 'flex' : 'hidden sm:flex'}`}>
            <div className="h-[45%] m-4 rounded-xl overflow-hidden relative shadow-inner border border-[var(--glass-border)] map-grid">
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-indigo-500/10 to-transparent" />
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-bold border border-white/20">
                Bali, Indonesia
              </div>
              <div className="absolute bottom-3 right-3 flex flex-col gap-1">
                <button className="w-7 h-7 bg-white/90 rounded text-slate-800 flex items-center justify-center shadow-sm font-bold">+</button>
                <button className="w-7 h-7 bg-white/90 rounded text-slate-800 flex items-center justify-center shadow-sm font-bold">-</button>
              </div>

              {/* Pins Simulation */}
              {dayActivities.map((act, i) => (
                <div 
                  key={act.id} 
                  className="absolute group"
                  style={{ 
                    top: `${20 + (i * 15) % 60}%`, 
                    left: `${20 + (i * 25) % 60}%`, 
                    zIndex: selectedActivity === act.id ? 10 : 1 
                  }}
                >
                  <div className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center cursor-pointer transition-colors shadow-md ${selectedActivity === act.id ? 'bg-amber-500 animate-[pulse-pin_1.5s_ease_infinite]' : 'bg-indigo-600'}`}>
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white/90 backdrop-blur text-slate-900 text-[10px] font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-200">
                    {act.title}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-grow p-4 bg-white/50 overflow-y-auto">
              {!selectedActivityData ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <MousePointer className="w-10 h-10 mb-3 opacity-50" />
                  <p className="text-sm font-medium">Select an activity to edit</p>
                </div>
              ) : (
                <div className="space-y-4 animate-[fadeInUp_200ms]">
                  <h3 className="text-sm font-bold border-b border-slate-200 pb-2">Edit Activity</h3>
                  
                  <div className="space-y-3">
                    <input 
                      value={selectedActivityData.title}
                      onChange={e => handleUpdateInline(selectedActivityData.id, 'title', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded bg-white text-sm focus:border-indigo-500 focus:outline-none font-bold" 
                    />
                    <select 
                      value={selectedActivityData.type}
                      onChange={e => handleUpdateInline(selectedActivityData.id, 'type', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded bg-white text-sm focus:border-indigo-500 focus:outline-none"
                    >
                      {Object.keys(categoryColors).map(t => <option key={t}>{t}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <input 
                        type="time" 
                        value={selectedActivityData.startTime}
                        onChange={e => handleUpdateInline(selectedActivityData.id, 'startTime', e.target.value)}
                        className="w-1/2 p-2 border border-slate-300 rounded bg-white text-sm focus:border-indigo-500 focus:outline-none" 
                      />
                      <input 
                        type="number" 
                        value={selectedActivityData.duration}
                        onChange={e => handleUpdateInline(selectedActivityData.id, 'duration', Number(e.target.value))}
                        className="w-1/2 p-2 border border-slate-300 rounded bg-white text-sm focus:border-indigo-500 focus:outline-none" 
                        placeholder="Mins"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">$</span>
                      <input 
                        type="number" 
                        value={selectedActivityData.cost}
                        onChange={e => handleUpdateInline(selectedActivityData.id, 'cost', Number(e.target.value))}
                        className="w-full p-2 border border-slate-300 rounded bg-white text-sm focus:border-indigo-500 focus:outline-none" 
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                      <input 
                        value={selectedActivityData.location}
                        onChange={e => handleUpdateInline(selectedActivityData.id, 'location', e.target.value)}
                        className="w-full pl-9 p-2 border border-slate-300 rounded bg-white text-sm focus:border-indigo-500 focus:outline-none" 
                      />
                    </div>
                    <textarea 
                      rows={3}
                      value={selectedActivityData.notes}
                      onChange={e => handleUpdateInline(selectedActivityData.id, 'notes', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded bg-white text-sm focus:border-indigo-500 focus:outline-none resize-none" 
                    />
                    
                    <div className="flex gap-2 pt-2">
                      <button className="flex-grow py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg text-sm font-bold shadow-sm hover:shadow">
                        Save Changes
                      </button>
                      <button 
                        onClick={() => { setActivities(prev => prev.filter(a => a.id !== selectedActivityData.id)); setSelectedActivity(null); }}
                        className="px-4 py-2 text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Suggest Drawer */}
      {showAISuggest && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex justify-end">
          <div className="w-full max-w-[400px] h-full bg-white shadow-2xl flex flex-col animate-[fadeInUp_200ms]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" /> AI Suggestions for Day {activeDay}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Based on your travel style: Adventure, Cultural</p>
              </div>
              <button onClick={() => setShowAISuggest(false)} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-grow space-y-4">
              {[
                { title: 'Tanah Lot Temple Visit', type: 'Culture', dur: '3h', cost: 15 },
                { title: 'Canggu Surf Lesson', type: 'Adventure', dur: '2h', cost: 40 },
                { title: 'Balinese Cooking Class', type: 'Food', dur: '4h', cost: 55 },
                { title: 'Sacred Monkey Forest', type: 'Nature', dur: '2h', cost: 10 },
              ].map((sug, i) => (
                <div key={i} className="p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: categoryColors[sug.type] || '#000' }}>
                        {sug.type.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{sug.title}</h4>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">{sug.type}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">{sug.dur}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-amber-600">${sug.cost}</span>
                  </div>
                  <button 
                    onClick={(e) => { 
                      const btn = e.currentTarget; 
                      btn.innerText = "✓ Added"; 
                      btn.className = "w-full py-2 bg-green-50 text-green-600 rounded-lg text-sm font-bold cursor-default border border-green-200"; 
                      btn.disabled = true;
                      handleAddActivity(); 
                    }}
                    className="w-full py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold transition-colors"
                  >
                    + Add to Itinerary
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
