import { z } from 'zod';

/**
 * Common validation schemas using Zod
 */

// Common patterns
const emailSchema = z.string().email('Email invalide');
const phoneSchema = z.string().regex(/^(\+?\d{1,3}[- ]?)?\d{10}$/, 'Numéro de téléphone invalide');
const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID invalide');

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Le mot de passe est requis'),
});

// Validation middleware factory
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Erreurs de validation',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};
