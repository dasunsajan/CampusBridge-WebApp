import { z } from 'zod';

export const createSponsorSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Sponsor name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .trim(),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Must be a valid email address')
      .toLowerCase()
      .trim(),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .min(7, 'Phone number must be at least 7 characters')
      .trim(),
    businessCategory: z
      .string({ required_error: 'Business category is required' })
      .min(2, 'Business category is required'),
    logoUrl: z
      .string()
      .url('Logo URL must be a valid URL')
      .optional()
      .or(z.literal(''))
      .nullable(),
  }),
});

export const updateSponsorSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Sponsor ID format'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    email: z.string().email().toLowerCase().trim().optional(),
    phone: z.string().min(7).trim().optional(),
    businessCategory: z.string().min(2).optional(),
    logoUrl: z.string().url().optional().or(z.literal('')).nullable(),
  }),
});

export const getSponsorByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Sponsor ID format'),
  }),
});
