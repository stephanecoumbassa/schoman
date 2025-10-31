import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { AuthRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRES_IN = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || '7') * 24 * 60 * 60 * 1000; // 7 days in ms

// Helper function to generate access token
const generateAccessToken = (userId: any, email: string, role: string, school?: any) => {
  return jwt.sign(
    { id: userId, email, role, school },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Helper function to create refresh token
const createRefreshToken = async (userId: any, deviceId?: string, ipAddress?: string) => {
  const token = RefreshToken.schema.statics.generateToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN);

  const refreshToken = await RefreshToken.create({
    token,
    userId,
    deviceId,
    expiresAt,
    createdByIp: ipAddress,
  });

  return refreshToken;
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || 'student',
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.email, user.role, user.school);
    const deviceId = req.body.deviceId || req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    const refreshToken = await createRefreshToken(user._id, deviceId, ipAddress);

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      accessToken,
      refreshToken: refreshToken.token,
      expiresIn: JWT_EXPIRES_IN,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        school: user.school,
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Compte désactivé' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.email, user.role, user.school);
    const deviceId = req.body.deviceId || req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    const refreshToken = await createRefreshToken(user._id, deviceId, ipAddress);

    res.json({
      message: 'Connexion réussie',
      accessToken,
      refreshToken: refreshToken.token,
      expiresIn: JWT_EXPIRES_IN,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        school: user.school,
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil', error: error.message });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Refresh token requis' });
    }

    // Find refresh token
    const refreshToken = await RefreshToken.findOne({ token }).populate('userId');
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token invalide' });
    }

    // Check if token is active
    if (!refreshToken.isActive) {
      // Detect token reuse - revoke all tokens for this user
      if (refreshToken.isRevoked) {
        await RefreshToken.updateMany(
          { userId: refreshToken.userId },
          { $set: { isRevoked: true, revokedAt: new Date(), revokedReason: 'Token reuse detected' } }
        );
        return res.status(401).json({ 
          message: 'Token reuse détecté. Tous les tokens ont été révoqués pour des raisons de sécurité.' 
        });
      }
      return res.status(401).json({ message: 'Refresh token expiré ou révoqué' });
    }

    const user = refreshToken.userId as any;

    // Check if user is still active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Compte désactivé' });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id, user.email, user.role, user.school);
    const deviceId = req.body.deviceId || req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    const newRefreshToken = await createRefreshToken(user._id, deviceId, ipAddress);

    // Revoke old refresh token
    refreshToken.isRevoked = true;
    refreshToken.revokedAt = new Date();
    refreshToken.revokedReason = 'Replaced by new token';
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();

    res.json({
      message: 'Token rafraîchi avec succès',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken.token,
      expiresIn: JWT_EXPIRES_IN,
    });
  } catch (error: any) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    res.status(500).json({ message: 'Erreur lors du rafraîchissement du token', error: error.message });
  }
};

export const revokeToken = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Refresh token requis' });
    }

    const refreshToken = await RefreshToken.findOne({ token });

    if (!refreshToken) {
      return res.status(404).json({ message: 'Token non trouvé' });
    }

    // Verify the token belongs to the authenticated user
    if (req.user && refreshToken.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Non autorisé à révoquer ce token' });
    }

    // Revoke token
    refreshToken.isRevoked = true;
    refreshToken.revokedAt = new Date();
    refreshToken.revokedReason = 'Revoked by user';
    await refreshToken.save();

    res.json({ message: 'Token révoqué avec succès' });
  } catch (error: any) {
    console.error('Erreur lors de la révocation du token:', error);
    res.status(500).json({ message: 'Erreur lors de la révocation du token', error: error.message });
  }
};

export const revokeAllTokens = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Revoke all active refresh tokens for the user
    const result = await RefreshToken.updateMany(
      { userId, isRevoked: false },
      { 
        $set: { 
          isRevoked: true, 
          revokedAt: new Date(), 
          revokedReason: 'Revoked all tokens by user' 
        } 
      }
    );

    res.json({ 
      message: 'Tous les tokens ont été révoqués avec succès',
      tokensRevoked: result.modifiedCount,
    });
  } catch (error: any) {
    console.error('Erreur lors de la révocation de tous les tokens:', error);
    res.status(500).json({ message: 'Erreur lors de la révocation de tous les tokens', error: error.message });
  }
};
