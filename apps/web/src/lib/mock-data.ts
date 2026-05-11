export const categoryColors: Record<string, string> = {
  Flight: '#3b82f6', // blue
  Hotel: '#8b5cf6', // purple
  Food: '#f59e0b', // amber
  Activity: '#10b981', // emerald
  Transport: '#6366f1', // indigo
  'Free Time': '#94a3b8', // slate
  Nature: '#22c55e', // green
  Culture: '#ef4444', // red
  Adventure: '#f97316', // orange
};

export const MOCK_TRIPS: Record<string, any> = {
  t_001: {
    id: 't_001',
    name: 'Bali & Lombok Escape',
    destinations: ['Bali', 'Lombok'],
    startDate: '2024-10-23',
    endDate: '2024-10-29',
    gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
  }
};

export const MOCK_ACTIVITIES = [
  { id: 'a1', day: 1, type: 'Flight', title: 'Flight to DPS', startTime: '08:00', duration: 360, cost: 450, location: 'JFK Airport', notes: 'Terminal 4, Gate B22. Confirmation: XY12Z.' },
  { id: 'a2', day: 1, type: 'Hotel', title: 'Check-in at W Bali', startTime: '15:00', duration: 60, cost: 300, location: 'Seminyak', notes: 'Ask for ocean view room.' },
  { id: 'a3', day: 1, type: 'Food', title: 'Dinner at Motel Mexicola', startTime: '19:00', duration: 120, cost: 45, location: 'Seminyak', notes: 'Reservation at 7 PM. Try the tacos.' },
  { id: 'a4', day: 1, type: 'Free Time', title: 'Explore Seminyak', startTime: '21:00', duration: 120, cost: 0, location: 'Seminyak', notes: 'Walk around the beach club.' },
  { id: 'a5', day: 2, type: 'Nature', title: 'Ubud Monkey Forest', startTime: '09:00', duration: 180, cost: 15, location: 'Ubud', notes: 'Keep sunglasses inside bag!' },
  { id: 'a6', day: 2, type: 'Food', title: 'Lunch at Locavore', startTime: '13:00', duration: 90, cost: 80, location: 'Ubud', notes: '7-course tasting menu.' },
  { id: 'a7', day: 2, type: 'Culture', title: 'Tirta Empul Temple', startTime: '15:30', duration: 120, cost: 10, location: 'Tampaksiring', notes: 'Bring sarong for water blessing.' },
  { id: 'a8', day: 3, type: 'Adventure', title: 'Mount Batur Sunrise Trek', startTime: '02:00', duration: 300, cost: 55, location: 'Mount Batur', notes: 'Pickup from hotel at 2 AM. Bring jacket.' },
  { id: 'a9', day: 3, type: 'Transport', title: 'Fast Boat to Lombok', startTime: '14:00', duration: 120, cost: 35, location: 'Padang Bai', notes: 'Eka Jaya Fast Boat. Sit on the roof.' },
  { id: 'a10', day: 4, type: 'Adventure', title: 'Gili Trawangan Snorkeling', startTime: '10:00', duration: 240, cost: 25, location: 'Gili T', notes: 'Turtle point and underwater statues.' },
];

export const MOCK_USER = {
  name: 'Alex Chen',
  email: 'alex@example.com',
  bio: 'Adventure seeker. Coffee enthusiast. 14 countries and counting.',
  city: 'San Francisco, CA',
  avatar: 'AC',
  followers: 24,
};

export const MOCK_COLLABORATORS = [
  { id: 'u1', name: 'Alex Chen', initials: 'AC', color: '#6366f1', role: 'Owner', isOnline: true },
  { id: 'u2', name: 'Priya Kumar', initials: 'PK', color: '#f59e0b', role: 'Editor', isOnline: true },
  { id: 'u3', name: 'James Lee', initials: 'JL', color: '#10b981', role: 'Editor', isOnline: false },
  { id: 'u4', name: 'Marco Rossi', initials: 'MR', color: '#ef4444', role: 'Viewer', isOnline: false },
];

export const MOCK_JOURNAL = [
  { id: 'j1', tripId: 't_001', title: 'First light in Canggu', date: 'Oct 23, 2024', location: 'Bali, Indonesia', mood: '🌅', excerpt: 'Landed to the smell of frangipani...', text: 'Landed to the smell of frangipani. The flight was long but stepping out into the warm, humid air immediately made it worth it. We grabbed a quick coffee before heading to our villa in Canggu. The sunset at Echo Beach was spectacular.', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  { id: 'j2', tripId: 't_001', title: 'Monkeys and Temples', date: 'Oct 24, 2024', location: 'Ubud, Bali', mood: '🌿', excerpt: 'The Ubud Monkey Forest was wild...', text: 'The Ubud Monkey Forest was wild. I almost lost my sunglasses to a particularly cheeky macaque. Later, we visited Tirta Empul and participated in the water blessing ritual, which felt incredibly grounding.', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  { id: 'j3', tripId: 't_001', title: 'Sunrise Trek', date: 'Oct 25, 2024', location: 'Mount Batur', mood: '🏔️', excerpt: 'Waking up at 2 AM was rough...', text: 'Waking up at 2 AM was rough, but the hike up Mount Batur was an adventure. Reaching the summit just as the sun began to peek over the horizon, painting the sky in vibrant shades of pink and orange, was a core memory.', gradient: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' },
];

export const MOCK_DESTINATIONS = [
  { id: 'd1', name: 'Kyoto, Japan', img: 'linear-gradient(135deg, #ec4899, #f43f5e)', tags: ['Culture', 'Food'] },
  { id: 'd2', name: 'Santorini, Greece', img: 'linear-gradient(135deg, #3b82f6, #06b6d4)', tags: ['Relaxation', 'Scenery'] },
  { id: 'd3', name: 'Patagonia, Chile', img: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', tags: ['Adventure', 'Nature'] },
  { id: 'd4', name: 'Banff, Canada', img: 'linear-gradient(135deg, #10b981, #3b82f6)', tags: ['Mountains', 'Hiking'] },
  { id: 'd5', name: 'Rome, Italy', img: 'linear-gradient(135deg, #f59e0b, #ef4444)', tags: ['History', 'Food'] },
  { id: 'd6', name: 'Queenstown, NZ', img: 'linear-gradient(135deg, #8b5cf6, #d946ef)', tags: ['Extreme', 'Nature'] },
];

export const MOCK_ADMIN_USERS = [
  { id: 'au1', name: 'Alex Chen', email: 'alex@example.com', plan: 'Pro', lastActive: '2 mins ago', trips: 8 },
  { id: 'au2', name: 'Priya Kumar', email: 'priya@example.com', plan: 'Free', lastActive: '1 hr ago', trips: 2 },
  { id: 'au3', name: 'James Lee', email: 'james@example.com', plan: 'Pro', lastActive: '5 hrs ago', trips: 5 },
  { id: 'au4', name: 'Sarah Smith', email: 'sarah@example.com', plan: 'Business', lastActive: 'Yesterday', trips: 14 },
  { id: 'au5', name: 'Marco Rossi', email: 'marco@example.com', plan: 'Free', lastActive: '2 days ago', trips: 1 },
];
