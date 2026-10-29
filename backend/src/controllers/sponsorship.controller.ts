import { Request, Response, NextFunction } from 'express';
import prisma from '../database/db';

export const getAllSponsorships = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { eventId, sponsorId, status } = req.query;

    const where: any = {};
    if (eventId && typeof eventId === 'string') {
      where.eventId = eventId;
    }
    if (sponsorId && typeof sponsorId === 'string') {
      where.sponsorId = sponsorId;
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    const sponsorships = await prisma.sponsorship.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            targetBudget: true,
            status: true,
          },
        },
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
    });

    res.status(200).json({
      success: true,
      count: sponsorships.length,
      data: sponsorships,
    });
  } catch (error) {
    next(error);
  }
};

export const getSponsorshipById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const sponsorship = await prisma.sponsorship.findUnique({
      where: { id },
      include: {
        event: true,
        sponsor: true,
      },
    });

    if (!sponsorship) {
      res.status(404).json({
        success: false,
        message: `Sponsorship pledge with ID '${id}' not found`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: sponsorship,
    });
  } catch (error) {
    next(error);
  }
};

export const createSponsorship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { eventId, sponsorId, amount, message, status = 'PENDING' } = req.body;

    // Verify linked Event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      res.status(404).json({
        success: false,
        message: `Cannot create pledge: Event with ID '${eventId}' does not exist`,
      });
      return;
    }

    // Verify linked Sponsor exists
    const sponsor = await prisma.sponsor.findUnique({ where: { id: sponsorId } });
    if (!sponsor) {
      res.status(404).json({
        success: false,
        message: `Cannot create pledge: Sponsor with ID '${sponsorId}' does not exist`,
      });
      return;
    }

    const newSponsorship = await prisma.sponsorship.create({
      data: {
        eventId,
        sponsorId,
        amount: Number(amount),
        message: message || null,
        status,
      },
      include: {
        event: {
          select: { id: true, title: true, targetBudget: true },
        },
        sponsor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Micro-sponsorship pledge recorded successfully',
      data: newSponsorship,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSponsorshipStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existing = await prisma.sponsorship.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({
        success: false,
        message: `Sponsorship pledge with ID '${id}' not found`,
      });
      return;
    }

    const updated = await prisma.sponsorship.update({
      where: { id },
      data: { status },
      include: {
        event: {
          select: { id: true, title: true, targetBudget: true },
        },
        sponsor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: `Sponsorship status updated to '${status}'`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSponsorship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.sponsorship.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({
        success: false,
        message: `Sponsorship pledge with ID '${id}' not found`,
      });
      return;
    }

    await prisma.sponsorship.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Sponsorship pledge safely deleted',
    });
  } catch (error) {
    next(error);
  }
};
