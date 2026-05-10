import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth-context';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import TripListing from './pages/TripListing';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import InvoiceView from './pages/InvoiceView';
import AdminPanel from './pages/AdminPanel';
import ChecklistView from './pages/ChecklistView';
import NotesView from './pages/NotesView';
import CommunityFeed from './pages/CommunityFeed';
import PublicTripView from './pages/PublicTripView';
import ProfileEdit from './pages/ProfileEdit';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Public community routes (no auth required) */}
        <Route path="/community" element={<CommunityFeed />} />
        <Route path="/community/:slug" element={<PublicTripView />} />
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trips" element={<TripListing />} />
          <Route path="/trips/new" element={<CreateTrip />} />
          <Route path="/trips/:id" element={<ItineraryView />} />
          <Route path="/trips/:id/builder" element={<ItineraryBuilder />} />
          <Route path="/trips/:id/invoice" element={<InvoiceView />} />
          <Route path="/trips/:id/checklist" element={<ChecklistView />} />
          <Route path="/trips/:id/notes" element={<NotesView />} />
          <Route path="/profile" element={<ProfileEdit />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;

