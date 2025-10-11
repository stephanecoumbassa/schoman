import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Process and optimize an uploaded image
 * @param filePath Path to the uploaded file
 * @param options Processing options
 * @returns Path to the processed image
 */
export async function processImage(
  filePath: string,
  options: ImageProcessingOptions = {}
): Promise<string> {
  const {
    width = 800,
    height,
    quality = 80,
    format = 'jpeg'
  } = options;

  const ext = path.extname(filePath);
  const outputPath = filePath.replace(ext, `.processed${ext}`);

  try {
    let transformer = sharp(filePath);

    // Resize if dimensions provided
    if (width || height) {
      transformer = transformer.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert format if specified
    if (format === 'jpeg') {
      transformer = transformer.jpeg({ quality });
    } else if (format === 'png') {
      transformer = transformer.png({ quality });
    } else if (format === 'webp') {
      transformer = transformer.webp({ quality });
    }

    await transformer.toFile(outputPath);

    // Delete original file and rename processed file
    fs.unlinkSync(filePath);
    fs.renameSync(outputPath, filePath);

    return filePath;
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    throw error;
  }
}

/**
 * Create avatar thumbnail from uploaded image
 * @param filePath Path to the uploaded file
 * @returns Path to the thumbnail
 */
export async function createAvatarThumbnail(filePath: string): Promise<string> {
  const ext = path.extname(filePath);
  const thumbnailPath = filePath.replace(ext, `.thumb${ext}`);

  try {
    await sharp(filePath)
      .resize(150, 150, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toFile(thumbnailPath);

    return thumbnailPath;
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }
    throw error;
  }
}

/**
 * Delete uploaded file and its thumbnails
 * @param filePath Path to the file to delete
 */
export function deleteUploadedFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete thumbnail if exists
    const ext = path.extname(filePath);
    const thumbnailPath = filePath.replace(ext, `.thumb${ext}`);
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}
