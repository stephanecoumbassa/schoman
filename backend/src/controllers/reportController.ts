import { Request, Response } from 'express';
import Report from '../models/Report.js';
import {
  generateExcelReport,
  generatePDFReport,
  generateCSVReport,
  getReportTemplates,
} from '../services/reportService.js';
import { logger } from '../middleware/errorHandler.js';

/**
 * Get all reports
 * GET /api/reports
 */
export async function getReports(req: Request, res: Response): Promise<void> {
  try {
    const { type, scheduled } = req.query;
    const schoolId = (req as any).user.school;

    const query: any = { school: schoolId };

    if (type) {
      query.type = type;
    }

    if (scheduled !== undefined) {
      query.scheduled = scheduled === 'true';
    }

    const reports = await Report.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error: any) {
    logger.error('Error fetching reports', { error });
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message,
    });
  }
}

/**
 * Get single report
 * GET /api/reports/:id
 */
export async function getReport(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const schoolId = (req as any).user.school;

    const report = await Report.findOne({ _id: id, school: schoolId }).populate(
      'createdBy',
      'firstName lastName email'
    );

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found',
      });
      return;
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    logger.error('Error fetching report', { error });
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message,
    });
  }
}

/**
 * Create new report
 * POST /api/reports
 */
export async function createReport(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.id;
    const schoolId = (req as any).user.school;

    const reportData = {
      ...req.body,
      createdBy: userId,
      school: schoolId,
    };

    const report = await Report.create(reportData);

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: report,
    });

    logger.info('Report created', { reportId: report._id, userId });
  } catch (error: any) {
    logger.error('Error creating report', { error });
    res.status(400).json({
      success: false,
      message: 'Error creating report',
      error: error.message,
    });
  }
}

/**
 * Update report
 * PUT /api/reports/:id
 */
export async function updateReport(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const schoolId = (req as any).user.school;

    const report = await Report.findOneAndUpdate(
      { _id: id, school: schoolId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: report,
    });

    logger.info('Report updated', { reportId: report._id });
  } catch (error: any) {
    logger.error('Error updating report', { error });
    res.status(400).json({
      success: false,
      message: 'Error updating report',
      error: error.message,
    });
  }
}

/**
 * Delete report
 * DELETE /api/reports/:id
 */
export async function deleteReport(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const schoolId = (req as any).user.school;

    const report = await Report.findOneAndDelete({ _id: id, school: schoolId });

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Report deleted successfully',
    });

    logger.info('Report deleted', { reportId: report._id });
  } catch (error: any) {
    logger.error('Error deleting report', { error });
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error.message,
    });
  }
}

/**
 * Generate and download report
 * POST /api/reports/:id/generate
 */
export async function generateReport(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const schoolId = (req as any).user.school;

    const report = await Report.findOne({ _id: id, school: schoolId });

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found',
      });
      return;
    }

    // Generate report based on format
    switch (report.format) {
      case 'excel':
        await generateExcelReport(report, schoolId, res);
        break;
      case 'pdf':
        await generatePDFReport(report, schoolId, res);
        break;
      case 'csv':
        await generateCSVReport(report, schoolId, res);
        break;
      default:
        res.status(400).json({
          success: false,
          message: 'Invalid report format',
        });
    }
  } catch (error: any) {
    logger.error('Error generating report', { error });
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message,
    });
  }
}

/**
 * Get report templates
 * GET /api/reports/templates
 */
export async function getTemplates(req: Request, res: Response): Promise<void> {
  try {
    const templates = getReportTemplates();

    res.json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error: any) {
    logger.error('Error fetching report templates', { error });
    res.status(500).json({
      success: false,
      message: 'Error fetching report templates',
      error: error.message,
    });
  }
}

/**
 * Get report statistics
 * GET /api/reports/stats
 */
export async function getReportStats(req: Request, res: Response): Promise<void> {
  try {
    const schoolId = (req as any).user.school;

    const [totalReports, scheduledReports, recentlyRun] = await Promise.all([
      Report.countDocuments({ school: schoolId }),
      Report.countDocuments({ school: schoolId, scheduled: true }),
      Report.find({ school: schoolId, lastRun: { $exists: true } })
        .sort({ lastRun: -1 })
        .limit(5)
        .select('name lastRun type'),
    ]);

    // Count by type
    const reportsByType = await Report.aggregate([
      { $match: { school: schoolId } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    // Count by format
    const reportsByFormat = await Report.aggregate([
      { $match: { school: schoolId } },
      { $group: { _id: '$format', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalReports,
        scheduledReports,
        recentlyRun,
        byType: reportsByType.reduce((acc: any, curr: any) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        byFormat: reportsByFormat.reduce((acc: any, curr: any) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
      },
    });
  } catch (error: any) {
    logger.error('Error fetching report statistics', { error });
    res.status(500).json({
      success: false,
      message: 'Error fetching report statistics',
      error: error.message,
    });
  }
}
