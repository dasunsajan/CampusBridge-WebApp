import { Request, Response, NextFunction } from 'express';
import prisma from '../database/db';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalEvents,
      upcomingEvents,
      totalSponsors,
      allSponsorships,
      recentPledges,
      eventsWithFunding,
    ] = await Promise.all([
      // Total events
      prisma.event.count(),
      // Upcoming events
      prisma.event.count({ where: { status: 'UPCOMING' } }),
      // Total sponsors
      prisma.sponsor.count(),
      // All sponsorships for aggregate calculations
      prisma.sponsorship.findMany({
        select: {
          amount: true,
          status: true,
        },
      }),
      // Recent pledges
      prisma.sponsorship.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          event: { select: { id: true, title: true } },
          sponsor: { select: { id: true, name: true, logoUrl: true } },
        },
      }),
      // Events with funding for top progress preview
      prisma.event.findMany({
        take: 4,
        where: { status: { in: ['UPCOMING', 'ONGOING'] } },
        orderBy: { eventDate: 'asc' },
        include: {
          sponsorships: {
            select: { amount: true, status: true },
          },
        },
      }),
    ]);

    // Financial aggregates
    const totalPledged = allSponsorships.reduce((sum, s) => sum + s.amount, 0);
    const totalAccepted = allSponsorships
      .filter((s) => s.status === 'ACCEPTED')
      .reduce((sum, s) => sum + s.amount, 0);
    const totalPending = allSponsorships
      .filter((s) => s.status === 'PENDING')
      .reduce((sum, s) => sum + s.amount, 0);

    const pendingPledgesCount = allSponsorships.filter((s) => s.status === 'PENDING').length;
    const acceptedPledgesCount = allSponsorships.filter((s) => s.status === 'ACCEPTED').length;
    const rejectedPledgesCount = allSponsorships.filter((s) => s.status === 'REJECTED').length;

    // Transform featured events
    const featuredEvents = eventsWithFunding.map((ev) => {
      const funded = ev.sponsorships
        .filter((s) => s.status === 'ACCEPTED')
        .reduce((sum, s) => sum + s.amount, 0);
      const percentage = ev.targetBudget > 0
        ? Math.min(100, Math.round((funded / ev.targetBudget) * 100))
        : 0;

      return {
        id: ev.id,
        title: ev.title,
        category: ev.category,
        eventDate: ev.eventDate,
        venue: ev.venue,
        targetBudget: ev.targetBudget,
        fundedAmount: funded,
        fundingPercentage: percentage,
        status: ev.status,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalEvents,
          upcomingEvents,
          totalSponsors,
          totalPledged,
          totalAccepted,
          totalPending,
          pendingPledgesCount,
          acceptedPledgesCount,
          rejectedPledgesCount,
        },
        recentPledges,
        featuredEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [events, sponsorships] = await Promise.all([
      prisma.event.findMany({
        include: {
          sponsorships: {
            select: { amount: true, status: true },
          },
        },
      }),
      prisma.sponsorship.findMany({
        include: {
          event: { select: { title: true } },
          sponsor: { select: { name: true, businessCategory: true } },
        },
      }),
    ]);

    // 1. Events by Category
    const categoryCount: Record<string, number> = {};
    events.forEach((ev) => {
      categoryCount[ev.category] = (categoryCount[ev.category] || 0) + 1;
    });
    const eventsByCategory = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
    }));

    // 2. Funding per Event (Top 6)
    const fundingPerEvent = events.map((ev) => {
      const funded = ev.sponsorships
        .filter((s) => s.status === 'ACCEPTED')
        .reduce((sum, s) => sum + s.amount, 0);
      return {
        id: ev.id,
        title: ev.title.length > 25 ? ev.title.substring(0, 25) + '...' : ev.title,
        targetBudget: ev.targetBudget,
        fundedAmount: funded,
      };
    });

    // 3. Status breakdown
    const statusBreakdown = [
      {
        status: 'Accepted',
        count: sponsorships.filter((s) => s.status === 'ACCEPTED').length,
        totalAmount: sponsorships
          .filter((s) => s.status === 'ACCEPTED')
          .reduce((sum, s) => sum + s.amount, 0),
      },
      {
        status: 'Pending',
        count: sponsorships.filter((s) => s.status === 'PENDING').length,
        totalAmount: sponsorships
          .filter((s) => s.status === 'PENDING')
          .reduce((sum, s) => sum + s.amount, 0),
      },
      {
        status: 'Rejected',
        count: sponsorships.filter((s) => s.status === 'REJECTED').length,
        totalAmount: sponsorships
          .filter((s) => s.status === 'REJECTED')
          .reduce((sum, s) => sum + s.amount, 0),
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        eventsByCategory,
        fundingPerEvent,
        statusBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};
