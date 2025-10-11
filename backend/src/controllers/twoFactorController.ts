import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import twoFactorService from '../services/twoFactorService';
import { ValidationError, NotFoundError, AuthenticationError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Enable 2FA for user - Generate secret
 */
export const enable2FA = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }
    
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    if (user.twoFactorEnabled) {
      return res.status(400).json({
        message: '2FA is already enabled for this user',
      });
    }
    
    // Generate secret and QR code
    const { secret, qrCodeUrl } = twoFactorService.generateSecretWithQR(
      user.email,
      'Schoman'
    );
    
    // Store secret (temporarily, until user verifies)
    user.twoFactorSecret = secret;
    await user.save();
    
    logger.info('2FA setup initiated', { userId: user._id });
    
    res.json({
      message: '2FA setup initiated',
      secret,
      qrCodeUrl,
      instructions: 'Scan the QR code with your authenticator app and verify with a token',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify and confirm 2FA setup
 */
export const verify2FA = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { token } = req.body;
    
    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }
    
    if (!token) {
      throw new ValidationError('Token is required');
    }
    
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) {
      throw new NotFoundError('2FA setup not initiated');
    }
    
    // Verify token
    const isValid = twoFactorService.verifyToken(token, user.twoFactorSecret);
    
    if (!isValid) {
      throw new ValidationError('Invalid token');
    }
    
    // Generate backup codes
    const { codes, hashedCodes } = twoFactorService.generateBackupCodes();
    
    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = hashedCodes;
    await user.save();
    
    logger.info('2FA enabled successfully', { userId: user._id });
    
    res.json({
      message: '2FA enabled successfully',
      backupCodes: codes,
      warning: 'Save these backup codes in a safe place. They can be used to access your account if you lose your authenticator device.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disable 2FA for user
 */
export const disable2FA = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { password, token } = req.body;
    
    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }
    
    if (!password) {
      throw new ValidationError('Password is required');
    }
    
    const user = await User.findById(userId).select('+password +twoFactorSecret');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid password');
    }
    
    // If 2FA is enabled, verify token before disabling
    if (user.twoFactorEnabled) {
      if (!token) {
        throw new ValidationError('2FA token is required');
      }
      
      const isValid = twoFactorService.verifyToken(token, user.twoFactorSecret!);
      if (!isValid) {
        throw new ValidationError('Invalid 2FA token');
      }
    }
    
    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = undefined;
    await user.save();
    
    logger.info('2FA disabled', { userId: user._id });
    
    res.json({
      message: '2FA disabled successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify 2FA token during login
 */
export const verifyLoginToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, token, isBackupCode } = req.body;
    
    if (!email || !token) {
      throw new ValidationError('Email and token are required');
    }
    
    const user = await User.findOne({ email }).select('+twoFactorSecret +twoFactorBackupCodes');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    if (!user.twoFactorEnabled) {
      throw new ValidationError('2FA is not enabled for this user');
    }
    
    let isValid = false;
    
    if (isBackupCode) {
      // Verify backup code
      isValid = twoFactorService.verifyBackupCode(token, user.twoFactorBackupCodes || []);
      
      if (isValid) {
        // Remove used backup code
        user.twoFactorBackupCodes = twoFactorService.removeBackupCode(
          token,
          user.twoFactorBackupCodes || []
        );
        await user.save();
        
        logger.info('Backup code used for 2FA', { userId: user._id });
      }
    } else {
      // Verify TOTP token
      isValid = twoFactorService.verifyToken(token, user.twoFactorSecret!);
    }
    
    if (!isValid) {
      throw new ValidationError('Invalid token');
    }
    
    logger.info('2FA verification successful', { userId: user._id });
    
    res.json({
      message: '2FA verification successful',
      verified: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get 2FA status
 */
export const get2FAStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }
    
    const user = await User.findById(userId).select('+twoFactorBackupCodes');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    const backupCodesCount = user.twoFactorBackupCodes?.length || 0;
    
    res.json({
      enabled: user.twoFactorEnabled,
      backupCodesRemaining: backupCodesCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Regenerate backup codes
 */
export const regenerateBackupCodes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { token } = req.body;
    
    if (!userId) {
      throw new AuthenticationError('User not authenticated');
    }
    
    if (!token) {
      throw new ValidationError('2FA token is required');
    }
    
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    if (!user.twoFactorEnabled) {
      throw new ValidationError('2FA is not enabled');
    }
    
    // Verify token
    const isValid = twoFactorService.verifyToken(token, user.twoFactorSecret!);
    if (!isValid) {
      throw new ValidationError('Invalid token');
    }
    
    // Generate new backup codes
    const { codes, hashedCodes } = twoFactorService.generateBackupCodes();
    user.twoFactorBackupCodes = hashedCodes;
    await user.save();
    
    logger.info('Backup codes regenerated', { userId: user._id });
    
    res.json({
      message: 'Backup codes regenerated successfully',
      backupCodes: codes,
      warning: 'Save these backup codes in a safe place. Old backup codes are now invalid.',
    });
  } catch (error) {
    next(error);
  }
};
