import { Router, Request, Response } from 'express';
import { upload, avatarUpload } from '../middleware/upload.js';
import { processImage, createAvatarThumbnail, deleteUploadedFile } from '../utils/imageProcessor.js';
import { authenticate } from '../middleware/auth.js';
import path from 'path';
import fs from 'fs';

const router = Router();

// Upload general file
router.post('/file', authenticate, upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/${req.body.uploadType || 'misc'}/${req.file.filename}`
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'File upload failed', error });
  }
});

// Upload avatar (with processing)
router.post('/avatar', authenticate, avatarUpload.single('avatar'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No avatar uploaded' });
      return;
    }

    // Process the avatar image
    const processedPath = await processImage(req.file.path, {
      width: 400,
      height: 400,
      quality: 85,
      format: 'jpeg'
    });

    // Create thumbnail
    const thumbnailPath = await createAvatarThumbnail(processedPath);

    res.status(201).json({
      message: 'Avatar uploaded successfully',
      avatar: {
        filename: req.file.filename,
        path: `/uploads/${req.body.uploadType || 'avatars'}/${req.file.filename}`,
        thumbnail: `/uploads/${req.body.uploadType || 'avatars'}/${path.basename(thumbnailPath)}`
      }
    });
  } catch (error) {
    // Clean up file on error
    if (req.file) {
      deleteUploadedFile(req.file.path);
    }
    res.status(500).json({ message: 'Avatar upload failed', error });
  }
});

// Upload multiple files
router.post('/files', authenticate, upload.array('files', 5), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ message: 'No files uploaded' });
      return;
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/${req.body.uploadType || 'misc'}/${file.filename}`
    }));

    res.status(201).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    res.status(500).json({ message: 'Files upload failed', error });
  }
});

// Delete uploaded file
router.delete('/:uploadType/:filename', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { uploadType, filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', uploadType, filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'File not found' });
      return;
    }

    deleteUploadedFile(filePath);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'File deletion failed', error });
  }
});

export default router;
