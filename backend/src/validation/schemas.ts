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

// School Year schemas
export const schoolYearCreateSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'année scolaire est requis'),
  startDate: z.string().datetime({ message: 'Date de début invalide' }).or(z.date()),
  endDate: z.string().datetime({ message: 'Date de fin invalide' }).or(z.date()),
  isCurrent: z.boolean().optional(),
  status: z.enum(['active', 'archived', 'upcoming']).optional(),
  school: mongoIdSchema.optional(),
  description: z.string().optional(),
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  },
  {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
  }
);

export const schoolYearUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
  isCurrent: z.boolean().optional(),
  status: z.enum(['active', 'archived', 'upcoming']).optional(),
  description: z.string().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    }
    return true;
  },
  {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
  }
);

export const promoteStudentsSchema = z.object({
  studentIds: z.array(mongoIdSchema).min(1, 'Au moins un élève est requis'),
  targetClassId: mongoIdSchema,
  targetLevel: z.string().min(1, 'Le niveau cible est requis'),
  newSchoolYearId: mongoIdSchema,
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
          errors: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};
