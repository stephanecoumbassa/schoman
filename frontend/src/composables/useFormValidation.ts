import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

/**
 * Common validation rules using Zod
 */

// Common patterns
export const emailRule = z.string().email('Email invalide')
export const phoneRule = z.string().regex(/^(\+?\d{1,3}[- ]?)?\d{10}$/, 'Numéro de téléphone invalide')
export const requiredString = (fieldName: string, minLength: number = 2) =>
  z.string().min(minLength, `${fieldName} doit contenir au moins ${minLength} caractères`)

/**
 * User validation schemas
 */
export const loginSchema = toTypedSchema(
  z.object({
    email: emailRule,
    password: z.string().min(1, 'Le mot de passe est requis'),
  })
)

export const registerSchema = toTypedSchema(
  z.object({
    firstName: requiredString('Le prénom'),
    lastName: requiredString('Le nom'),
    email: emailRule,
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    phone: phoneRule.optional(),
  })
)

/**
 * Student validation schemas
 */
export const studentSchema = toTypedSchema(
  z.object({
    firstName: requiredString('Le prénom'),
    lastName: requiredString('Le nom'),
    email: emailRule.optional().or(z.literal('')),
    studentNumber: requiredString('Le numéro d\'étudiant', 1),
    dateOfBirth: z.string().min(1, 'La date de naissance est requise'),
    placeOfBirth: requiredString('Le lieu de naissance'),
    gender: z.enum(['M', 'F'], { errorMap: () => ({ message: 'Genre invalide' }) }),
    level: z.string().optional(),
    parentContact: z.object({
      name: requiredString('Le nom du parent'),
      phone: phoneRule,
      email: emailRule.optional().or(z.literal('')),
      relationship: requiredString('La relation'),
    }),
    emergencyContact: z.object({
      name: requiredString('Le nom du contact d\'urgence'),
      phone: phoneRule,
    }),
    medicalInfo: z.string().optional(),
    notes: z.string().optional(),
  })
)

/**
 * Class validation schema
 */
export const classSchema = toTypedSchema(
  z.object({
    name: requiredString('Le nom de la classe'),
    level: requiredString('Le niveau', 1),
    capacity: z.number().int().positive('La capacité doit être un nombre positif'),
  })
)

/**
 * Subject validation schema
 */
export const subjectSchema = toTypedSchema(
  z.object({
    name: requiredString('Le nom de la matière'),
    code: requiredString('Le code de la matière'),
    level: requiredString('Le niveau', 1),
    coefficient: z.number().positive('Le coefficient doit être positif').default(1),
  })
)

/**
 * Grade validation schema
 */
export const gradeSchema = toTypedSchema(
  z.object({
    value: z.number().min(0, 'La note doit être au moins 0').max(20, 'La note ne peut pas dépasser 20'),
    coefficient: z.number().positive('Le coefficient doit être positif').default(1),
    examType: z.enum(['Quiz', 'Test', 'Exam', 'Project', 'Homework'], {
      errorMap: () => ({ message: 'Type d\'examen invalide' }),
    }),
    date: z.string().min(1, 'La date est requise'),
    comments: z.string().optional(),
  })
)

/**
 * Message validation schema
 */
export const messageSchema = toTypedSchema(
  z.object({
    subject: requiredString('Le sujet'),
    content: z.string().min(1, 'Le contenu est requis'),
    priority: z.enum(['Low', 'Normal', 'High'], {
      errorMap: () => ({ message: 'Priorité invalide' }),
    }).default('Normal'),
  })
)

/**
 * Invoice validation schema
 */
export const invoiceSchema = toTypedSchema(
  z.object({
    invoiceNumber: requiredString('Le numéro de facture', 1),
    amount: z.number().positive('Le montant doit être positif'),
    dueDate: z.string().min(1, 'La date d\'échéance est requise'),
    description: z.string().optional(),
  })
)

/**
 * Book validation schema
 */
export const bookSchema = toTypedSchema(
  z.object({
    title: requiredString('Le titre'),
    author: requiredString('L\'auteur'),
    isbn: z.string().optional(),
    category: requiredString('La catégorie'),
    quantity: z.number().int().nonnegative('La quantité doit être positive ou zéro'),
  })
)

/**
 * Event validation schema
 */
export const eventSchema = toTypedSchema(
  z.object({
    title: requiredString('Le titre'),
    description: z.string().optional(),
    type: z.enum(['Meeting', 'Trip', 'Celebration', 'Sports', 'Other'], {
      errorMap: () => ({ message: 'Type d\'événement invalide' }),
    }),
    date: z.string().min(1, 'La date est requise'),
    location: z.string().optional(),
  })
)

/**
 * Expense validation schema
 */
export const expenseSchema = toTypedSchema(
  z.object({
    description: requiredString('La description'),
    amount: z.number().positive('Le montant doit être positif'),
    category: requiredString('La catégorie'),
    date: z.string().min(1, 'La date est requise'),
    paymentMethod: z.string().optional(),
  })
)

