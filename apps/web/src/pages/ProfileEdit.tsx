import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { useAuth } from '../lib/auth-context';
import { User, Camera, ArrowLeft, Save, CheckCircle } from 'lucide-react';

export default function ProfileEdit() {
  const { user, refreshUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient('/users/me')
      .then(res => {
        const u = res.data;
        setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email });
        setPhotoUrl(u.profilePhoto || null);
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await apiClient('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName }),
      });
      setSaved(true);
      if (refreshUser) refreshUser();
      setTimeout(() => setSaved(false), 2500);
    } catch { setError('Failed to save changes.'); }
    finally { setSaving(false); }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    try {
      const res = await apiClient('/users/me/photo', { method: 'POST', body: fd });
      setPhotoUrl(res.data.profilePhoto);
      if (refreshUser) refreshUser();
    } catch { setError('Failed to upload photo.'); }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading profile...</div></div>;

  return (
    <div className="bg-slate-50 pb-20 md:pb-0 h-full flex flex-col">
      <main className="max-w-3xl mx-auto w-full px-6 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
            <User className="w-8 h-8 mr-3 text-primary" /> Profile Settings
          </h1>
          <p className="text-slate-500 mt-2">Manage your personal information and profile photo.</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}

        {/* Photo section */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-8 mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Profile Photo</h2>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-slate-400">
                    {form.firstName?.[0]}{form.lastName?.[0]}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-sm text-slate-600">Upload a new profile photo</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 5MB.</p>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Personal Information</h2>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                <input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                <input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" value={form.email} disabled
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-slate-50 text-muted-foreground cursor-not-allowed" />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-end space-x-3">
            <Link to="/" className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Cancel</Link>
            <button onClick={handleSave} disabled={saving || saved}
              className={`inline-flex items-center px-5 py-2 rounded-lg text-sm font-medium transition-all ${saved ? 'bg-green-100 text-green-700' : 'bg-primary text-white hover:bg-primary/90 shadow-sm'}`}>
              {saved ? <><CheckCircle className="w-4 h-4 mr-2" />Saved!</> : saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
