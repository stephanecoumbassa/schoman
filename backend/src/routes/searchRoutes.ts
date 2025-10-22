import express from 'express';
import * as searchController from '../controllers/searchController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All search routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/search
 * @desc    Global search across all entities
 * @access  Private
 * @query   q - Search query (required)
 * @query   limit - Number of results to return (optional, default: 20)
 * @query   types - Comma-separated list of types to search (optional)
 * @query   schoolId - Filter by school (optional)
 */
router.get('/', searchController.globalSearch);

/**
 * @route   GET /api/search/autocomplete
 * @desc    Get autocomplete suggestions
 * @access  Private
 * @query   q - Search query (required)
 * @query   limit - Number of suggestions (optional, default: 5)
 * @query   schoolId - Filter by school (optional)
 */
router.get('/autocomplete', searchController.getAutocompleteSuggestions);

export default router;
