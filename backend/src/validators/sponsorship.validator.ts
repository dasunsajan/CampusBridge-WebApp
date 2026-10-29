import { z } from 'zod';

export const createSponsorshipSchema = z.object({
  body: z.object({
    eventId: z.string({ required_error: 'Event ID is required' }).uuid('Invalid Event ID format'),
    sponsorId: z.string({ required_error: 'Sponsor ID is required' }).uuid('Invalid Sponsor ID format'),
    amount: z
      .number({ required_error: 'Pledge amount is required' })
      .positive('Pledge amount must be greater than zero'),
    message: z.string().max(500, 'Message cannot exceed 500 characters').trim().optional().nullable(),
    status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).optional().default('PENDING'),
  }),
});

export const updateSponsorshipStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Sponsorship ID format'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED'], {
      required_error: 'Valid status (PENDING, ACCEPTED, or REJECTED) is required',
    }),
  }),
});

export const getSponsorshipByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Sponsorship ID format'),
  }),
});
