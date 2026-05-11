import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, Users, Search, Edit2, ExternalLink
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, AreaChart, Area, ReferenceLine
} from 'recharts';
import { MOCK_USER, MOCK_ADMIN_USERS } from '../lib/mock-data';

const userGrowthData = [
  {month:"Jun",total:32000,active:18000},{month:"Jul",total:34500,active:20000},
  {month:"Aug",total:37200,active:22000},{month:"Sep",total:39800,active:24500},
  {month:"Oct",total:42000,active:26000},{month:"Nov",total:44800,active:29000},
  {month:"Dec",total:46200,active:31000},{month:"Jan",total:47100,active:33000},
  {month:"Feb",total:47800,active:35000},{month:"Mar",total:48100,active:37000},
  {month:"Apr",total:48200,active:39000},{month:"May",total:48320,active:41000},
];

const destData = [
  {city:"Bali",trips:2840},{city:"Tokyo",trips:2310},{city:"Paris",trips:1980},
  {city:"New York",trips:1750},{city:"Lisbon",trips:1420},{city:"Santorini",trips:1280},
  {city:"Kyoto",trips:1100},{city:"Cape Town",trips:980},
];

const tierData = [
  { name:"Free",     value:62, color:"#6b7280" },
  { name:"Pro",      value:29, color:"#6366f1" },
  { name:"Business", value:9,  color:"#f59e0b" },
];

const sessionData = Array.from({length:30},(_,i) => ({
  day:i+1, 
  sessions: 8000 + Math.floor(Math.sin(i/3)*2000) + Math.floor(Math.random()*500)
}));

const INITIAL_EVENTS = [
  { type: 'user', text: 'New signup: maya@example.com', color: '#10b981' },
  { type: 'trip', text: 'Trip created: "Bali Honeymoon" by alex@example.com', color: '#6366f1' },
  { type: 'pay', text: 'Pro subscription: james@example.com', color: '#f59e0b' },
];

