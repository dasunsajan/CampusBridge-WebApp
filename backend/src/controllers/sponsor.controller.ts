import { Request, Response, NextFunction } from 'express';
import prisma from '../database/db';

export const getAllSponsors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, category } = req.query;

    const where: any = {};
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }
    if (category && typeof category === 'string' && category !== 'ALL') {
      where.businessCategory = category;
    }

    const sponsors = await prisma.sponsor.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        sponsorships: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                category: true,
                status: true,
              },
            },
          },
        },
      },
    });

    const transformed = sponsors.map((s) => {
      const totalContributed = s.sponsorships
        .filter((sp) => sp.status === 'ACCEPTED')
        .reduce((sum, sp) => sum + sp.amount, 0);
      const pendingPledges = s.sponsorships
        .filter((sp) => sp.status === 'PENDING')
        .reduce((sum, sp) => sum + sp.amount, 0);

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        businessCategory: s.businessCategory,
        logoUrl: s.logoUrl,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        totalContributed,
        pendingPledges,
        supportedEventsCount: s.sponsorships.filter((sp) => sp.status === 'ACCEPTED').length,
        sponsorships: s.sponsorships,
      };
    });

    res.status(200).json({
      success: true,
      count: transformed.length,
      data: transformed,
    });
  } catch (error) {
    next(error);
  }
};

export const getSponsorById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const sponsor = await prisma.sponsor.findUnique({
      where: { id },
      include: {
        sponsorships: {
          include: {
            event: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!sponsor) {
      res.status(404).json({
        success: false,
        message: `Sponsor with ID '${id}' not found`,
      });
      return;
    }

    const totalContributed = sponsor.sponsorships
      .filter((sp) => sp.status === 'ACCEPTED')
      .reduce((sum, sp) => sum + sp.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        ...sponsor,
        totalContributed,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createSponsor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, phone, businessCategory, logoUrl } = req.body;

    // Check unique email
    const existing = await prisma.sponsor.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({
        success: false,
        message: `Sponsor with email '${email}' already exists`,
      });
      return;
    }

    const newSponsor = await prisma.sponsor.create({
      data: {
        name,
        email,
        phone,
        businessCategory,
        logoUrl: logoUrl || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Sponsor created successfully',
      data: {
        ...newSponsor,
        totalContributed: 0,
        pendingPledges: 0,
        supportedEventsCount: 0,
        sponsorships: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSponsor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.sponsor.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({
        success: false,
        message: `Sponsor with ID '${id}' not found`,
      });
      return;
    }

    // Check unique email if email is being updated
    if (req.body.email && req.body.email !== existing.email) {
      const emailConflict = await prisma.sponsor.findUnique({ where: { email: req.body.email } });
      if (emailConflict) {
        res.status(409).json({
          success: false,
          message: `Sponsor with email '${req.body.email}' already exists`,
        });
        return;
      }
    }

    const updated = await prisma.sponsor.update({
      where: { id },
      data: req.body,
    });

    res.status(200).json({
      success: true,
      message: 'Sponsor updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSponsor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.sponsor.findUnique({
      where: { id },
      include: { sponsorships: true },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: `Sponsor with ID '${id}' not found`,
      });
      return;
    }

    await prisma.sponsor.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: `Sponsor '${existing.name}' and related pledge history safely deleted`,
    });
  } catch (error) {
    next(error);
  }
};
