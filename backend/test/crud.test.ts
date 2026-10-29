import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import prisma from '../src/database/db';
import { calculateEventFunding } from '../src/controllers/event.controller';
import { createEventSchema } from '../src/validators/event.validator';
import { createSponsorshipSchema } from '../src/validators/sponsorship.validator';

describe('CampusBridge Core Functionality Test Suite', () => {
  let createdEventId: string;
  let createdSponsorId: string;
  let createdSponsorshipId: string;

  // 1. BUSINESS LOGIC & FUNDING CALCULATION
  describe('1. Micro-Sponsorship Funding Calculations', () => {
    it('should correctly calculate accepted funding and ignore pending/rejected pledges', () => {
      const targetBudget = 100000;
      const pledges = [
        { amount: 25000, status: 'ACCEPTED' },
        { amount: 25000, status: 'ACCEPTED' },
        { amount: 30000, status: 'PENDING' },
        { amount: 20000, status: 'REJECTED' },
      ];

      const metrics = calculateEventFunding(targetBudget, pledges);

      assert.strictEqual(metrics.fundedAmount, 50000, 'Funded amount must only sum ACCEPTED pledges');
      assert.strictEqual(metrics.pledgedAmount, 100000, 'Pledged amount must sum all pledges');
      assert.strictEqual(metrics.pendingAmount, 30000, 'Pending amount must match pending pledges');
      assert.strictEqual(metrics.fundingPercentage, 50, 'Percentage must be 50%');
      assert.strictEqual(metrics.sponsorsCount, 2, 'Sponsors count must only include ACCEPTED pledges');
      assert.strictEqual(metrics.totalPledgesCount, 4, 'Total pledges must be 4');
    });

    it('should cap funding percentage at 100% when overfunded', () => {
      const targetBudget = 50000;
      const pledges = [{ amount: 75000, status: 'ACCEPTED' }];

      const metrics = calculateEventFunding(targetBudget, pledges);

      assert.strictEqual(metrics.fundedAmount, 75000);
      assert.strictEqual(metrics.fundingPercentage, 100, 'Percentage must be capped at 100%');
    });
  });

  // 2. INPUT VALIDATION (ZOD)
  describe('2. Input Validation & Error Handling (Zod)', () => {
    it('should reject event creation with empty title or negative target budget', async () => {
      const invalidPayload = {
        body: {
          title: 'Hi', // too short (<3)
          description: 'Short', // too short (<10)
          category: 'Technology',
          organizerName: 'UoM',
          eventDate: 'invalid-date-string',
          venue: 'Auditorium',
          targetBudget: -5000, // negative budget
        },
      };

      const result = await createEventSchema.safeParseAsync(invalidPayload);
      assert.strictEqual(result.success, false, 'Validation must fail for invalid payload');
      if (!result.success) {
        const errorFields = result.error.errors.map((e) => e.path.join('.'));
        assert.ok(errorFields.some((f) => f.includes('title')), 'Should flag title error');
        assert.ok(errorFields.some((f) => f.includes('targetBudget')), 'Should flag target budget error');
      }
    });

    it('should reject sponsorship creation with zero or negative pledge amount', async () => {
      const invalidPledge = {
        body: {
          eventId: 'e499d32b-31e8-4663-87a4-9ecfa78b7b4a',
          sponsorId: 'd199d32b-31e8-4663-87a4-9ecfa78b7b4b',
          amount: 0, // invalid zero
        },
      };

      const result = await createSponsorshipSchema.safeParseAsync(invalidPledge);
      assert.strictEqual(result.success, false, 'Pledge validation must fail for 0 amount');
    });
  });

  // 3. DATABASE CRUD OPERATIONS (PERSISTENCE)
  describe('3. Database CRUD Operations & Persistence (SQLite + Prisma)', () => {
    it('CREATE: should create a new campus event in SQLite database', async () => {
      const newEvent = await prisma.event.create({
        data: {
          title: 'Test National AI Symposium 2026',
          description: 'An academic forum exploring artificial intelligence for undergraduate researchers.',
          category: 'Academic',
          organizerName: 'AI Research Society, UoM',
          eventDate: new Date('2026-11-30T10:00:00Z'),
          venue: 'Auditorium 1, University of Moratuwa',
          targetBudget: 150000,
          status: 'UPCOMING',
        },
      });

      assert.ok(newEvent.id, 'Event must have an auto-generated UUID');
      assert.strictEqual(newEvent.title, 'Test National AI Symposium 2026');
      assert.strictEqual(newEvent.targetBudget, 150000);
      createdEventId = newEvent.id;
    });

    it('READ: should fetch the created event by ID from the database', async () => {
      const fetchedEvent = await prisma.event.findUnique({
        where: { id: createdEventId },
      });

      assert.ok(fetchedEvent, 'Event must be found in database');
      assert.strictEqual(fetchedEvent?.id, createdEventId);
      assert.strictEqual(fetchedEvent?.category, 'Academic');
    });

    it('UPDATE: should modify event details and persist changes', async () => {
      const updatedEvent = await prisma.event.update({
        where: { id: createdEventId },
        data: {
          targetBudget: 180000,
          venue: 'Main Gymnasium, University of Moratuwa',
        },
      });

      assert.strictEqual(updatedEvent.targetBudget, 180000, 'Updated budget must persist');
      assert.strictEqual(updatedEvent.venue, 'Main Gymnasium, University of Moratuwa');
    });

    it('RELATIONSHIP & PLEDGE: should link a sponsor pledge to the event', async () => {
      // Create temporary sponsor
      const sponsor = await prisma.sponsor.create({
        data: {
          name: 'Apex Test Sponsor LK',
          email: 'test.sponsor@apextest.lk',
          phone: '+94 11 999 8888',
          businessCategory: 'Software & IT',
        },
      });
      createdSponsorId = sponsor.id;

      // Create sponsorship pledge
      const pledge = await prisma.sponsorship.create({
        data: {
          eventId: createdEventId,
          sponsorId: createdSponsorId,
          amount: 50000,
          message: 'Official prize pool pledge.',
          status: 'ACCEPTED',
        },
      });
      createdSponsorshipId = pledge.id;

      // Verify link in event
      const eventWithPledges = await prisma.event.findUnique({
        where: { id: createdEventId },
        include: { sponsorships: true },
      });

      assert.strictEqual(eventWithPledges?.sponsorships.length, 1);
      assert.strictEqual(eventWithPledges?.sponsorships[0].amount, 50000);
      assert.strictEqual(eventWithPledges?.sponsorships[0].status, 'ACCEPTED');
    });

    it('DELETE & CASCADE: should safely delete the event and cascade remove linked pledges', async () => {
      await prisma.event.delete({
        where: { id: createdEventId },
      });

      // Verify event is deleted
      const deletedEvent = await prisma.event.findUnique({
        where: { id: createdEventId },
      });
      assert.strictEqual(deletedEvent, null, 'Deleted event must no longer exist');

      // Verify cascade deleted the linked sponsorship pledge
      const orphanPledge = await prisma.sponsorship.findUnique({
        where: { id: createdSponsorshipId },
      });
      assert.strictEqual(orphanPledge, null, 'Linked pledge must cascade delete according to database rules');

      // Cleanup test sponsor
      await prisma.sponsor.delete({ where: { id: createdSponsorId } });
    });
  });

  after(async () => {
    await prisma.$disconnect();
  });
});
