import { Link } from 'react-router-dom';
import { 
  Plane, Users, Wallet, CheckSquare, BookOpen, Sparkles, 
  ArrowRight, Play, Star, Check
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { Navigate } from 'react-router-dom';

export default function LandingPage() {
  const { user, loading } = useAuth();

  // If user is authenticated, redirect to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <Plane className="w-5 h-5 text-white transform -rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight">Traveloop</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
            <a href="#destinations" className="hover:text-white transition">Destinations</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">Log in</Link>
            <Link to="/register" className="px-5 py-2.5 rounded-full bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex items-center justify-center min-h-[90vh]">
        {/* Animated Gradient Mesh Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
          <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-300 mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Traveloop 2.0 is here — Experience AI planning
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Design the perfect trip, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400">
              in minutes.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-3xl mx-auto font-light">
            The collaborative, AI-powered workspace for your next adventure. Combine the warmth of community with the intelligence of automated planning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 transition shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center justify-center group">
              Start Planning Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 text-white font-semibold text-lg hover:bg-white/10 transition border border-white/10 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-5 h-5 mr-2" /> Watch Demo
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-20 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-3xl font-bold text-white mb-1">50K+</p>
              <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">120K</p>
              <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Trips Planned</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">195</p>
              <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Countries</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">4.9/5</p>
              <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">App Store</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-24 bg-slate-900 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need, in one place.</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Leave the spreadsheets behind. Traveloop brings your itinerary, budget, and friends together.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 bg-slate-800/50 rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-500"></div>
              <Sparkles className="w-10 h-10 text-indigo-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3">AI Itineraries</h3>
              <p className="text-slate-400 max-w-md">Generate personalized day-by-day plans based on your interests, pace, and travel style with a single click.</p>
            </div>
            <div className="bg-slate-800/50 rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
              <Users className="w-10 h-10 text-amber-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3">Collaborative</h3>
              <p className="text-slate-400">Invite friends, vote on activities, and edit the itinerary in real-time together.</p>
            </div>
            <div className="bg-slate-800/50 rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
              <Wallet className="w-10 h-10 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3">Budget Tracker</h3>
              <p className="text-slate-400">Keep expenses in check. Split bills, track spending, and predict costs instantly.</p>
            </div>
            <div className="bg-slate-800/50 rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
              <CheckSquare className="w-10 h-10 text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3">Smart Packing</h3>
              <p className="text-slate-400">AI-generated packing lists tailored to your destination's weather and your activities.</p>
            </div>
            <div className="bg-slate-800/50 rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
              <BookOpen className="w-10 h-10 text-pink-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3">Travel Journal</h3>
              <p className="text-slate-400">Document memories, photos, and stories linked directly to your itinerary timeline.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-slate-800/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">From dream to departure.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Set Preferences", desc: "Tell us where you want to go, your budget, and what kind of vibe you're looking for." },
              { step: "02", title: "Let AI Draft", desc: "Our AI generates a comprehensive itinerary, complete with flights, hotels, and activities." },
              { step: "03", title: "Refine & Go", desc: "Invite friends, tweak the plan, and hit the road with our mobile-friendly companion app." }
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className="text-7xl font-black text-white/5 absolute -top-10 -left-4 select-none">{s.step}</div>
                <h3 className="text-xl font-bold mb-3 relative z-10">{s.title}</h3>
                <p className="text-slate-400 relative z-10">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">Loved by travelers.</h2>
          <div className="flex space-x-6 overflow-x-auto pb-8 snap-x hide-scrollbar">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[300px] md:min-w-[400px] bg-slate-800/40 rounded-2xl p-8 border border-white/5 snap-center">
                <div className="flex space-x-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-lg text-slate-300 mb-6 font-light">"Traveloop completely changed how my friends and I plan our summer trips. No more messy spreadsheets and endless group chats."</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-full overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Alex Traveler</p>
                    <p className="text-sm text-slate-500">Planned a trip to Tokyo</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-800/30 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, transparent pricing.</h2>
            <p className="text-xl text-slate-400">Start for free, upgrade when you need superpowers.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-slate-900 rounded-3xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-2">Explorer</h3>
              <p className="text-slate-400 mb-6">Perfect for solo travelers.</p>
              <p className="text-4xl font-bold mb-8">$0<span className="text-lg text-slate-500 font-normal">/mo</span></p>
              <ul className="space-y-4 mb-8">
                {['Up to 3 trips', 'Basic AI suggestions', 'Packing lists', 'Mobile access'].map((feat, i) => (
                  <li key={i} className="flex items-center text-slate-300"><Check className="w-5 h-5 text-indigo-400 mr-3" /> {feat}</li>
                ))}
              </ul>
              <Link to="/register" className="block w-full py-3 text-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold transition">Get Started</Link>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-b from-indigo-600/20 to-slate-900 rounded-3xl p-8 border border-indigo-500/30 relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Recommended</div>
              <h3 className="text-2xl font-bold mb-2">Voyager</h3>
              <p className="text-slate-400 mb-6">For the serious planner.</p>
              <p className="text-4xl font-bold mb-8">$9<span className="text-lg text-slate-500 font-normal">/mo</span></p>
              <ul className="space-y-4 mb-8">
                {['Unlimited trips', 'Advanced AI routing', 'Collaborative editing', 'Budget tracking & split', 'Export to PDF/Calendar'].map((feat, i) => (
                  <li key={i} className="flex items-center text-slate-300"><Check className="w-5 h-5 text-indigo-400 mr-3" /> {feat}</li>
                ))}
              </ul>
              <Link to="/register" className="block w-full py-3 text-center rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold transition shadow-lg shadow-indigo-900/50">Start Free Trial</Link>
            </div>

            {/* Lifetime */}
            <div className="bg-slate-900 rounded-3xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-2">Globetrotter</h3>
              <p className="text-slate-400 mb-6">One time payment.</p>
              <p className="text-4xl font-bold mb-8">$199<span className="text-lg text-slate-500 font-normal">/forever</span></p>
              <ul className="space-y-4 mb-8">
                {['All Voyager features', 'Lifetime access', 'Early access to beta', 'Premium support'].map((feat, i) => (
                  <li key={i} className="flex items-center text-slate-300"><Check className="w-5 h-5 text-indigo-400 mr-3" /> {feat}</li>
                ))}
              </ul>
              <Link to="/register" className="block w-full py-3 text-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold transition">Buy Lifetime</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 pt-20 pb-10 border-t border-white/5 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Plane className="w-5 h-5 text-white transform -rotate-45" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Traveloop</span>
            </div>
            <p className="mb-6 max-w-sm">Making travel planning a collaborative, stress-free, and delightful experience. Built for explorers.</p>
            <div className="flex space-x-2">
              <input type="email" placeholder="Subscribe to newsletter" className="bg-slate-900 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500" />
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Subscribe</button>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-indigo-400 transition">Features</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition">Showcase</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-indigo-400 transition">About</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition">Blog</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition">Careers</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-sm">
          <p>© 2026 Traveloop. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
