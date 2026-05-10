import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { useAuth } from '../lib/auth-context';
import { Globe, Eye, Copy, ArrowRight, Calendar } from 'lucide-react';
import { BlurFade } from '../components/ui/blur-fade';

interface CommunityPost {
  id: string;
  caption: string;
  viewCount: number;
  copyCount: number;
  createdAt: string;
  trip: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    publicSlug: string;
    coverPhoto: string | null;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto: string | null;
  };
}

export default function CommunityFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await apiClient(`/community/posts?page=${page}&limit=${limit}`);
        setPosts(res.data || []);
        setTotal(res.meta?.total || 0);
      } catch {
        // Graceful fallback
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-border/50 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Community Trips</h1>
              <p className="text-sm text-muted-foreground font-medium">Discover and copy itineraries shared by travelers</p>
            </div>
          </div>
          {user ? (
            <Link to="/" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-full flex items-center">
              ← Dashboard
            </Link>
          ) : (
            <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-full flex items-center">
              Log in
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-white rounded-xl animate-pulse border border-border" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-slate-700">No community trips yet</h2>
            <p className="text-sm text-muted-foreground mt-2">Be the first to publish a trip!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <BlurFade key={post.id} delay={0.1 + index * 0.05} inView>
                  <Link
                    to={`/community/${post.trip.publicSlug}`}
                    className="group bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col h-full"
                  >
                    {/* Cover */}
                    <div className="h-52 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 relative overflow-hidden">
                      {post.trip.coverPhoto && (
                        <img
                          src={post.trip.coverPhoto}
                          alt={post.trip.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-5 left-5 right-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white font-extrabold text-2xl tracking-tight leading-tight drop-shadow-md">
                          {post.trip.title}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Author */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 overflow-hidden shadow-sm">
                          {post.user.profilePhoto ? (
                            <img src={post.user.profilePhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            `${post.user.firstName[0]}${post.user.lastName[0]}`
                          )}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{post.user.firstName} {post.user.lastName}</span>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center text-xs text-slate-600 font-medium mb-4 bg-slate-50 border border-slate-100 w-fit px-2.5 py-1.5 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-blue-500" />
                        {new Date(post.trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — {new Date(post.trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>

                      {post.caption && (
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed font-medium">{post.caption}</p>
                      )}

                      {/* Stats */}
                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-5 text-sm font-semibold text-slate-400">
                          <span className="flex items-center hover:text-blue-500 transition-colors"><Eye className="w-4 h-4 mr-1.5" />{post.viewCount}</span>
                          <span className="flex items-center hover:text-blue-500 transition-colors"><Copy className="w-4 h-4 mr-1.5" />{post.copyCount}</span>
                        </div>
                        <span className="text-xs font-bold text-blue-600 flex items-center uppercase tracking-widest opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          View <ArrowRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </BlurFade>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-border rounded-md disabled:opacity-40 hover:bg-slate-100"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-border rounded-md disabled:opacity-40 hover:bg-slate-100"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
