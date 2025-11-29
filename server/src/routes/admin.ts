import { Router } from 'express';
import {
  getAdminStats,
  getSubmissionStats,
  getUserActivityStats,
  getFinancialStats,
  getAdminPayments,
  getAdminUsers,
  getSystemHealth,
  getSystemSettings,
  updateSystemSettings,
  uploadPaymentQrCode,
  getAdminIssues,
  updateLandingPageConfig,
  getPaymentById,
  markPaymentAsPaid,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAllPageContent,
  updatePageContent,
  performSystemBackup
} from '../controllers/adminController';
import {
  getBackupHistory,
  getBackupDetails,
  getBackupStatus,
  downloadBackup,
  deleteBackup
} from '../controllers/backupController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// All routes require admin access
router.use(authenticate, authorize('ADMIN'));

// Dashboard & Stats
router.get('/stats', getAdminStats);
router.get('/stats/submissions', getSubmissionStats);
router.get('/stats/users', getUserActivityStats);
router.get('/stats/financial', getFinancialStats);
router.get('/system/health', getSystemHealth);
router.post('/system/backup', performSystemBackup);

// Payments
router.get('/payments', getAdminPayments);
router.get('/payments/:paymentId', getPaymentById);
router.put('/payments/:paymentId/paid', markPaymentAsPaid);

// Users
router.get('/users', getAdminUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Settings
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);
router.post('/settings/payment-qr', upload.single('qrCode'), uploadPaymentQrCode);
router.put('/landing-page-config', updateLandingPageConfig);

// Issues
router.get('/issues', getAdminIssues);

// Page Content Management
router.get('/page-content', getAllPageContent);
router.put('/page-content/:slug', updatePageContent);

// Backup Management
router.get('/backups', getBackupHistory);
router.get('/backups/:id', getBackupDetails);
router.get('/backups/:id/status', getBackupStatus);
router.get('/backups/:id/download', downloadBackup);
router.delete('/backups/:id', deleteBackup);

export default router;
