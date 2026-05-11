import { useState, useEffect } from 'react';
import { MapPin, Heart, ChevronDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { MOCK_USER, MOCK_TRIPS, MOCK_DESTINATIONS, MOCK_JOURNAL } from '../lib/mock-data';

const FOLLOWERS = [
  { id: 'f1', name:"Priya Kumar",  city:"Bangalore, India",    initials:"PK", color:"#f59e0b" },
  { id: 'f2', name:"James Lee",    city:"Seoul, South Korea",  initials:"JL", color:"#10b981" },
  { id: 'f3', name:"Sofia Reyes",  city:"Mexico City, Mexico", initials:"SR", color:"#8b5cf6" },
  { id: 'f4', name:"Marco Rossi",  city:"Milan, Italy",        initials:"MR", color:"#ef4444" },
  { id: 'f5', name:"Yuki Tanaka",  city:"Osaka, Japan",        initials:"YT", color:"#3b82f6" },
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profileTab, setProfileTab] = useState('trips');
  const [openSettingsSection, setOpenSettingsSection] = useState<string | null>('account');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const toggleSettings = (sec: string) => {
    setOpenSettingsSection(openSettingsSection === sec ? null : sec);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <style>{`
        .toggle-switch {
          appearance: none; width: 40px; height: 22px; background: #cbd5e1; border-radius: 999px;
          position: relative; cursor: pointer; outline: none; transition: background 0.3s;
        }
        .toggle-switch:checked { background: #6366f1; }
        .toggle-switch::after {
          content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px;
          background: #fff; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: transform 0.3s;
        }
        .toggle-switch:checked::after { transform: translateX(18px); }
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.4); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* PROFILE HEADER */}
      <div className="relative bg-white border-b border-slate-200 shadow-sm">
        <div className="h-[200px] w-full" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }} />
        
        <div className="max-w-4xl mx-auto px-6 relative pb-8">
          <div className="absolute -top-12 left-6 w-24 h-24 rounded-full border-4 border-white flex items-center justify-center text-3xl font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {MOCK_USER.avatar}
          </div>
          
          <div className="pt-16 md:flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-serif font-bold text-slate-900">{MOCK_USER.name}</h1>
              <p className="text-[16px] text-slate-500 max-w-[500px] mt-1">{MOCK_USER.bio}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{MOCK_USER.city}</span>
                <span>Member since March 2023</span>
              </div>
              <div className="flex items-center gap-3 mt-4 text-[14px] font-bold text-slate-700">
                <span>8 Trips</span> <span className="text-slate-300">·</span>
                <span>14 Countries</span> <span className="text-slate-300">·</span>
                <span>12 Journal Entries</span> <span className="text-slate-300">·</span>
                <span>{MOCK_USER.followers} Followers</span>
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              <button className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-sm">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="max-w-4xl mx-auto px-6 flex items-center gap-8 border-t border-slate-100 mt-4 overflow-x-auto hide-scrollbar">
          {[
            { id: 'trips', label: 'My Trips' },
            { id: 'wishlist', label: 'Wishlist' },
            { id: 'journal', label: 'Journal' },
            { id: 'followers', label: 'Followers' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setProfileTab(tab.id)}
              className={`py-4 text-[14px] font-bold whitespace-nowrap transition-colors border-b-2 ${profileTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* MAIN CONTENT AREA */}
        <div className="md:col-span-2">
          {loading ? (
            <div className="space-y-6">
              {[1,2,3].map(i => <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-2xl" />)}
            </div>
          ) : (
            <div className="animate-[fadeInUp_200ms]">
              
              {profileTab === 'trips' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Object.values(MOCK_TRIPS).map((t: any) => (
                    <div key={t.id} className="glass-card rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer">
                      <div className="h-24 rounded-xl mb-4" style={{ background: t.gradient || 'linear-gradient(135deg, #94a3b8, #cbd5e1)' }} />
                      <h3 className="font-bold text-lg leading-tight">{t.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{t.destinations.join(' · ')}</p>
                    </div>
                  ))}
                </div>
              )}

              {profileTab === 'wishlist' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {MOCK_DESTINATIONS.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-slate-400 flex flex-col items-center">
                      <Heart className="w-12 h-12 mb-3 opacity-50" />
                      <p className="font-medium">Your wishlist is empty</p>
                      <button className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg text-sm">Explore Destinations</button>
                    </div>
                  ) : (
                    MOCK_DESTINATIONS.map(d => (
                      <div key={d.id} className="glass-card rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer group">
                        <div className="h-32 w-full relative" style={{ background: d.img }}>
                          <button className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full text-white transition-colors">
                            <Heart className="w-4 h-4 fill-white" />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg">{d.name}</h3>
                          <div className="flex gap-2 mt-2">
                            {d.tags.map(t => <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">{t}</span>)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {profileTab === 'journal' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {MOCK_JOURNAL.map(j => (
                    <div key={j.id} className="glass-card rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer flex flex-col">
                      <div className="h-24 w-full relative" style={{ background: j.gradient }} />
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">{j.location}</div>
                        <h3 className="font-bold text-[15px] leading-tight mb-2">{j.title}</h3>
                        <p className="text-[13px] text-slate-500 line-clamp-2">{j.excerpt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {profileTab === 'followers' && (
                <div className="space-y-3">
                  {FOLLOWERS.map(f => (
                    <div key={f.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: f.color }}>{f.initials}</div>
                        <div>
                          <div className="font-bold text-[15px]">{f.name}</div>
                          <div className="text-[12px] text-slate-500 font-medium">{f.city}</div>
                        </div>
                      </div>
                      {following[f.id] ? (
                        <button className="px-3 py-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 rounded-lg cursor-default border border-emerald-200 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Following
                        </button>
                      ) : (
                        <button onClick={() => setFollowing(prev => ({...prev, [f.id]: true}))} className="px-4 py-1.5 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                          Follow Back
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SETTINGS SIDEBAR */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-xl font-bold font-serif mb-6">Settings</h2>
          
          {[
            { id: 'account', title: 'Account Info', content: (
              <div className="space-y-4 p-4">
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 mb-1">Full Name</label>
                  <input defaultValue={MOCK_USER.name} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 mb-1">Email</label>
                  <input defaultValue={MOCK_USER.email} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 mb-1">Bio</label>
                  <textarea defaultValue={MOCK_USER.bio} rows={3} maxLength={160} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 mb-1">Home City</label>
                  <input defaultValue={MOCK_USER.city} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 mb-2">Avatar Color</label>
                  <div className="flex gap-2">
                    {['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'].map(color => (
                      <div key={color} className={`w-8 h-8 rounded-full cursor-pointer ${color === '#6366f1' ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`} style={{ background: color }} />
                    ))}
                  </div>
                </div>
                <button className="w-full py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg text-sm font-bold shadow-sm mt-2">Save Changes</button>
              </div>
            )},
            { id: 'notif', title: 'Notifications', content: (
              <div className="space-y-4 p-4">
                {[
                  { label: 'Email digest (weekly)', desc: 'Summary of your trip activities', on: true },
                  { label: 'Trip reminders', desc: 'Upcoming flights and bookings', on: true },
                  { label: 'Collaborator activity', desc: 'When someone edits your trip', on: true },
                  { label: 'New recommendations', desc: 'AI suggestions for your trips', on: false },
                  { label: 'Marketing emails', desc: 'Product updates and offers', on: false },
                ].map((n, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <div className="text-[14px] font-bold text-slate-900">{n.label}</div>
                      <div className="text-[12px] font-medium text-slate-500">{n.desc}</div>
                    </div>
                    <input type="checkbox" className="toggle-switch flex-shrink-0 ml-4" defaultChecked={n.on} />
                  </div>
                ))}
              </div>
            )},
            { id: 'social', title: 'Connected Accounts', content: (
              <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[14px]">Google</div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[12px] font-bold text-emerald-600"><CheckCircle className="w-3.5 h-3.5" /> Connected</span>
                    <button className="text-[12px] font-bold text-slate-400 hover:text-slate-600">Disconnect</button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[14px]">Apple</div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-slate-400">Not connected</span>
                    <button className="text-[12px] font-bold text-indigo-600 hover:text-indigo-800">Connect</button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[14px]">TripAdvisor</div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-slate-400">Not connected</span>
                    <button className="text-[12px] font-bold text-indigo-600 hover:text-indigo-800">Connect</button>
                  </div>
                </div>
              </div>
            )},
            { id: 'privacy', title: 'Privacy Controls', content: (
              <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[14px] font-bold text-slate-900">Public profile</div>
                  <input type="checkbox" className="toggle-switch" defaultChecked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[14px] font-bold text-slate-900">Show travel history</div>
                  <input type="checkbox" className="toggle-switch" defaultChecked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[14px] font-bold text-slate-900">Allow trip invites from anyone</div>
                  <input type="checkbox" className="toggle-switch" defaultChecked={false} />
                </div>
              </div>
            )},
          ].map(section => (
            <div key={section.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <button 
                onClick={() => toggleSettings(section.id)}
                className="w-full p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-left"
              >
                <span className="font-bold text-[15px]">{section.title}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openSettingsSection === section.id ? 'rotate-180' : ''}`} />
              </button>
              {openSettingsSection === section.id && (
                <div className="border-t border-slate-100 bg-slate-50/50">
                  {section.content}
                </div>
              )}
            </div>
          ))}

          {/* Danger Zone */}
          <div className="mt-8 border border-red-200 bg-red-50/50 rounded-xl p-5">
            <h3 className="text-red-800 font-bold mb-2">Danger Zone</h3>
            <p className="text-xs text-red-600/70 mb-4 font-medium">Once you delete your account, there is no going back. Please be certain.</p>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-2 bg-white border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold rounded-lg text-sm transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeInUp_200ms]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Delete Account</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-medium text-slate-700">
                This action cannot be undone. All your trips, journal entries, and data will be permanently deleted.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Type DELETE to confirm</label>
                <input 
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-red-500" 
                  placeholder="DELETE"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowDeleteModal(false); setDeleteInput(''); }} className="flex-1 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">Cancel</button>
                <button 
                  disabled={deleteInput !== 'DELETE'}
                  className={`flex-1 py-2 text-sm font-bold text-white rounded-lg transition-colors ${deleteInput === 'DELETE' ? 'bg-gradient-to-r from-red-600 to-red-500 hover:shadow-md' : 'bg-red-300 cursor-not-allowed'}`}
                >
                  Permanently Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
