import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, CalendarDays, LayoutTemplate, Printer, Share2, 
  MapPin, Clock, Download 
} from 'lucide-react';
import { MOCK_TRIPS, MOCK_ACTIVITIES, categoryColors } from '../lib/mock-data';

export default function ItineraryTimeline() {
  const { id: tripId } = useParams<{ id: string }>();
  const trip = MOCK_TRIPS['t_001'];
  
  const [viewMode, setViewMode] = useState<'chrono' | 'gantt'>('chrono');
  const [showShareModal, setShowShareModal] = useState(false);

  // Group activities by day
  const days = [1, 2, 3, 4];
  const groupedActivities = days.reduce((acc, day) => {
    acc[day] = MOCK_ACTIVITIES.filter(a => a.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<number, typeof MOCK_ACTIVITIES>);

  const handleExport = () => {
    window.print();
  };

  const calculateGanttPosition = (startTime: string, durationMin: number) => {
    const [h, m] = startTime.split(':').map(Number);
    const top = ((h * 60 + m) / (24 * 60)) * 100;
    const height = (durationMin / (24 * 60)) * 100;
    return { top: `${top}%`, height: `${height}%` };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <style>{`
        @media print {
          body { background: white; }
          .print-hide { display: none !important; }
          .print-break { page-break-before: always; }
          .gantt-container { overflow: visible !important; height: auto !important; }
        }
      `}</style>

      {/* STICKY NAV BAR */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm print-hide">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/trips/${tripId}/builder`} className="p-2 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-lg leading-tight">{trip.name}</h1>
              <div className="text-xs text-slate-500 font-medium">
                {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('chrono')}
                className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors ${viewMode === 'chrono' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <CalendarDays className="w-4 h-4" /> Chronological
              </button>
              <button 
                onClick={() => setViewMode('gantt')}
                className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors ${viewMode === 'gantt' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutTemplate className="w-4 h-4" /> Gantt Chart
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => setShowShareModal(true)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden sm:flex">
                <Share2 className="w-5 h-5" />
              </button>
              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-slate-800 transition-colors">
                <Printer className="w-4 h-4 hidden sm:block" />
                <Download className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile View Switcher */}
        <div className="flex sm:hidden bg-slate-100 p-1 rounded-none border-t border-slate-200">
          <button 
            onClick={() => setViewMode('chrono')}
            className={`flex-1 py-2 text-sm font-bold flex justify-center items-center gap-2 ${viewMode === 'chrono' ? 'bg-white text-indigo-600 shadow-sm rounded-md' : 'text-slate-500'}`}
          >
            <CalendarDays className="w-4 h-4" /> List
          </button>
          <button 
            onClick={() => setViewMode('gantt')}
            className={`flex-1 py-2 text-sm font-bold flex justify-center items-center gap-2 ${viewMode === 'gantt' ? 'bg-white text-indigo-600 shadow-sm rounded-md' : 'text-slate-500'}`}
          >
            <LayoutTemplate className="w-4 h-4" /> Gantt
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* CHRONOLOGICAL MODE */}
        {viewMode === 'chrono' && (
          <div className="max-w-3xl mx-auto space-y-12">
            {days.map(day => (
              <div key={day} className="relative print-break">
                <div className="flex items-center gap-4 mb-6 sticky top-[120px] sm:top-[80px] bg-slate-50/90 backdrop-blur py-2 z-10 print-hide">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm">
                    {day}
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-slate-900">Day {day}</h2>
                    <p className="text-sm text-slate-500 font-medium">
                      {new Date(new Date(trip.startDate).getTime() + (day - 1)*86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                <div className="ml-6 sm:ml-24 space-y-6 relative before:absolute before:inset-0 before:ml-[11px] sm:before:-ml-[43px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {groupedActivities[day].map((act) => (
                    <div key={act.id} className="relative flex items-start group">
                      <div className="absolute left-[-23px] sm:left-[-76px] top-1 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full border-4 border-slate-50 z-10 shadow-sm" style={{ backgroundColor: categoryColors[act.type] || '#94a3b8' }} />
                      </div>
                      
                      <div className="hidden sm:block absolute left-[-160px] top-1 text-right w-20">
                        <div className="text-sm font-bold text-slate-900">{act.startTime}</div>
                        <div className="text-xs text-slate-400 font-medium">{Math.floor(act.duration/60)}h {act.duration%60}m</div>
                      </div>

                      <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow w-full ml-4 sm:ml-0 group-hover:border-indigo-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 bottom-0 w-1 opacity-50" style={{ backgroundColor: categoryColors[act.type] || '#94a3b8' }} />
                        <div className="sm:hidden mb-2 flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{act.startTime}</span>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-500 font-medium">{Math.floor(act.duration/60)}h {act.duration%60}m</span>
                        </div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-slate-900 leading-tight">{act.title}</h3>
                          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-slate-50 text-slate-500 rounded-lg whitespace-nowrap hidden sm:block">
                            {act.type}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 font-medium mb-3">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-400" /> {act.location}
                          </div>
                          {act.cost > 0 && (
                            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                              ${act.cost}
                            </div>
                          )}
                        </div>
                        {act.notes && (
                          <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            {act.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GANTT CHART MODE */}
        {viewMode === 'gantt' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto gantt-container">
            <div className="min-w-[800px] p-6 relative" style={{ height: '800px' }}>
              {/* Background grid */}
              <div className="absolute inset-0 left-16 right-6 top-16 bottom-6 flex justify-between opacity-50">
                {days.map(d => (
                  <div key={d} className="flex-1 border-l border-slate-100 h-full relative">
                    {/* Horizontal hour lines */}
                    {[0, 4, 8, 12, 16, 20].map(h => (
                      <div key={h} className="absolute left-0 right-0 border-t border-slate-100" style={{ top: `${(h/24)*100}%` }} />
                    ))}
                  </div>
                ))}
              </div>

              {/* Y-axis (Hours) */}
              <div className="absolute left-0 top-16 bottom-6 w-16 flex flex-col font-bold text-xs text-slate-400 text-right pr-4">
                {[0, 4, 8, 12, 16, 20].map(h => (
                  <div key={h} className="absolute w-full" style={{ top: `${(h/24)*100}%`, transform: 'translateY(-50%)' }}>
                    {h}:00
                  </div>
                ))}
              </div>

              {/* X-axis (Days) & Blocks */}
              <div className="absolute inset-0 left-16 right-6 top-6 bottom-6 flex justify-between">
                {days.map(day => (
                  <div key={day} className="flex-1 relative mx-2">
                    <div className="absolute -top-10 left-0 right-0 text-center font-bold text-sm text-slate-900 bg-slate-50 py-2 rounded-lg border border-slate-100">
                      Day {day}
                    </div>
                    
                    <div className="relative w-full h-full mt-10">
                      {groupedActivities[day].map((act) => {
                        const { top, height } = calculateGanttPosition(act.startTime, act.duration);
                        return (
                          <div 
                            key={act.id} 
                            className="absolute left-0 right-0 rounded-lg p-2 text-white overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-[1.02] hover:z-10 cursor-default flex flex-col justify-between"
                            style={{ 
                              top, 
                              height, 
                              backgroundColor: categoryColors[act.type] || '#94a3b8',
                              minHeight: '24px'
                            }}
                            title={`${act.title} (${act.startTime} - ${Math.floor(act.duration/60)}h ${act.duration%60}m)`}
                          >
                            <div className="font-bold text-xs truncate drop-shadow-sm">{act.title}</div>
                            {parseInt(height) > 4 && (
                              <div className="text-[10px] font-medium opacity-90 truncate flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {act.startTime}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print-hide animate-[fadeInUp_200ms]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg">Share Itinerary</h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">Anyone with this link can view the timeline.</p>
              <div className="flex gap-2">
                <input readOnly value={`https://traveloop.app/trip/${tripId}/timeline`} className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium" />
                <button onClick={() => { alert('Copied!'); setShowShareModal(false); }} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
