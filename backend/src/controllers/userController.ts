import { Response } from 'express';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, phone, address } = req.body;

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
      role,
      phone,
      address,
      isActive: true,
    });

    await user.save();

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error: error.message });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = (page - 1) * limit;

    const query: any = {};
    
    // Filter by role
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    // Search by name or email
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: error.message });
  }
};

export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error: error.message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, firstName, lastName, role, phone, address, isActive } = req.body;

    // Check if email is being changed and if it's already in use
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        email,
        firstName,
        lastName,
        role,
        phone,
        address,
        isActive,
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur', error: error.message });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    user.password = password;
    await user.save();

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe', error: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Impossible de supprimer le dernier administrateur' });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error: error.message });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      usersByRole: usersByRole.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};
