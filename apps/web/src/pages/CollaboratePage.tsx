import { useState, useEffect } from 'react';
import { Share2, MessageSquare, ChevronDown, UserPlus, Settings } from 'lucide-react';
import { MOCK_TRIPS, MOCK_ACTIVITIES, MOCK_COLLABORATORS, categoryColors } from '../lib/mock-data';

const ACTIVITY_FEED = [
  { user:"AC", name:"Alex Chen",   action:`added "Sunset Dinner" to Day 3`,         time:"2 hours ago", color:"#6366f1" },
  { user:"PK", name:"Priya Kumar", action:`commented on the hotel selection`,        time:"5 hours ago", color:"#f59e0b" },
  { user:"JL", name:"James Lee",   action:`updated the budget for Day 2`,            time:"yesterday", color:"#10b981" },
  { user:"PK", name:"Priya Kumar", action:`added "Balinese Cooking Class" to Day 4`, time:"yesterday", color:"#f59e0b" },
  { user:"AC", name:"Alex Chen",   action:`changed Lombok hotel to Ashtari Resort`,  time:"2 days ago", color:"#6366f1" },
  { user:"MR", name:"Marco Rossi", action:`viewed the itinerary`,                   time:"2 days ago", color:"#ef4444" },
  { user:"SR", name:"Sofia Reyes", action:`joined the trip`,                         time:"3 days ago", color:"#8b5cf6" },
  { user:"AC", name:"Alex Chen",   action:`created the trip`,                        time:"5 days ago", color:"#6366f1" },
];

