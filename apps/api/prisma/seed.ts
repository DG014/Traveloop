import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Traveloop database with realistic data...');

  // 1. Clear existing data to avoid duplication/conflicts during seeding
  console.log('🧹 Cleaning existing data...');
  await prisma.communityPost.deleteMany();
  await prisma.tripNote.deleteMany();
  await prisma.packingItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.budgetItem.deleteMany();
  await prisma.sectionActivity.deleteMany();
  await prisma.tripSection.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  console.log('👤 Seeding users...');
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const userHash = await bcrypt.hash('User@1234', 12);

  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin', lastName: 'User',
      email: 'admin@traveloop.com',
      passwordHash: adminHash,
      role: 'admin',
      bio: 'Platform administrator',
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      firstName: 'Alice', lastName: 'Wanderer',
      email: 'demo@traveloop.com',
      passwordHash: userHash,
      role: 'user',
      city: 'London', country: 'UK',
      bio: 'Passionate traveler and food lover. Exploring the world one bite at a time.',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    },
  });
  
  const creatorUser = await prisma.user.create({
    data: {
      firstName: 'Marcus', lastName: 'Explorer',
      email: 'marcus@traveloop.com',
      passwordHash: userHash,
      role: 'user',
      city: 'Berlin', country: 'Germany',
      bio: 'Digital nomad. Sharing the best itineraries for adventure seekers.',
      profilePhoto: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80',
    },
  });

  // 3. Seed Cities with Realistic Data and High-Quality Unsplash Images
  console.log('🏙️ Seeding cities...');
  const cities = await Promise.all([
    prisma.city.create({
      data: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Paris', country: 'France', region: 'Europe',
        costIndex: 'luxury', popularityRank: 1,
        description: 'The City of Light — art, culture, and romance.',
        coverPhoto: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.city.create({
      data: {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Bangkok', country: 'Thailand', region: 'Asia',
        costIndex: 'budget', popularityRank: 2,
        description: 'Street food, temples, and vibrant nightlife.',
        coverPhoto: 'https://images.unsplash.com/photo-1508009603885-50cf7cbf0d1e?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.city.create({
      data: {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'New York', country: 'USA', region: 'North America',
        costIndex: 'luxury', popularityRank: 3,
        description: 'The city that never sleeps.',
        coverPhoto: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.city.create({
      data: {
        id: '00000000-0000-0000-0000-000000000004',
        name: 'Tokyo', country: 'Japan', region: 'Asia',
        costIndex: 'mid-range', popularityRank: 4,
        description: 'Tradition meets ultra-modernity.',
        coverPhoto: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.city.create({
      data: {
        id: '00000000-0000-0000-0000-000000000005',
        name: 'Barcelona', country: 'Spain', region: 'Europe',
        costIndex: 'mid-range', popularityRank: 5,
        description: 'Gaudí architecture, beaches, and tapas.',
        coverPhoto: 'https://images.unsplash.com/photo-1583422409516-2895a77ef244?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.city.create({
      data: {
        id: '00000000-0000-0000-0000-000000000006',
        name: 'Bali', country: 'Indonesia', region: 'Asia',
        costIndex: 'budget', popularityRank: 6,
        description: 'Tropical paradise with beaches, temples, and jungles.',
        coverPhoto: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.city.create({
      data: {
        id: '00000000-0000-0000-0000-000000000007',
        name: 'Rome', country: 'Italy', region: 'Europe',
        costIndex: 'mid-range', popularityRank: 7,
        description: 'The Eternal City, full of ancient history and pasta.',
        coverPhoto: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.city.create({
      data: {
        id: '00000000-0000-0000-0000-000000000008',
        name: 'Dubai', country: 'UAE', region: 'Middle East',
        costIndex: 'luxury', popularityRank: 8,
        description: 'Futuristic skyline, luxury shopping, and desert safaris.',
        coverPhoto: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      },
    })
  ]);

  // 4. Seed Activities with Cover Photos
  console.log('🎢 Seeding activities...');
  const activitiesData = [
    // Paris
    { cityId: cities[0].id, name: 'Eiffel Tower Visit', category: 'sightseeing', avgCost: 25, durationHrs: 3, coverPhoto: 'https://images.unsplash.com/photo-1543305361-90407a82fbcd?auto=format&fit=crop&w=600&q=80' },
    { cityId: cities[0].id, name: 'Louvre Museum', category: 'culture', avgCost: 17, durationHrs: 4, coverPhoto: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80' },
    { cityId: cities[0].id, name: 'Seine River Cruise', category: 'adventure', avgCost: 15, durationHrs: 1.5, coverPhoto: 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?auto=format&fit=crop&w=600&q=80' },
    { cityId: cities[0].id, name: 'French Cooking Class', category: 'food', avgCost: 80, durationHrs: 3, coverPhoto: 'https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&w=600&q=80' },
    // Bangkok
    { cityId: cities[1].id, name: 'Grand Palace Tour', category: 'culture', avgCost: 15, durationHrs: 3, coverPhoto: 'https://images.unsplash.com/photo-1579294528185-5b4c10eb3f12?auto=format&fit=crop&w=600&q=80' },
    { cityId: cities[1].id, name: 'Street Food Night Tour', category: 'food', avgCost: 25, durationHrs: 2.5, coverPhoto: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80' },
    // New York
    { cityId: cities[2].id, name: 'Statue of Liberty', category: 'sightseeing', avgCost: 23, durationHrs: 4, coverPhoto: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=600&q=80' },
    { cityId: cities[2].id, name: 'Central Park Bike Tour', category: 'adventure', avgCost: 45, durationHrs: 2, coverPhoto: 'https://images.unsplash.com/photo-1522083111453-3172828b6d05?auto=format&fit=crop&w=600&q=80' },
    // Tokyo
    { cityId: cities[3].id, name: 'Senso-ji Temple', category: 'culture', avgCost: 5, durationHrs: 2, coverPhoto: 'https://images.unsplash.com/photo-1590559899731-a382839cecdf?auto=format&fit=crop&w=600&q=80' },
    { cityId: cities[3].id, name: 'Shibuya Crossing', category: 'sightseeing', avgCost: 0, durationHrs: 1, coverPhoto: 'https://images.unsplash.com/photo-1542051812-ba32e154622b?auto=format&fit=crop&w=600&q=80' },
    // Barcelona
    { cityId: cities[4].id, name: 'Sagrada Familia', category: 'sightseeing', avgCost: 26, durationHrs: 2, coverPhoto: 'https://images.unsplash.com/photo-1583422409516-2895a77ef244?auto=format&fit=crop&w=600&q=80' },
    { cityId: cities[4].id, name: 'Tapas Tour', category: 'food', avgCost: 45, durationHrs: 3, coverPhoto: 'https://images.unsplash.com/photo-1515443961818-e5a9c8c15eb1?auto=format&fit=crop&w=600&q=80' },
    // Bali
    { cityId: cities[5].id, name: 'Ubud Monkey Forest', category: 'adventure', avgCost: 5, durationHrs: 2, coverPhoto: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80' },
    { cityId: cities[5].id, name: 'Rice Terraces', category: 'sightseeing', avgCost: 3, durationHrs: 3, coverPhoto: 'https://images.unsplash.com/photo-1552504959-54817a14e9f7?auto=format&fit=crop&w=600&q=80' },
    // Rome
    { cityId: cities[6].id, name: 'Colosseum Tour', category: 'culture', avgCost: 20, durationHrs: 3, coverPhoto: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80' },
    { cityId: cities[6].id, name: 'Vatican Museums', category: 'culture', avgCost: 25, durationHrs: 4, coverPhoto: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=600&q=80' },
    // Dubai
    { cityId: cities[7].id, name: 'Burj Khalifa Observation Deck', category: 'sightseeing', avgCost: 40, durationHrs: 2, coverPhoto: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80' },
    { cityId: cities[7].id, name: 'Desert Safari', category: 'adventure', avgCost: 60, durationHrs: 5, coverPhoto: 'https://images.unsplash.com/photo-1543336711-b0e72288d407?auto=format&fit=crop&w=600&q=80' },
  ];

  for (const act of activitiesData) {
    await prisma.activity.create({ data: act as any });
  }

  // 5. Seed Realistic Trips with Cover Photos and status variation
  console.log('✈️ Seeding trips...');
  const trip1 = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      title: 'European Summer Adventure',
      description: 'Two weeks exploring the best of France and Spain with a mix of culture, food, and relaxation.',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-07-14'),
      totalBudget: 3000,
      status: 'planned',
      coverPhoto: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      title: 'Southeast Asia Backpacking',
      description: 'A budget trip through the vibrant streets of Bangkok and the peaceful jungles of Bali.',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-15'),
      totalBudget: 1500,
      status: 'completed',
      coverPhoto: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=80',
    },
  });

  const trip3 = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      title: 'Tokyo & Beyond',
      description: 'An immersive cultural journey through Japan, starting in Tokyo.',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-10'),
      totalBudget: 2500,
      status: 'planned',
      isPublic: true,
      publicSlug: 'tokyo-beyond-demo',
      coverPhoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    },
  });

  const trip4 = await prisma.trip.create({
    data: {
      userId: creatorUser.id,
      title: 'Roman Holiday',
      description: 'A romantic getaway to Rome, featuring the best pasta and ancient ruins.',
      startDate: new Date('2025-09-10'),
      endDate: new Date('2025-09-20'),
      totalBudget: 2000,
      status: 'completed',
      isPublic: true,
      publicSlug: 'roman-holiday-demo',
      coverPhoto: 'https://images.unsplash.com/photo-1515542622106-78b28af7815b?auto=format&fit=crop&w=800&q=80',
    },
  });
  
  const trip5 = await prisma.trip.create({
    data: {
      userId: creatorUser.id,
      title: 'Bali Retreat',
      description: 'A spiritual and relaxing journey through the temples and beaches of Bali.',
      startDate: new Date('2025-11-01'),
      endDate: new Date('2025-11-10'),
      totalBudget: 1800,
      status: 'planned',
      isPublic: true,
      publicSlug: 'bali-retreat-demo',
      coverPhoto: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    },
  });

  // 6. Seed Community Posts
  console.log('💬 Seeding community posts...');
  await prisma.communityPost.createMany({
    data: [
      {
        tripId: trip3.id,
        userId: demoUser.id,
        caption: 'My upcoming Tokyo adventure — planning ahead! Can\'t wait for the cherry blossoms.',
        viewCount: 1204,
        copyCount: 45,
      },
      {
        tripId: trip4.id,
        userId: creatorUser.id,
        caption: 'Just returned from Rome! Check out this itinerary if you love history and food.',
        viewCount: 3450,
        copyCount: 210,
      },
      {
        tripId: trip5.id,
        userId: creatorUser.id,
        caption: 'Planning a retreat to Bali. Any recommendations for Ubud?',
        viewCount: 890,
        copyCount: 12,
      }
    ]
  });

  // 7. Seed Trip Sections & Items to make it look real when viewing a trip
  console.log('📅 Seeding trip details (sections, budget, packing)...');
  
  const section1 = await prisma.tripSection.create({
    data: {
      tripId: trip3.id,
      cityId: cities[3].id, // Tokyo
      title: 'Exploring Shinjuku',
      description: 'First few days getting used to the city',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-03'),
      budget: 500,
      sortOrder: 1,
    }
  });

  await prisma.budgetItem.createMany({
    data: [
      { tripId: trip3.id, sectionId: section1.id, category: 'accommodation', description: 'Shinjuku Hotel', qty: 3, unitCost: 150 },
      { tripId: trip3.id, sectionId: section1.id, category: 'food', description: 'Ramen Meals', qty: 6, unitCost: 15 },
      { tripId: trip3.id, category: 'transport', description: 'JR Pass (1 Week)', qty: 1, unitCost: 300 },
    ]
  });

  await prisma.packingItem.createMany({
    data: [
      { tripId: trip3.id, category: 'clothing', itemName: 'Comfortable walking shoes', isPacked: true },
      { tripId: trip3.id, category: 'electronics', itemName: 'Universal adapter', isPacked: false },
      { tripId: trip3.id, category: 'documents', itemName: 'Passport', isPacked: true },
      { tripId: trip3.id, category: 'documents', itemName: 'JR Pass Voucher', isPacked: false },
    ]
  });

  console.log('\n🎉 Real-world seed complete! Ready to showcase the app.');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