const ADMIN_EVENTS_POOL = [
  { type: 'view', text: 'Public itinerary viewed: Tokyo 2024', color: '#8b5cf6' },
  { type: 'user', text: 'New signup: liam@example.com', color: '#10b981' },
  { type: 'trip', text: 'Budget updated: Amalfi Coast trip', color: '#6366f1' },
  { type: 'trip', text: 'Trip completed: Patagonia Expedition', color: '#3b82f6' },
  { type: 'pay', text: 'Business plan upgrade: teamtravel@corp.com', color: '#f59e0b' },
];

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [liveEvents, setLiveEvents] = useState(INITIAL_EVENTS);
  const [userSearch, setUserSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<{key: string, dir: 'asc'|'desc'} | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setLiveEvents(prev => {
        const newEvent = { ...ADMIN_EVENTS_POOL[index % ADMIN_EVENTS_POOL.length], id: Date.now() };
        index++;
        return [newEvent, ...prev].slice(0, 10);
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  let filteredUsers = MOCK_ADMIN_USERS.filter(u => {
    const mSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const mPlan = planFilter === 'All' || u.plan === planFilter;
    return mSearch && mPlan;
  });

  if(sortConfig) {
    filteredUsers.sort((a: any, b: any) => {
      let aVal = a[sortConfig.key], bVal = b[sortConfig.key];
      if(sortConfig.key === 'trips') { aVal = Number(aVal); bVal = Number(bVal); }
      if(aVal < bVal) return sortConfig.dir === 'asc' ? -1 : 1;
      if(aVal > bVal) return sortConfig.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if(prev?.key === key) return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      return { key, dir: 'asc' };
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans">
      {/* DEDICATED ADMIN TOP NAV */}
      <div className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-800 h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-sm shadow-indigo-500/20">
            T
          </div>
          <div className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-bold tracking-wider uppercase">
            Admin Panel
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-slate-700">
              {MOCK_USER.avatar}
            </div>
            <span className="text-sm font-bold hidden sm:block">{MOCK_USER.name}</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <Link to="/" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            &larr; Back to App
          </Link>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        
        {/* KPI CARDS */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-800/50 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-[fadeInUp_200ms]">
            {[
              { label: 'Monthly Active Users', val: '48,320', change: '+12%', up: true },
              { label: 'New Signups', val: '3,840', change: '+8%', up: true },
              { label: 'Trips Created', val: '12,490', change: '+19%', up: true },
              { label: 'MRR', val: '$84,200', change: '-2%', up: false },
            ].map((kpi, i) => (
              <div key={i} className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-5 shadow-sm">
                <div className="text-sm text-slate-400 font-medium mb-1">{kpi.label}</div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl sm:text-3xl font-bold">{kpi.val}</div>
                  <div className={`flex items-center text-xs font-bold ${kpi.up ? 'text-emerald-400' : 'text-red-400'}`}>
                    {kpi.up ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                    {kpi.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CHARTS 2x2 GRID */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-[300px] bg-slate-800/50 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-[fadeInUp_200ms]">
            
            {/* Chart 1: User Growth */}
            <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-5 h-[320px]">
              <h3 className="text-sm font-bold mb-4">User Growth</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff"}} />
                  <Legend wrapperStyle={{color:"rgba(255,255,255,0.5)",fontSize:12}} />
                  <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={false} name="Total Users" isAnimationActive animationDuration={1000} />
                  <Line type="monotone" dataKey="active" stroke="#f59e0b" strokeWidth={2} dot={false} name="Active Users" isAnimationActive animationDuration={1200} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Top Destinations */}
            <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-5 h-[320px]">
              <h3 className="text-sm font-bold mb-4">Top Destinations</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={destData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="city" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} width={70} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff"}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="trips" name="Trips" radius={[0,4,4,0]} isAnimationActive animationDuration={1000} barSize={16}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    {destData.map((_,i) => <Cell key={i} fill="url(#barGrad)" />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 3: Subscription Tiers */}
            <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-5 h-[320px] flex flex-col">
              <h3 className="text-sm font-bold mb-4">Subscription Tiers</h3>
              <div className="flex-grow flex items-center justify-between px-4">
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    <Pie data={tierData} cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2} dataKey="value" stroke="none" isAnimationActive animationDuration={1000}>
                      {tierData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{background:"#1e293b",border:"none",borderRadius:"8px"}} itemStyle={{color:"#fff"}} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-[40%] space-y-4">
                  {tierData.map((t, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                        <span className="text-sm font-medium">{t.name}</span>
                      </div>
                      <span className="text-sm font-bold">{t.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart 4: Daily Active Sessions */}
            <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-5 h-[320px]">
              <h3 className="text-sm font-bold mb-4">Daily Active Sessions</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sessionData}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:"#fff"}} />
                  <ReferenceLine y={10000} label={{ position: 'top', value: 'Target', fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} stroke="#f59e0b" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="sessions" stroke="#6366f1" fillOpacity={1} fill="url(#colorSessions)" isAnimationActive animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* BOTTOM SECTION: Users Table + Live Feed */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-[fadeInUp_200ms]">
          
          {/* USER TABLE */}
          <div className="xl:col-span-2 bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold font-serif">Users</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                    placeholder="Search users..." 
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <select 
                  value={planFilter}
                  onChange={e => setPlanFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Plans</option>
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Business">Business</option>
                </select>
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-sm transition-colors">
                  Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="pb-3 font-bold text-xs text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>Avatar+Name {sortConfig?.key === 'name' ? (sortConfig.dir === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="pb-3 font-bold text-xs text-slate-400">Email</th>
                    <th className="pb-3 font-bold text-xs text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('plan')}>Plan {sortConfig?.key === 'plan' ? (sortConfig.dir === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="pb-3 font-bold text-xs text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('lastActive')}>Last Active {sortConfig?.key === 'lastActive' ? (sortConfig.dir === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="pb-3 font-bold text-xs text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('trips')}>Trips {sortConfig?.key === 'trips' ? (sortConfig.dir === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="pb-3 font-bold text-xs text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No users match your search
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.slice(0, 5).map(u => (
                      <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[10px] text-white">
                              {u.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <span className="font-bold text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-400">{u.email}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.plan === 'Pro' ? 'bg-indigo-500/20 text-indigo-400' : u.plan === 'Business' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'}`}>
                            {u.plan}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400">{u.lastActive}</td>
                        <td className="py-3 text-slate-300 font-medium">{u.trips}</td>
                        <td className="py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors" title="Suspend">∅</button>
                            <button className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-colors"><ExternalLink className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {filteredUsers.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-slate-500">Showing 1–{Math.min(5, filteredUsers.length)} of {MOCK_ADMIN_USERS.length}</div>
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs font-bold text-slate-400 bg-slate-800 rounded hover:bg-slate-700">Prev</button>
                    <button className="px-2 py-1 text-xs font-bold text-slate-400 bg-slate-800 rounded hover:bg-slate-700">Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* REAL-TIME ACTIVITY FEED */}
          <div className="xl:col-span-1 bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-5 flex flex-col max-h-[500px]">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-bold font-serif">Live Activity</h2>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            </div>
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
              `}</style>
              {liveEvents.map((ev: any, i) => (
                <div key={ev.id || i} className="flex items-start gap-3 animate-[fadeInUp_300ms]">
                  <div className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: ev.color }} />
                  <div>
                    <div className="text-[13px] text-slate-200 leading-tight">{ev.text}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{i === 0 ? 'just now' : `${i*8}s ago`}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
