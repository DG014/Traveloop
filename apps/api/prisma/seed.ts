import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Traveloop database...');

  // Seed cities
  const cities = await Promise.all([
    prisma.city.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Paris', country: 'France', region: 'Europe',
        costIndex: 'luxury', popularityRank: 1,
        description: 'The City of Light — art, culture, and romance.',
      },
    }),
    prisma.city.upsert({
      where: { id: '00000000-0000-0000-0000-000000000002' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Bangkok', country: 'Thailand', region: 'Asia',
        costIndex: 'budget', popularityRank: 2,
        description: 'Street food, temples, and vibrant nightlife.',
      },
    }),
    prisma.city.upsert({
      where: { id: '00000000-0000-0000-0000-000000000003' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'New York', country: 'USA', region: 'North America',
        costIndex: 'luxury', popularityRank: 3,
        description: 'The city that never sleeps.',
      },
    }),
    prisma.city.upsert({
      where: { id: '00000000-0000-0000-0000-000000000004' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000004',
        name: 'Tokyo', country: 'Japan', region: 'Asia',
        costIndex: 'mid-range', popularityRank: 4,
        description: 'Tradition meets ultra-modernity.',
      },
    }),
    prisma.city.upsert({
      where: { id: '00000000-0000-0000-0000-000000000005' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000005',
        name: 'Barcelona', country: 'Spain', region: 'Europe',
        costIndex: 'mid-range', popularityRank: 5,
        description: 'Gaudí architecture, beaches, and tapas.',
      },
    }),
  ]);
  console.log(`✅ Seeded ${cities.length} cities`);

  // Seed activities (4 per city = 20 total)
  const activitiesData = [
    // Paris
    { cityId: cities[0].id, name: 'Eiffel Tower Visit', category: 'sightseeing', avgCost: 25, durationHrs: 3 },
    { cityId: cities[0].id, name: 'Louvre Museum', category: 'culture', avgCost: 17, durationHrs: 4 },
    { cityId: cities[0].id, name: 'Seine River Cruise', category: 'adventure', avgCost: 15, durationHrs: 1.5 },
    { cityId: cities[0].id, name: 'French Cooking Class', category: 'food', avgCost: 80, durationHrs: 3 },
    // Bangkok
    { cityId: cities[1].id, name: 'Grand Palace Tour', category: 'culture', avgCost: 15, durationHrs: 3 },
    { cityId: cities[1].id, name: 'Street Food Night Tour', category: 'food', avgCost: 25, durationHrs: 2.5 },
    { cityId: cities[1].id, name: 'Muay Thai Class', category: 'adventure', avgCost: 30, durationHrs: 2 },
    { cityId: cities[1].id, name: 'Chatuchak Market', category: 'sightseeing', avgCost: 10, durationHrs: 3 },
    // New York
    { cityId: cities[2].id, name: 'Statue of Liberty', category: 'sightseeing', avgCost: 23, durationHrs: 4 },
    { cityId: cities[2].id, name: 'Central Park Bike Tour', category: 'adventure', avgCost: 45, durationHrs: 2 },
    { cityId: cities[2].id, name: 'Broadway Show', category: 'culture', avgCost: 120, durationHrs: 3 },
    { cityId: cities[2].id, name: 'NYC Food Tour', category: 'food', avgCost: 60, durationHrs: 3 },
    // Tokyo
    { cityId: cities[3].id, name: 'Senso-ji Temple', category: 'culture', avgCost: 5, durationHrs: 2 },
    { cityId: cities[3].id, name: 'Shibuya Crossing', category: 'sightseeing', avgCost: 0, durationHrs: 1 },
    { cityId: cities[3].id, name: 'Sushi Making Class', category: 'food', avgCost: 70, durationHrs: 2.5 },
    { cityId: cities[3].id, name: 'Mt Fuji Day Trip', category: 'adventure', avgCost: 100, durationHrs: 8 },
    // Barcelona
    { cityId: cities[4].id, name: 'Sagrada Familia', category: 'sightseeing', avgCost: 26, durationHrs: 2 },
    { cityId: cities[4].id, name: 'Tapas Tour', category: 'food', avgCost: 45, durationHrs: 3 },
    { cityId: cities[4].id, name: 'Park Güell', category: 'culture', avgCost: 10, durationHrs: 2 },
    { cityId: cities[4].id, name: 'Barceloneta Beach', category: 'relaxation', avgCost: 0, durationHrs: 4 },
  ];

  for (const act of activitiesData) {
    await prisma.activity.create({ data: act as any });
  }
  console.log(`✅ Seeded ${activitiesData.length} activities`);

  // Seed users
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const userHash = await bcrypt.hash('User@1234', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@traveloop.com' },
    update: {},
    create: {
      firstName: 'Admin', lastName: 'User',
      email: 'admin@traveloop.com',
      passwordHash: adminHash,
      role: 'admin',
      bio: 'Platform administrator',
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@traveloop.com' },
    update: {},
    create: {
      firstName: 'Alice', lastName: 'Wanderer',
      email: 'demo@traveloop.com',
      passwordHash: userHash,
      role: 'user',
      city: 'London', country: 'UK',
      bio: 'Passionate traveler and food lover',
    },
  });
  console.log(`✅ Seeded 2 users (admin@traveloop.com / Admin@1234, demo@traveloop.com / User@1234)`);

  // Seed 3 demo trips
  const trip1 = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      title: 'European Summer Adventure',
      description: 'Two weeks exploring France and Spain',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-07-14'),
      totalBudget: 3000,
      status: 'planned',
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      title: 'Southeast Asia Backpacking',
      description: 'Budget trip through Thailand',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-15'),
      totalBudget: 1500,
      status: 'completed',
    },
  });

  const trip3 = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      title: 'Tokyo & Beyond',
      description: 'Japan cultural immersion',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-10'),
      totalBudget: 2500,
      status: 'planned',
      isPublic: true,
      publicSlug: 'tokyo-beyond-demo',
    },
  });
  console.log(`✅ Seeded 3 demo trips`);

  // Seed community post for public trip
  await prisma.communityPost.create({
    data: {
      tripId: trip3.id,
      userId: demoUser.id,
      caption: 'My upcoming Tokyo adventure — planning ahead!',
    },
  });
  console.log(`✅ Seeded community post for public trip`);

  console.log('\n🎉 Seed complete! Ready to start building.');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
