import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed with realistic Sri Lankan campus data...');

  // Clean existing records in reverse dependency order
  await prisma.sponsorship.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.event.deleteMany();

  // 1. Create Sponsors
  const sponsor1 = await prisma.sponsor.create({
    data: {
      name: 'Ceylon Cloud Solutions',
      email: 'contact@ceyloncloud.lk',
      phone: '+94 11 234 5678',
      businessCategory: 'Software & IT',
      logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
    },
  });

  const sponsor2 = await prisma.sponsor.create({
    data: {
      name: 'Colombo Tea & Bakery Co.',
      email: 'partnerships@colombotea.lk',
      phone: '+94 11 789 1011',
      businessCategory: 'Food & Beverage',
      logoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80',
    },
  });

  const sponsor3 = await prisma.sponsor.create({
    data: {
      name: 'Apex Engineering LK',
      email: 'sponsors@apexengineering.lk',
      phone: '+94 11 555 7890',
      businessCategory: 'Engineering & Tech',
      logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=80',
    },
  });

  const sponsor4 = await prisma.sponsor.create({
    data: {
      name: 'Lanka Micro Capital',
      email: 'info@lankamicrocapital.lk',
      phone: '+94 11 432 9988',
      businessCategory: 'Banking & Finance',
      logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80',
    },
  });

  const sponsor5 = await prisma.sponsor.create({
    data: {
      name: 'Dr. Senaka Perera (UoM Alumni 2012)',
      email: 'senaka.perera.alumni@gmail.com',
      phone: '+94 77 123 4567',
      businessCategory: 'Alumni',
      logoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log('✅ Created 5 Sponsors');

  // 2. Create Events
  const event1 = await prisma.event.create({
    data: {
      title: 'HackX 2026 - Inter-University Hackathon',
      description: 'The premier national startup and product development hackathon bringing together top engineering undergraduates from across Sri Lanka.',
      category: 'Technology',
      organizerName: 'Department of Industrial Management, University of Kelaniya',
      eventDate: new Date('2026-11-15T09:00:00Z'),
      venue: 'Main Auditorium & Innovation Lab, UoK',
      targetBudget: 350000,
      status: 'UPCOMING',
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: 'Mora Ventures 8.0 - Youth Startup Showcase',
      description: 'Annual seed-funding pitch competition connecting university innovators with early-stage venture mentors and investors.',
      category: 'Academic',
      organizerName: 'Rotaract Club of University of Moratuwa',
      eventDate: new Date('2026-11-28T14:00:00Z'),
      venue: 'Civil Auditorium, University of Moratuwa',
      targetBudget: 250000,
      status: 'UPCOMING',
      imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: 'Perabeats 2026 - Classical Fusion Fiesta',
      description: 'A celebration of traditional and contemporary Sri Lankan music featuring undergraduate artists and cultural performers.',
      category: 'Cultural',
      organizerName: 'Arts Council, University of Peradeniya',
      eventDate: new Date('2026-12-05T18:00:00Z'),
      venue: 'University Gymnasium, Peradeniya',
      targetBudget: 400000,
      status: 'UPCOMING',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    },
  });

  const event4 = await prisma.event.create({
    data: {
      title: 'Colombo CodeSprint 2026',
      description: 'Competitive algorithmic programming and problem-solving contest with participation from 15+ higher education institutes.',
      category: 'Technology',
      organizerName: 'IEEE Student Branch, UCSC',
      eventDate: new Date('2026-11-08T08:30:00Z'),
      venue: 'UCSC Computer Labs, Colombo 07',
      targetBudget: 180000,
      status: 'ONGOING',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    },
  });

  const event5 = await prisma.event.create({
    data: {
      title: 'Japura Inter-Faculty Cricket Tournament',
      description: 'Annual tape-ball and leather ball cricket tournament promoting sportsmanship and fitness among 8 university faculties.',
      category: 'Sports',
      organizerName: 'Physical Education Department, USJ',
      eventDate: new Date('2026-11-20T08:00:00Z'),
      venue: 'University Playground, Gangodawila, Nugegoda',
      targetBudget: 120000,
      status: 'UPCOMING',
      imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80',
    },
  });

  const event6 = await prisma.event.create({
    data: {
      title: 'Green University Coastal Cleanup & Tree Drive',
      description: 'Community environmental initiative to plant 500 coastal trees and clean up Matara shoreline with local school students.',
      category: 'Community',
      organizerName: 'Nature Lovers Association, University of Ruhuna',
      eventDate: new Date('2026-10-10T07:30:00Z'),
      venue: 'Wellamadama Campus & Polhena Beach',
      targetBudget: 85000,
      status: 'COMPLETED',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    },
  });

  console.log('✅ Created 6 Events');

  // 3. Create Sponsorship Pledges (with ACCEPTED, PENDING, and REJECTED statuses)
  // HackX 2026 Pledges
  await prisma.sponsorship.create({
    data: {
      eventId: event1.id,
      sponsorId: sponsor1.id,
      amount: 100000,
      message: 'Proud to power the next generation of cloud innovators as Platinum Track Sponsor.',
      status: 'ACCEPTED',
    },
  });

  await prisma.sponsorship.create({
    data: {
      eventId: event1.id,
      sponsorId: sponsor2.id,
      amount: 50000,
      message: 'Happy to support student refreshments and workshop snacks.',
      status: 'ACCEPTED',
    },
  });

  await prisma.sponsorship.create({
    data: {
      eventId: event1.id,
      sponsorId: sponsor4.id,
      amount: 60000,
      message: 'Pending board approval for Fintech special prize sponsorship.',
      status: 'PENDING',
    },
  });

  // Mora Ventures 8.0 Pledges
  await prisma.sponsorship.create({
    data: {
      eventId: event2.id,
      sponsorId: sponsor3.id,
      amount: 75000,
      message: 'Hardware prototype award contribution.',
      status: 'ACCEPTED',
    },
  });

  await prisma.sponsorship.create({
    data: {
      eventId: event2.id,
      sponsorId: sponsor5.id,
      amount: 50000,
      message: 'Giving back to my alma mater. Keep inspiring undergraduates!',
      status: 'ACCEPTED',
    },
  });

  // Perabeats 2026 Pledges
  await prisma.sponsorship.create({
    data: {
      eventId: event3.id,
      sponsorId: sponsor2.id,
      amount: 60000,
      message: 'Beverage station sponsorship for musical festival.',
      status: 'ACCEPTED',
    },
  });

  await prisma.sponsorship.create({
    data: {
      eventId: event3.id,
      sponsorId: sponsor4.id,
      amount: 40000,
      message: 'Declined due to budget allocation limits for Q4 cultural events.',
      status: 'REJECTED',
    },
  });

  // Colombo CodeSprint 2026 Pledges
  await prisma.sponsorship.create({
    data: {
      eventId: event4.id,
      sponsorId: sponsor1.id,
      amount: 70000,
      message: 'Prize money contribution for top competitive programmers.',
      status: 'ACCEPTED',
    },
  });

  // Green University Cleanup Pledges (Fully funded event)
  await prisma.sponsorship.create({
    data: {
      eventId: event6.id,
      sponsorId: sponsor3.id,
      amount: 85000,
      message: 'Full CSR grant for saplings and safety equipment.',
      status: 'ACCEPTED',
    },
  });

  console.log('✅ Created 9 Sponsorship Pledges');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
