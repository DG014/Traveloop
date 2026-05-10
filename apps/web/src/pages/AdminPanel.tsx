import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';
import { Users, MapPin, Activity, TrendingUp, ShieldAlert } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type TabType = 'users' | 'cities' | 'activities' | 'analytics';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab: TabType) => {
    try {
      setLoading(true);
      if (tab === 'users') {
        const res = await apiClient('/admin/users');
        setUsers(res.data || []);
      } else if (tab === 'cities') {
        const res = await apiClient('/admin/popular-cities');
        setCities(res.data || []);
      } else if (tab === 'activities') {
        const res = await apiClient('/admin/popular-activities');
        setActivities(res.data || []);
      } else if (tab === 'analytics') {
        const res = await apiClient('/admin/analytics');
        setAnalytics(res.data);
      }
    } catch (e: any) {
      alert('Failed to load data: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (id: string, newRole: string) => {
    try {
      await apiClient(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    } catch (e: any) {
      alert('Failed to update role');
    }
  };

  const toggleUserActive = async (id: string, isActive: boolean) => {
    try {
      await apiClient(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
      setUsers(users.map(u => u.id === id ? { ...u, isActive } : u));
    } catch (e: any) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <ShieldAlert className="w-5 h-5 mr-2 text-primary" /> Admin Panel
          </h2>
        </div>
        <nav className="space-y-1 px-3">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-primary text-primary-foreground' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <TrendingUp className="w-4 h-4 mr-3" /> Dashboard Analytics
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-primary text-primary-foreground' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Users className="w-4 h-4 mr-3" /> Manage Users
          </button>
          <button 
            onClick={() => setActiveTab('cities')}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'cities' ? 'bg-primary text-primary-foreground' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <MapPin className="w-4 h-4 mr-3" /> Popular Cities
          </button>
          <button 
            onClick={() => setActiveTab('activities')}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'activities' ? 'bg-primary text-primary-foreground' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Activity className="w-4 h-4 mr-3" /> Popular Activities
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500">Loading data...</div>
        ) : (
          <>
            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-900">Platform Analytics</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Total Users</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{analytics?.summary?.totalUsers || 0}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Total Trips</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{analytics?.summary?.totalTrips || 0}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Avg Trips / User</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{analytics?.summary?.avgTripsPerUser || 0}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Top Destination</p>
                    <p className="text-xl font-bold text-slate-900 mt-2 truncate">{analytics?.summary?.mostPopularCity || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Line Chart */}
                  <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6">New Users Over Time</h3>
                    <div className="h-64">
                      {analytics?.newUsersLineData && (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analytics.newUsersLineData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#0f172a" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6">Trips Created Per Week</h3>
                    <div className="h-64">
                      {analytics?.tripsCreatedBarData && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analytics.tripsCreatedBarData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="week" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Manage Users</h1>
                <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Join Date</th>
                        <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Trips</th>
                        <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{u.firstName} {u.lastName}</div>
                            <div className="text-sm text-slate-500">{u.email}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {u._count?.trips || 0}
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              value={u.role} 
                              onChange={(e) => updateUserRole(u.id, e.target.value)}
                              className="text-sm border border-input rounded-md px-2 py-1 bg-transparent focus:ring-primary focus:border-primary"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => toggleUserActive(u.id, !u.isActive)}
                              className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${u.isActive !== false ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                            >
                              {u.isActive !== false ? 'Active' : 'Deactivated'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Cities Tab */}
            {activeTab === 'cities' && (
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Popular Cities</h1>
                <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden p-6">
                  <div className="space-y-4">
                    {cities.map((city, idx) => (
                      <div key={city.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:border-slate-300">
                        <div className="flex items-center">
                          <span className="w-8 text-slate-400 font-mono font-bold text-lg">{idx + 1}</span>
                          <div>
                            <h3 className="font-bold text-slate-900">{city.name}</h3>
                            <p className="text-sm text-slate-500">{city.country}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-slate-900">{city._count?.sections || city.count || 0}</span>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">Visits</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Activities Tab */}
            {activeTab === 'activities' && (
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Popular Activities</h1>
                <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden p-6">
                  <div className="space-y-4">
                    {activities.map((act, idx) => (
                      <div key={act.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:border-slate-300">
                        <div className="flex items-center">
                          <span className="w-8 text-slate-400 font-mono font-bold text-lg">{idx + 1}</span>
                          <div>
                            <h3 className="font-bold text-slate-900">{act.name}</h3>
                            <p className="text-sm text-slate-500">{act.city?.name} • {act.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-slate-900">{act._count?.sectionActivities || act.count || 0}</span>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">Bookings</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
