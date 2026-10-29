import { z } from 'zod';

export const createEventSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Event title is required' })
      .min(3, 'Title must be at least 3 characters')
      .max(120, 'Title cannot exceed 120 characters')
      .trim(),
    description: z
      .string({ required_error: 'Description is required' })
      .min(10, 'Description must be at least 10 characters')
      .trim(),
    category: z
      .string({ required_error: 'Category is required' })
      .min(2, 'Category is required'),
    organizerName: z
      .string({ required_error: 'Organizer name is required' })
      .min(2, 'Organizer name is required')
      .trim(),
    eventDate: z.string({ required_error: 'Event date is required' }).refine(
      (val) => !isNaN(Date.parse(val)),
      { message: 'Event date must be a valid ISO date string' }
    ),
    venue: z
      .string({ required_error: 'Venue is required' })
      .min(2, 'Venue is required')
      .trim(),
    targetBudget: z
      .number({ required_error: 'Target budget is required' })
      .positive('Target budget must be greater than zero'),
    status: z
      .enum(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'])
      .optional()
      .default('UPCOMING'),
    imageUrl: z
      .string()
      .url('Image URL must be a valid URL')
      .optional()
      .or(z.literal(''))
      .nullable(),
  }),
});

export const updateEventSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Event ID format'),
  }),
  body: z.object({
    title: z.string().min(3).max(120).trim().optional(),
    description: z.string().min(10).trim().optional(),
    category: z.string().min(2).optional(),
    organizerName: z.string().min(2).trim().optional(),
    eventDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Event date must be a valid ISO date string',
      })
      .optional(),
    venue: z.string().min(2).trim().optional(),
    targetBudget: z.number().positive().optional(),
    status: z.enum(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
    imageUrl: z.string().url().optional().or(z.literal('')).nullable(),
  }),
});

export const getEventByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Event ID format'),
  }),
});
