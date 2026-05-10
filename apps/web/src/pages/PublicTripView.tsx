import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { useAuth } from '../lib/auth-context';
import { MapPin, Calendar, Clock, DollarSign, Copy, ArrowLeft, Eye, CheckCircle } from 'lucide-react';

export default function PublicTripView() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    apiClient(`/community/${slug}`)
      .then(res => { setTrip(res.data.trip); setPost(res.data.post); })
      .catch(() => setError('Trip not found or no longer public.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleCopy = async () => {
    if (!user) return navigate('/login');
    setCopying(true);
    try {
      await apiClient(`/trips/copy/${slug}`, { method: 'POST' });
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch { setError('Failed to copy trip.'); }
    finally { setCopying(false); }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading trip...</div></div>;
  if (error || !trip) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center"><p className="text-red-500 mb-4">{error}</p><Link to="/community" className="text-primary hover:underline">← Back to Community</Link></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative bg-primary h-48 sm:h-64">
        {trip.coverPhoto && <img src={trip.coverPhoto} alt={trip.title} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute top-4 left-4">
          <Link to="/community" className="inline-flex items-center text-white/90 hover:text-white text-sm bg-black/30 rounded-full px-3 py-1.5 backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Community
          </Link>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{trip.title}</h1>
          {post && <p className="text-white/80 text-sm mt-1">by {post.user.firstName} {post.user.lastName}</p>}
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" />{new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}</span>
            {trip.totalBudget && <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1" />Budget: ${Number(trip.totalBudget).toLocaleString()}</span>}
            {post && <><span className="flex items-center"><Eye className="w-4 h-4 mr-1" />{post.viewCount}</span><span className="flex items-center"><Copy className="w-4 h-4 mr-1" />{post.copyCount}</span></>}
          </div>
          <button onClick={handleCopy} disabled={copying || copied}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${copied ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-primary text-white hover:bg-primary/90 shadow-sm'}`}>
            {copied ? <><CheckCircle className="w-4 h-4 mr-2" />Copied!</> : copying ? 'Copying...' : <><Copy className="w-4 h-4 mr-2" />Copy This Trip</>}
          </button>
        </div>
      </div>

      {trip.description && <div className="max-w-5xl mx-auto px-6 py-6"><p className="text-slate-600">{trip.description}</p></div>}

      {/* Sections */}
      <main className="max-w-5xl mx-auto px-6 pb-12">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Itinerary ({trip.sections?.length || 0} sections)</h2>
        <div className="space-y-6">
          {(trip.sections || []).map((section: any, idx: number) => (
            <div key={section.id} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">{idx + 1}</span>
                    <h3 className="font-bold text-slate-900">{section.title}</h3>
                  </div>
                  {section.city && <p className="text-sm text-muted-foreground mt-1 flex items-center"><MapPin className="w-3 h-3 mr-1" />{section.city.name}, {section.city.country}</p>}
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>{new Date(section.startDate).toLocaleDateString()} — {new Date(section.endDate).toLocaleDateString()}</div>
                  {section.budget && <div className="font-medium text-primary mt-1">${Number(section.budget).toLocaleString()}</div>}
                </div>
              </div>
              {section.activities?.length > 0 ? (
                <ul className="divide-y divide-border">
                  {section.activities.map((act: any) => (
                    <li key={act.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center space-x-3">
                        {act.scheduledTime && <span className="text-xs font-mono text-muted-foreground flex items-center"><Clock className="w-3 h-3 mr-1" />{act.scheduledTime}</span>}
                        <span className="text-sm font-medium text-slate-900">{act.activity.name}</span>
                        {act.activity.category && <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{act.activity.category}</span>}
                      </div>
                      {(act.actualCost || act.activity.avgCost) && <span className="text-sm text-muted-foreground">${Number(act.actualCost || act.activity.avgCost).toFixed(0)}</span>}
                    </li>
                  ))}
                </ul>
              ) : <p className="px-6 py-4 text-sm text-muted-foreground italic">No activities planned.</p>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
