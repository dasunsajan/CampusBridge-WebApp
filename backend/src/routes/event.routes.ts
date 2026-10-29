import { Router } from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/event.controller';
import { validateRequest } from '../middleware/validate';
import {
  createEventSchema,
  updateEventSchema,
  getEventByIdSchema,
} from '../validators/event.validator';

const router = Router();

router.get('/', getAllEvents);
router.get('/:id', validateRequest(getEventByIdSchema), getEventById);
router.post('/', validateRequest(createEventSchema), createEvent);
router.put('/:id', validateRequest(updateEventSchema), updateEvent);
router.delete('/:id', validateRequest(getEventByIdSchema), deleteEvent);

export default router;
