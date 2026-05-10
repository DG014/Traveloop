import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { useAuth } from '../lib/auth-context';
import { MapPin, Calendar, Clock, DollarSign, Copy, ArrowLeft, Eye, CheckCircle } from 'lucide-react';
import BlurFade from '../components/ui/blur-fade';
import ShimmerButton from '../components/ui/shimmer-button';
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
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero */}
      <BlurFade delay={0.1} inView>
        <div className="relative bg-slate-900 h-64 sm:h-80 lg:h-96 w-full">
          {trip.coverPhoto && <img src={trip.coverPhoto} alt={trip.title} className="w-full h-full object-cover opacity-80" />}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
          <div className="absolute top-6 left-6 z-10">
            <Link to="/community" className="inline-flex items-center text-white/90 hover:text-white text-sm bg-white/10 rounded-full px-4 py-2 backdrop-blur-md border border-white/20 transition-all hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Community
            </Link>
          </div>
          <div className="absolute bottom-8 left-8 right-8 max-w-5xl mx-auto z-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg mb-2">{trip.title}</h1>
            {post && <p className="text-white/80 text-base font-medium flex items-center">
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-2 text-xs border border-white/30">
                {post.user.profilePhoto ? <img src={post.user.profilePhoto} className="rounded-full w-full h-full" alt="" /> : post.user.firstName[0]}
              </span>
              Curated by {post.user.firstName} {post.user.lastName}
            </p>}
          </div>
        </div>
      </BlurFade>

      {/* Info bar */}
      <BlurFade delay={0.2} inView>
        <div className="bg-white border-b border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] px-6 py-5 sticky top-0 z-40 backdrop-blur-xl bg-white/80">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6 text-sm font-semibold text-slate-600">
              <span className="flex items-center bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"><Calendar className="w-4 h-4 mr-2 text-blue-500" />{new Date(trip.startDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} — {new Date(trip.endDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
              {trip.totalBudget && <span className="flex items-center bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200"><DollarSign className="w-4 h-4 mr-1" />Total: ${Number(trip.totalBudget).toLocaleString()}</span>}
              {post && <><span className="flex items-center text-slate-400"><Eye className="w-4 h-4 mr-1.5" />{post.viewCount}</span><span className="flex items-center text-slate-400"><Copy className="w-4 h-4 mr-1.5" />{post.copyCount}</span></>}
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <button 
                onClick={handleCopy} 
                disabled={copying || copied}
                className="relative flex items-center justify-center w-full sm:w-auto overflow-hidden rounded-xl p-[1px]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 opacity-70"></span>
                <div className={`relative flex items-center justify-center w-full px-6 py-2.5 rounded-xl bg-white transition-all ${copied ? 'bg-green-50 text-green-700 border border-green-200' : 'text-blue-600 hover:text-blue-700 font-bold'}`}>
                  {copied ? <><CheckCircle className="w-4 h-4 mr-2" />Copied to Dashboard!</> : copying ? 'Copying...' : <><Copy className="w-4 h-4 mr-2" />Duplicate Trip</>}
                </div>
              </button>
            </div>
          </div>
        </div>
      </BlurFade>

      {trip.description && <div className="max-w-5xl mx-auto px-6 py-6"><p className="text-slate-600">{trip.description}</p></div>}

      {/* Sections */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <BlurFade delay={0.3} inView>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Detailed Itinerary</h2>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{trip.sections?.length || 0} Days</span>
          </div>
        </BlurFade>

        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {(trip.sections || []).map((section: any, idx: number) => (
            <BlurFade key={section.id} delay={0.4 + idx * 0.1} inView>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 bg-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 text-blue-600 font-bold text-sm">
                  {idx + 1}
                </div>
                
                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all overflow-hidden p-1">
                  <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100 rounded-t-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-slate-900">{section.title}</h3>
                      <div className="text-right text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                        {new Date(section.startDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {section.city ? (
                        <p className="text-sm font-medium text-slate-600 flex items-center bg-blue-50/50 text-blue-700 px-2.5 py-1 rounded-lg w-fit border border-blue-100/50">
                          <MapPin className="w-3.5 h-3.5 mr-1.5" />{section.city.name}, {section.city.country}
                        </p>
                      ) : <div/>}
                      {section.budget && <div className="font-bold text-green-600 text-sm bg-green-50 px-2 py-1 rounded-md">${Number(section.budget).toLocaleString()}</div>}
                    </div>
                  </div>

                  <div className="p-2">
                    {section.activities?.length > 0 ? (
                      <ul className="space-y-1">
                        {section.activities.map((act: any) => (
                          <li key={act.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors group/item">
                            <div className="flex items-center space-x-4">
                              {act.scheduledTime ? (
                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md min-w-[60px] text-center">{act.scheduledTime}</span>
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-slate-200 ml-2" />
                              )}
                              <span className="text-sm font-semibold text-slate-800">{act.activity.name}</span>
                              {act.activity.category && <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{act.activity.category}</span>}
                            </div>
                            {(act.actualCost || act.activity.avgCost) && <span className="text-sm font-medium text-slate-500">${Number(act.actualCost || act.activity.avgCost).toFixed(0)}</span>}
                          </li>
                        ))}
                      </ul>
                    ) : <p className="px-6 py-6 text-sm font-medium text-slate-400 text-center italic bg-slate-50 rounded-xl m-2">Time for spontaneous exploration!</p>}
                  </div>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </main>
    </div>
  );
}
