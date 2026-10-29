import { Request, Response, NextFunction } from 'express';
import prisma from '../database/db';

// Helper to calculate funding metrics for an event
export const calculateEventFunding = (
  targetBudget: number,
  sponsorships: Array<{ amount: number; status: string }>
) => {
  const pledgedAmount = sponsorships.reduce((sum, s) => sum + s.amount, 0);
  const fundedAmount = sponsorships
    .filter((s) => s.status === 'ACCEPTED')
    .reduce((sum, s) => sum + s.amount, 0);
  const pendingAmount = sponsorships
    .filter((s) => s.status === 'PENDING')
    .reduce((sum, s) => sum + s.amount, 0);

  const fundingPercentage = targetBudget > 0
    ? Math.min(100, Math.round((fundedAmount / targetBudget) * 100))
    : 0;

  return {
    pledgedAmount,
    fundedAmount,
    pendingAmount,
    fundingPercentage,
    sponsorsCount: sponsorships.filter((s) => s.status === 'ACCEPTED').length,
    totalPledgesCount: sponsorships.length,
  };
};

export const getAllEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, category, status, sortBy = 'eventDate', sortOrder = 'asc' } = req.query;

    const where: any = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { organizerName: { contains: search } },
        { venue: { contains: search } },
      ];
    }

    if (category && typeof category === 'string' && category !== 'ALL') {
      where.category = category;
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    const orderBy: any = {};
    const validSortFields = ['eventDate', 'createdAt', 'targetBudget', 'title'];
    const field = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'eventDate';
    const direction = sortOrder === 'desc' ? 'desc' : 'asc';
    orderBy[field] = direction;

    const events = await prisma.event.findMany({
      where,
      orderBy,
      include: {
        sponsorships: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
      },
    });

    const transformedEvents = events.map((event) => {
      const metrics = calculateEventFunding(event.targetBudget, event.sponsorships);
      return {
        ...event,
        ...metrics,
      };
    });

    res.status(200).json({
      success: true,
      count: transformedEvents.length,
      data: transformedEvents,
    });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        sponsorships: {
          include: {
            sponsor: {
              select: {
                id: true,
                name: true,
                email: true,
                businessCategory: true,
                logoUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!event) {
      res.status(404).json({
        success: false,
        message: `Event with ID '${id}' not found`,
      });
      return;
    }

    const metrics = calculateEventFunding(event.targetBudget, event.sponsorships);

    res.status(200).json({
      success: true,
      data: {
        ...event,
        ...metrics,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      title,
      description,
      category,
      organizerName,
      eventDate,
      venue,
      targetBudget,
      status = 'UPCOMING',
      imageUrl,
    } = req.body;

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        category,
        organizerName,
        eventDate: new Date(eventDate),
        venue,
        targetBudget: Number(targetBudget),
        status,
        imageUrl: imageUrl || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        ...newEvent,
        pledgedAmount: 0,
        fundedAmount: 0,
        pendingAmount: 0,
        fundingPercentage: 0,
        sponsorsCount: 0,
        totalPledgesCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      res.status(404).json({
        success: false,
        message: `Event with ID '${id}' not found`,
      });
      return;
    }

    const dataToUpdate: any = { ...req.body };
    if (dataToUpdate.eventDate) {
      dataToUpdate.eventDate = new Date(dataToUpdate.eventDate);
    }
    if (dataToUpdate.targetBudget) {
      dataToUpdate.targetBudget = Number(dataToUpdate.targetBudget);
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: dataToUpdate,
      include: {
        sponsorships: {
          select: { id: true, amount: true, status: true },
        },
      },
    });

    const metrics = calculateEventFunding(updatedEvent.targetBudget, updatedEvent.sponsorships);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: {
        ...updatedEvent,
        ...metrics,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { sponsorships: true },
    });

    if (!existingEvent) {
      res.status(404).json({
        success: false,
        message: `Event with ID '${id}' not found`,
      });
      return;
    }

    // Cascade delete is configured in Prisma schema (sponsorships linked to this event are cleaned up)
    await prisma.event.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: `Event '${existingEvent.title}' and its ${existingEvent.sponsorships.length} linked sponsorship pledge(s) were safely removed`,
    });
  } catch (error) {
    next(error);
  }
};
