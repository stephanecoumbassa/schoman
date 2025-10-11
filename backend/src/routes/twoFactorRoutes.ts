import express from 'express';
import {
  enable2FA,
  verify2FA,
  disable2FA,
  verifyLoginToken,
  get2FAStatus,
  regenerateBackupCodes,
} from '../controllers/twoFactorController';
import { protect } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/2fa/status:
 *   get:
 *     summary: Get 2FA status for current user
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA status
 */
router.get('/status', protect, get2FAStatus);

/**
 * @swagger
 * /api/2fa/enable:
 *   post:
 *     summary: Enable 2FA - Generate secret and QR code
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup initiated with QR code
 */
router.post('/enable', protect, enable2FA);

/**
 * @swagger
 * /api/2fa/verify:
 *   post:
 *     summary: Verify and confirm 2FA setup
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: 6-digit TOTP code
 *     responses:
 *       200:
 *         description: 2FA enabled successfully with backup codes
 */
router.post('/verify', protect, verify2FA);

/**
 * @swagger
 * /api/2fa/disable:
 *   post:
 *     summary: Disable 2FA
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - token
 *             properties:
 *               password:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 */
router.post('/disable', protect, disable2FA);

/**
 * @swagger
 * /api/2fa/verify-login:
 *   post:
 *     summary: Verify 2FA token during login
 *     tags: [Two-Factor Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *             properties:
 *               email:
 *                 type: string
 *               token:
 *                 type: string
 *               isBackupCode:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Token verified successfully
 */
router.post('/verify-login', verifyLoginToken);

/**
 * @swagger
 * /api/2fa/regenerate-backup-codes:
 *   post:
 *     summary: Regenerate backup codes
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Backup codes regenerated
 */
router.post('/regenerate-backup-codes', protect, regenerateBackupCodes);

export default router;
