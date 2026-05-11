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
