import { Request, Response } from 'express';
import searchService from '../services/searchService.js';

/**
 * Global search across all entities
 */
export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { q: query, limit, types, schoolId } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required',
      });
    }

    const results = await searchService.globalSearch({
      query,
      limit: limit ? parseInt(limit as string, 10) : 20,
      types: types ? (types as string).split(',') : undefined,
      schoolId: schoolId as string | undefined,
    });

    res.status(200).json({
      success: true,
      data: {
        query,
        count: results.length,
        results,
      },
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get autocomplete suggestions
 */
export const getAutocompleteSuggestions = async (req: Request, res: Response) => {
  try {
    const { q: query, limit, schoolId } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required',
      });
    }

    const suggestions = await searchService.getAutocompleteSuggestions(
      query,
      limit ? parseInt(limit as string, 10) : 5,
      schoolId as string | undefined
    );

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des suggestions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
