import { Router } from 'express';
import {
  getAllSponsors,
  getSponsorById,
  createSponsor,
  updateSponsor,
  deleteSponsor,
} from '../controllers/sponsor.controller';
import { validateRequest } from '../middleware/validate';
import {
  createSponsorSchema,
  updateSponsorSchema,
  getSponsorByIdSchema,
} from '../validators/sponsor.validator';

const router = Router();

router.get('/', getAllSponsors);
router.get('/:id', validateRequest(getSponsorByIdSchema), getSponsorById);
router.post('/', validateRequest(createSponsorSchema), createSponsor);
router.put('/:id', validateRequest(updateSponsorSchema), updateSponsor);
router.delete('/:id', validateRequest(getSponsorByIdSchema), deleteSponsor);

export default router;
