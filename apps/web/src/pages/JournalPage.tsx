import { useState, useEffect } from 'react';
import { BookOpen, Search, Map as MapIcon, LayoutGrid, MapPin, X, Image as ImageIcon } from 'lucide-react';
import { MOCK_JOURNAL, MOCK_TRIPS } from '../lib/mock-data';

export default function JournalPage() {
  const [loading, setLoading] = useState(true);
  const [journalView, setJournalView] = useState<'grid' | 'map'>('grid');
  const [showEditor, setShowEditor] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [activeMoods, setActiveMoods] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrip, setSelectedTrip] = useState('all');

  const moods = ['🌅', '🌿', '🤿', '🏔️', '🪔', '⭐'];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const toggleMood = (m: string) => {
    setActiveMoods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const filteredJournal = MOCK_JOURNAL.filter(entry => {
    const matchSearch = (entry.title + entry.excerpt).toLowerCase().includes(searchQuery.toLowerCase());
    const matchTrip = selectedTrip === 'all' || entry.tripId === selectedTrip;
    const matchMood = activeMoods.length === 0 || activeMoods.includes(entry.mood);
    return matchSearch && matchTrip && matchMood;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <style>{`
        .journal-map {
          background: #1a2035;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* HEADER */}
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-6 flex items-end justify-between border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" /> My Travel Journal
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">12 memories across 5 trips</p>
        </div>
        <button 
          onClick={() => { setShowEditor(true); setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100); }}
          className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
        >
          + New Entry
        </button>
      </div>

      {/* FILTERS BAR & VIEW TOGGLE */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          <select 
            value={selectedTrip}
            onChange={(e) => setSelectedTrip(e.target.value)}
            className="bg-white/80 backdrop-blur border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Trips</option>
            {Object.values(MOCK_TRIPS).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <div className="flex items-center gap-1 bg-white/80 backdrop-blur border border-slate-200 rounded-lg p-1">
            {moods.map(m => (
              <button 
                key={m} 
                onClick={() => toggleMood(m)}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${activeMoods.includes(m) ? 'bg-indigo-100 ring-1 ring-indigo-400' : 'hover:bg-slate-100'}`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="relative flex-shrink-0 w-48">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              placeholder="Search memories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 backdrop-blur border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input type="date" className="bg-white/80 backdrop-blur border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            <span className="text-slate-400">-</span>
            <input type="date" className="bg-white/80 backdrop-blur border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
        </div>

        <div className="flex items-center bg-slate-200/50 p-1 rounded-lg">
          <button onClick={() => setJournalView('grid')} className={`px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors ${journalView === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
            <LayoutGrid className="w-4 h-4" /> Grid
          </button>
          <button onClick={() => setJournalView('map')} className={`px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors ${journalView === 'map' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
            <MapIcon className="w-4 h-4" /> Map
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-slate-200 animate-pulse h-64 rounded-2xl" />
            ))}
          </div>
        ) : filteredJournal.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No journal entries match your filters.</h3>
            <button 
              onClick={() => { setActiveMoods([]); setSearchQuery(''); setSelectedTrip('all'); }} 
              className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : journalView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJournal.map(entry => {
              const tripGradient = MOCK_TRIPS[entry.tripId]?.gradient || 'linear-gradient(135deg, #slate-500, #slate-800)';
              return (
                <div 
                  key={entry.id} 
                  className="bg-white/60 backdrop-blur-md border border-[rgba(255,255,255,0.4)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 rounded-2xl overflow-hidden flex flex-col group cursor-pointer"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="h-[180px] w-full overflow-hidden relative">
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" style={{ background: tripGradient }} />
                    <div className="absolute top-3 right-3 w-8 h-8 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-sm shadow-sm border border-white/20">
                      {entry.mood}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-2">
                      <MapPin className="w-3 h-3" /> {entry.location}
                    </div>
                    <div className="text-xs text-slate-400 mb-1">{entry.date}</div>
                    <h3 className="text-[16px] font-bold text-slate-900 leading-tight mb-2 truncate">{entry.title}</h3>
                    <p className="text-[14px] text-slate-500 line-clamp-2 mb-4 flex-grow">{entry.excerpt}</p>
                    <div className="text-[12px] font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors">
                      Read More &rarr;
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full h-[500px] journal-map rounded-2xl border border-[rgba(255,255,255,0.2)] shadow-sm relative overflow-hidden">
            <div className="absolute top-4 left-4 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-bold shadow-sm">
              Global View
            </div>
            {/* Hardcoded Pins Simulation */}
            {filteredJournal.map((entry, i) => (
              <div 
                key={entry.id} 
                className="absolute group"
                style={{ top: `${30 + i * 15}%`, left: `${25 + i * 20}%` }}
              >
                <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center cursor-pointer shadow-md bg-amber-500 hover:scale-110 transition-transform">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 w-[180px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none p-2 flex flex-col gap-2 z-10">
                  <div className="h-[80px] rounded-lg" style={{ background: entry.gradient }} />
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900 leading-tight">{entry.title}</h4>
                    <div className="text-[11px] text-slate-500 mt-0.5">{entry.date}</div>
                    <div className="text-[11px] font-bold text-indigo-600 mt-1">Open Entry &rarr;</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ENTRY EDITOR */}
      {showEditor && (
        <div className="max-w-4xl mx-auto px-4 pb-20 animate-[fadeInUp_300ms]">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-2xl p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <input 
                placeholder="Name this memory..." 
                className="text-[28px] font-serif font-bold text-slate-900 bg-transparent outline-none w-full placeholder:text-slate-300"
              />
              <button onClick={() => setShowEditor(false)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors ml-4">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-3 bg-white/50 border border-slate-200 rounded-xl px-4 py-3">
                <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <input placeholder="Where were you?" className="bg-transparent text-sm w-full outline-none font-medium text-slate-700" />
              </div>
              <input type="date" className="bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none" />
            </div>

            <div className="mb-8">
              <label className="block text-[14px] text-slate-500 font-medium mb-3">How did it feel?</label>
              <div className="flex items-center gap-3">
                {moods.map(m => (
                  <button 
                    key={m}
                    className="w-10 h-10 rounded-full text-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-all hover:scale-110 focus:outline-2 focus:outline-indigo-500 focus:outline-offset-2"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <textarea 
              placeholder="Write about your experience..." 
              className="w-full min-h-[200px] bg-white/50 border border-slate-200 rounded-xl p-5 text-[16px] leading-[1.7] text-slate-800 outline-none resize-none mb-8 placeholder:text-slate-400"
            />

            <div className="border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-colors mb-8 group">
              <ImageIcon className="w-8 h-8 text-slate-300 mb-3 group-hover:text-indigo-400 transition-colors" />
              <p className="text-[14px] text-slate-500 font-medium">Drag photos here or click to upload</p>
            </div>

            <button 
              onClick={() => { alert('Memory saved! 💖'); setShowEditor(false); }}
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-xl text-[15px] font-bold shadow-md hover:shadow-lg transition-all"
            >
              Save Memory 📖
            </button>
          </div>
        </div>
      )}

      {/* READ MORE MODAL */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeInUp_200ms]">
          <div className="bg-white/90 backdrop-blur-xl w-full max-w-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="h-48 relative flex-shrink-0" style={{ background: selectedEntry.gradient }}>
              <button 
                onClick={() => setSelectedEntry(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute -bottom-6 left-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-2xl border-4 border-white">
                {selectedEntry.mood}
              </div>
            </div>
            <div className="px-8 pt-10 pb-8 overflow-y-auto">
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">{selectedEntry.title}</h2>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-500 mb-8">
                <span className="flex items-center gap-1 text-amber-600"><MapPin className="w-4 h-4" />{selectedEntry.location}</span>
                <span>·</span>
                <span>{selectedEntry.date}</span>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {selectedEntry.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
