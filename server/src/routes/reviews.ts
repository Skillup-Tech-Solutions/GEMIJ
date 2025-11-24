import { Router } from 'express';
import {
  getReviewInvitations,
  respondToInvitation,
  submitReview,
  getReview,
  updateReview,
  getPendingInvitations,
  acceptInvitation,
  declineInvitation,
  getPendingReviews,
  getCompletedReviews,
  getReviewStats,
  getReviewHistory,
  generateCertificate,
  updateReviewSharing
} from '../controllers/reviewController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.REVIEWER, UserRole.EDITOR, UserRole.ADMIN));

router.get('/', getReviewInvitations);
router.get('/invitations', getReviewInvitations);
router.get('/invitations/pending', getPendingInvitations);
router.get('/pending', getPendingReviews);
router.get('/completed', getCompletedReviews);
router.get('/stats', getReviewStats);
router.get('/history', getReviewHistory);
router.get('/:reviewId/certificate', generateCertificate);
router.get('/:reviewId', getReview);
router.post('/:reviewId/respond', respondToInvitation);
router.post('/invitations/:invitationId/accept', acceptInvitation);
router.post('/invitations/:invitationId/decline', declineInvitation);
router.put('/:reviewId', updateReview);
router.post('/:reviewId/submit', authenticate, submitReview); // Modified to include authenticate
router.put('/:reviewId/share-reports', authenticate, updateReviewSharing); // Added new route

export default router;