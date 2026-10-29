import { Router } from 'express';
import {
  getAllSponsorships,
  getSponsorshipById,
  createSponsorship,
  updateSponsorshipStatus,
  deleteSponsorship,
} from '../controllers/sponsorship.controller';
import { validateRequest } from '../middleware/validate';
import {
  createSponsorshipSchema,
  updateSponsorshipStatusSchema,
  getSponsorshipByIdSchema,
} from '../validators/sponsorship.validator';

const router = Router();

router.get('/', getAllSponsorships);
router.get('/:id', validateRequest(getSponsorshipByIdSchema), getSponsorshipById);
router.post('/', validateRequest(createSponsorshipSchema), createSponsorship);
router.patch('/:id/status', validateRequest(updateSponsorshipStatusSchema), updateSponsorshipStatus);
router.delete('/:id', validateRequest(getSponsorshipByIdSchema), deleteSponsorship);

export default router;
