import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { Globe, Eye, Copy, ArrowRight, MapPin, Calendar } from 'lucide-react';

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
      <header className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Community Trips</h1>
              <p className="text-sm text-muted-foreground">Discover and copy itineraries shared by travelers</p>
            </div>
          </div>
          <Link to="/" className="text-sm font-medium text-primary hover:underline">
            ← Back to Dashboard
          </Link>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <Link
                  to={`/community/${post.trip.publicSlug}`}
                  key={post.id}
                  className="group bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                >
                  {/* Cover */}
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/30 relative">
                    {post.trip.coverPhoto && (
                      <img
                        src={post.trip.coverPhoto}
                        alt={post.trip.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg leading-tight truncate">
                        {post.trip.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Author */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 overflow-hidden">
                        {post.user.profilePhoto ? (
                          <img src={post.user.profilePhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          `${post.user.firstName[0]}${post.user.lastName[0]}`
                        )}
                      </div>
                      <span className="text-sm text-slate-600">{post.user.firstName} {post.user.lastName}</span>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center text-xs text-muted-foreground mb-3">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(post.trip.startDate).toLocaleDateString()} — {new Date(post.trip.endDate).toLocaleDateString()}
                    </div>

                    {post.caption && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">{post.caption}</p>
                    )}

                    {/* Stats */}
                    <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center"><Eye className="w-3 h-3 mr-1" />{post.viewCount}</span>
                        <span className="flex items-center"><Copy className="w-3 h-3 mr-1" />{post.copyCount}</span>
                      </div>
                      <span className="text-xs font-medium text-primary group-hover:underline flex items-center">
                        View <ArrowRight className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                  </div>
                </Link>
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