export default function CollaboratePage() {
  const [loading, setLoading] = useState(true);
  const trip = MOCK_TRIPS['t_001'];
  const day1Activities = MOCK_ACTIVITIES.filter(a => a.day === 1).sort((a,b) => a.startTime.localeCompare(b.startTime)).slice(0, 3);
  
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState('');
  const [commentsData, setCommentsData] = useState<Record<string, any[]>>({
    a1: [
      { id: 'c1', name: 'Priya Kumar', initials: 'PK', color: '#f59e0b', text: 'Should we book this in advance? The website says popular slot.', time: '3h ago' },
      { id: 'c2', name: 'Alex Chen', initials: 'AC', color: '#6366f1', text: 'Already booked! Confirmation #BL-2847 😊', time: '2h ago' }
    ]
  });

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState<any>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const handlePostComment = (actId: string) => {
    if(!commentText.trim()) return;
    setCommentsData(prev => ({
      ...prev,
      [actId]: [...(prev[actId] || []), { id: Date.now().toString(), name: 'Alex Chen', initials: 'AC', color: '#6366f1', text: commentText, time: 'Just now' }]
    }));
    setCommentText('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <div className="flex-1 p-8 space-y-6">
          <div className="h-24 bg-slate-200 animate-pulse rounded-xl" />
          <div className="h-64 bg-slate-200 animate-pulse rounded-xl" />
        </div>
        <div className="w-[300px] border-l border-slate-200 p-6 hidden md:block">
          <div className="h-8 bg-slate-200 animate-pulse rounded w-1/2 mb-6" />
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-12 bg-slate-200 animate-pulse rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      <style>{`
        .toggle-switch {
          appearance: none; width: 44px; height: 24px; background: #e2e8f0; border-radius: 999px;
          position: relative; cursor: pointer; outline: none; transition: background 0.3s;
        }
        .toggle-switch:checked { background: #6366f1; }
        .toggle-switch::after {
          content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px;
          background: #fff; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: transform 0.3s;
        }
        .toggle-switch:checked::after { transform: translateX(20px); }
      `}</style>

      {/* LEFT COLUMN: Feed & Activities */}
      <div className="flex-grow p-4 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold leading-tight">{trip.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-medium text-slate-500">{new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>
            </div>
          </div>
          <button 
            onClick={() => alert("Copied mock URL!")}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
          >
            <Share2 className="w-4 h-4" /> Share Trip
          </button>
        </div>

        {/* Recent Activity Feed */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <button className="text-[12px] text-slate-400 font-medium hover:text-indigo-600 transition-colors">Mark all read</button>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
            {ACTIVITY_FEED.map((event, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-sm" style={{ backgroundColor: event.color }}>
                    {event.user}
                  </div>
                  <div className="text-[14px]">
                    <span className="font-bold">{event.name}</span> <span className="text-slate-600">{event.action}</span>
                  </div>
                </div>
                <div className="text-[12px] text-slate-400 whitespace-nowrap ml-4">{event.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Discussions */}
        <div>
          <h2 className="text-xl font-bold mb-4">Discussions (Day 1)</h2>
          <div className="space-y-4">
            {day1Activities.map(act => (
              <div key={act.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: categoryColors[act.type] || '#94a3b8' }}>
                      {act.type.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[16px] leading-tight">{act.title}</h3>
                      <p className="text-[12px] font-medium text-slate-500">{act.startTime} · {act.location}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-md text-[10px] uppercase font-bold tracking-wider">{act.type}</span>
                </div>
                
                <div className="pt-3 border-t border-slate-100">
                  <button 
                    onClick={() => setExpandedComments(prev => ({...prev, [act.id]: !prev[act.id]}))}
                    className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> 
                    {(commentsData[act.id]?.length || 0)} comments
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedComments[act.id] ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {expandedComments[act.id] && (
                    <div className="mt-4 space-y-4 animate-[fadeInUp_200ms]">
                      {commentsData[act.id]?.map(c => (
                        <div key={c.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: c.color }}>{c.initials}</div>
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm p-3 flex-grow text-sm shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-900">{c.name}</span>
                              <span className="text-[11px] text-slate-400 font-medium">{c.time}</span>
                            </div>
                            <p className="text-slate-700">{c.text}</p>
                          </div>
                        </div>
                      ))}
                      {!commentsData[act.id]?.length && (
                        <div className="text-center py-4 text-slate-400 text-sm font-medium flex flex-col items-center">
                          <MessageSquare className="w-6 h-6 mb-2 opacity-50" />
                          Be the first to comment
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <input 
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handlePostComment(act.id)}
                          placeholder="Add a comment..."
                          className="flex-grow p-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                        />
                        <button 
                          onClick={() => handlePostComment(act.id)}
                          className="px-5 h-[42px] bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: Collaborators */}
      <div className="w-full lg:w-[320px] bg-white border-l border-slate-200 flex flex-col h-full lg:h-screen lg:sticky lg:top-0">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-[16px] font-bold">Collaborators ({MOCK_COLLABORATORS.length})</h2>
        </div>
        <div className="p-4 flex-grow overflow-y-auto space-y-2">
          {MOCK_COLLABORATORS.map(user => (
            <div key={user.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl group transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold shadow-sm" style={{ backgroundColor: user.color }}>
                    {user.initials}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${user.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
                <div>
                  <div className="text-[14px] font-bold leading-tight">{user.name}</div>
                  <div className={`text-[11px] font-bold ${user.role === 'Owner' ? 'text-indigo-600' : user.role === 'Editor' ? 'text-amber-600' : 'text-slate-500'}`}>
                    {user.role}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedCollab(user); setShowPermissionModal(true); }}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <div className="pt-4 mt-4 border-t border-slate-100">
            {!showInviteForm ? (
              <button 
                onClick={() => setShowInviteForm(true)}
                className="w-full py-2.5 flex items-center justify-center gap-2 text-[14px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Invite Person
              </button>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 animate-[fadeInUp_200ms]">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500" 
                />
                <select className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-500">
                  <option value="Viewer">Viewer (Read-only)</option>
                  <option value="Editor">Editor (Can modify)</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={() => setShowInviteForm(false)} className="flex-1 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-lg">Cancel</button>
                  <button 
                    onClick={() => {
                      if(inviteEmail.includes('@')) {
                        alert(`Invite sent to ${inviteEmail} 📧`);
                        setShowInviteForm(false);
                        setInviteEmail('');
                      }
                    }}
                    className="flex-1 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                  >
                    Send Invite
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Permission Modal */}
      {showPermissionModal && selectedCollab && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeInUp_200ms]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: selectedCollab.color }}>{selectedCollab.initials}</div>
              <div>
                <h3 className="font-bold text-[16px] leading-tight">Permissions</h3>
                <p className="text-sm text-slate-500">for {selectedCollab.name}</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {[
                { id: 'view', label: 'View Itinerary', desc: 'Can see all trip details', checked: true, disabled: true },
                { id: 'edit', label: 'Edit Activities', desc: 'Can add, modify, delete activities', checked: selectedCollab.role === 'Owner' || selectedCollab.role === 'Editor', disabled: selectedCollab.role === 'Owner' },
                { id: 'budget', label: 'Manage Budget', desc: 'Can see and edit costs', checked: selectedCollab.role === 'Owner', disabled: selectedCollab.role === 'Owner' },
                { id: 'invite', label: 'Invite Others', desc: 'Can invite new collaborators', checked: selectedCollab.role === 'Owner', disabled: selectedCollab.role === 'Owner' },
              ].map(perm => (
                <div key={perm.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-bold text-slate-900">{perm.label}</div>
                    <div className="text-[12px] font-medium text-slate-500">{perm.desc}</div>
                  </div>
                  <input type="checkbox" className="toggle-switch" defaultChecked={perm.checked} disabled={perm.disabled} />
                </div>
              ))}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button onClick={() => setShowPermissionModal(false)} className="flex-1 py-2.5 text-[14px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button onClick={() => setShowPermissionModal(false)} className="flex-1 py-2.5 text-[14px] font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl shadow-sm hover:shadow-md transition-all">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
