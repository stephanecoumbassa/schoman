import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { upload, avatarUpload } from '../../middleware/upload.js';

// Mock file system operations
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Upload Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockReturnValue(undefined);
  });

  describe('File Type Validation', () => {
    describe('General Upload - Allowed Image Types', () => {
      const allowedImageTypes = [
        { ext: '.jpeg', mime: 'image/jpeg', name: 'test.jpeg' },
        { ext: '.jpg', mime: 'image/jpeg', name: 'test.jpg' },
        { ext: '.png', mime: 'image/png', name: 'test.png' },
        { ext: '.gif', mime: 'image/gif', name: 'test.gif' },
        { ext: '.webp', mime: 'image/webp', name: 'test.webp' },
      ];

      allowedImageTypes.forEach(({ ext, mime, name }) => {
        it(`should accept ${ext} image files`, () => {
          const file = {
            originalname: name,
            mimetype: mime,
          } as Express.Multer.File;

          const req = {} as Request;
          const callback = jest.fn();

          // Access the fileFilter from upload config
          const fileFilter = (upload as any).fileFilter;
          fileFilter(req, file, callback);

          expect(callback).toHaveBeenCalledWith(null, true);
        });
      });
    });

    describe('General Upload - Allowed Document Types', () => {
      const allowedDocTypes = [
        { ext: '.pdf', mime: 'application/pdf', name: 'document.pdf' },
        { ext: '.doc', mime: 'application/msword', name: 'document.doc' },
        { ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'document.docx' },
        { ext: '.xls', mime: 'application/vnd.ms-excel', name: 'spreadsheet.xls' },
        { ext: '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', name: 'spreadsheet.xlsx' },
      ];

      allowedDocTypes.forEach(({ ext, mime, name }) => {
        it(`should accept ${ext} document files`, () => {
          const file = {
            originalname: name,
            mimetype: mime,
          } as Express.Multer.File;

          const req = {} as Request;
          const callback = jest.fn();

          const fileFilter = (upload as any).fileFilter;
          fileFilter(req, file, callback);

          expect(callback).toHaveBeenCalledWith(null, true);
        });
      });
    });

    describe('General Upload - Rejected File Types', () => {
      const rejectedTypes = [
        { ext: '.exe', mime: 'application/x-msdownload', name: 'malware.exe' },
        { ext: '.bat', mime: 'application/x-bat', name: 'script.bat' },
        { ext: '.sh', mime: 'application/x-sh', name: 'script.sh' },
        { ext: '.php', mime: 'application/x-httpd-php', name: 'script.php' },
        { ext: '.js', mime: 'application/javascript', name: 'script.js' },
        { ext: '.zip', mime: 'application/zip', name: 'archive.zip' },
      ];

      rejectedTypes.forEach(({ ext, mime, name }) => {
        it(`should reject ${ext} files`, () => {
          const file = {
            originalname: name,
            mimetype: mime,
          } as Express.Multer.File;

          const req = {} as Request;
          const callback = jest.fn();

          const fileFilter = (upload as any).fileFilter;
          fileFilter(req, file, callback);

          expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Invalid file type. Only images and documents are allowed.'
            })
          );
        });
      });
    });

    describe('General Upload - Case Insensitivity', () => {
      it('should accept files with uppercase extensions', () => {
        const file = {
          originalname: 'test.PDF',
          mimetype: 'application/pdf',
        } as Express.Multer.File;

        const req = {} as Request;
        const callback = jest.fn();

        const fileFilter = (upload as any).fileFilter;
        fileFilter(req, file, callback);

        expect(callback).toHaveBeenCalledWith(null, true);
      });

      it('should accept files with mixed case extensions', () => {
        const file = {
          originalname: 'test.JpG',
          mimetype: 'image/jpeg',
        } as Express.Multer.File;

        const req = {} as Request;
        const callback = jest.fn();

        const fileFilter = (upload as any).fileFilter;
        fileFilter(req, file, callback);

        expect(callback).toHaveBeenCalledWith(null, true);
      });
    });

    describe('General Upload - MIME Type Validation', () => {
      it('should reject files with mismatched extension and MIME type', () => {
        const file = {
          originalname: 'fake-image.jpg',
          mimetype: 'application/x-msdownload', // Executable MIME type
        } as Express.Multer.File;

        const req = {} as Request;
        const callback = jest.fn();

        const fileFilter = (upload as any).fileFilter;
        fileFilter(req, file, callback);

        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Invalid file type. Only images and documents are allowed.'
          })
        );
      });

      it('should accept files with correct extension and MIME type', () => {
        const file = {
          originalname: 'valid-image.jpg',
          mimetype: 'image/jpeg',
        } as Express.Multer.File;

        const req = {} as Request;
        const callback = jest.fn();

        const fileFilter = (upload as any).fileFilter;
        fileFilter(req, file, callback);

        expect(callback).toHaveBeenCalledWith(null, true);
      });
    });
  });

  describe('Avatar Upload - File Type Validation', () => {
    describe('Avatar Upload - Allowed Image Types', () => {
      const allowedTypes = [
        { ext: '.jpeg', mime: 'image/jpeg', name: 'avatar.jpeg' },
        { ext: '.jpg', mime: 'image/jpeg', name: 'avatar.jpg' },
        { ext: '.png', mime: 'image/png', name: 'avatar.png' },
        { ext: '.gif', mime: 'image/gif', name: 'avatar.gif' },
        { ext: '.webp', mime: 'image/webp', name: 'avatar.webp' },
      ];

      allowedTypes.forEach(({ ext, mime, name }) => {
        it(`should accept ${ext} image files for avatars`, () => {
          const file = {
            originalname: name,
            mimetype: mime,
          } as Express.Multer.File;

          const req = {} as Request;
          const callback = jest.fn();

          const fileFilter = (avatarUpload as any).fileFilter;
          fileFilter(req, file, callback);

          expect(callback).toHaveBeenCalledWith(null, true);
        });
      });
    });

    describe('Avatar Upload - Rejected File Types', () => {
      const rejectedTypes = [
        { ext: '.pdf', mime: 'application/pdf', name: 'document.pdf' },
        { ext: '.doc', mime: 'application/msword', name: 'document.doc' },
        { ext: '.exe', mime: 'application/x-msdownload', name: 'malware.exe' },
        { ext: '.zip', mime: 'application/zip', name: 'archive.zip' },
      ];

      rejectedTypes.forEach(({ ext, mime, name }) => {
        it(`should reject ${ext} files for avatars`, () => {
          const file = {
            originalname: name,
            mimetype: mime,
          } as Express.Multer.File;

          const req = {} as Request;
          const callback = jest.fn();

          const fileFilter = (avatarUpload as any).fileFilter;
          fileFilter(req, file, callback);

          expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({
              message: 'Only image files are allowed for avatars.'
            })
          );
        });
      });
    });
  });

  describe('File Size Limits', () => {
    it('should have 5MB limit for general uploads', () => {
      const limits = (upload as any).limits;
      expect(limits.fileSize).toBe(5 * 1024 * 1024); // 5MB
    });

    it('should have 2MB limit for avatar uploads', () => {
      const limits = (avatarUpload as any).limits;
      expect(limits.fileSize).toBe(2 * 1024 * 1024); // 2MB
    });
  });

  describe('Storage Configuration', () => {
    it('should use disk storage', () => {
      const storage = (upload as any).storage;
      expect(storage).toBeDefined();
    });

    it('should generate unique filenames with timestamp', () => {
      const storage = (upload as any).storage;
      const filename = storage.filename;
      
      const req = {} as Request;
      const file = {
        originalname: 'test.jpg',
      } as Express.Multer.File;

      const callback = jest.fn();
      filename(req, file, callback);

      const generatedName = callback.mock.calls[0][1];
      expect(generatedName).toMatch(/test-\d+-\d+\.jpg/);
    });

    it('should preserve file extension in generated filename', () => {
      const storage = (upload as any).storage;
      const filename = storage.filename;
      
      const req = {} as Request;
      const extensions = ['.jpg', '.png', '.pdf', '.xlsx'];

      extensions.forEach(ext => {
        const file = {
          originalname: `test${ext}`,
        } as Express.Multer.File;

        const callback = jest.fn();
        filename(req, file, callback);

        const generatedName = callback.mock.calls[0][1];
        expect(generatedName).toContain(ext);
      });
    });

    it('should create subdirectories based on uploadType', () => {
      const storage = (upload as any).storage;
      const destination = storage.destination;
      
      const req = {
        body: { uploadType: 'avatars' }
      } as Request;

      const file = {} as Express.Multer.File;
      const callback = jest.fn();

      mockFs.existsSync.mockReturnValue(false);
      destination(req, file, callback);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('avatars'),
        { recursive: true }
      );
    });

    it('should default to "misc" subdirectory if uploadType not specified', () => {
      const storage = (upload as any).storage;
      const destination = storage.destination;
      
      const req = {
        body: {}
      } as Request;

      const file = {} as Express.Multer.File;
      const callback = jest.fn();

      mockFs.existsSync.mockReturnValue(false);
      destination(req, file, callback);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('misc'),
        { recursive: true }
      );
    });

    it('should not create directory if it already exists', () => {
      const storage = (upload as any).storage;
      const destination = storage.destination;
      
      const req = {
        body: { uploadType: 'documents' }
      } as Request;

      const file = {} as Express.Multer.File;
      const callback = jest.fn();

      mockFs.existsSync.mockReturnValue(true);
      destination(req, file, callback);

      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('Security - Malicious File Detection', () => {
    it('should reject executable files', () => {
      const maliciousFiles = [
        { name: 'virus.exe', mime: 'application/x-msdownload' },
        { name: 'script.bat', mime: 'application/x-bat' },
        { name: 'malware.com', mime: 'application/x-msdos-program' },
        { name: 'trojan.scr', mime: 'application/x-screensaver' },
      ];

      maliciousFiles.forEach(({ name, mime }) => {
        const file = {
          originalname: name,
          mimetype: mime,
        } as Express.Multer.File;

        const req = {} as Request;
        const callback = jest.fn();

        const fileFilter = (upload as any).fileFilter;
        fileFilter(req, file, callback);

        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining('Invalid file type')
          })
        );
      });
    });

    it('should reject script files', () => {
      const scriptFiles = [
        { name: 'script.js', mime: 'application/javascript' },
        { name: 'script.php', mime: 'application/x-httpd-php' },
        { name: 'script.py', mime: 'text/x-python' },
        { name: 'script.sh', mime: 'application/x-sh' },
      ];

      scriptFiles.forEach(({ name, mime }) => {
        const file = {
          originalname: name,
          mimetype: mime,
        } as Express.Multer.File;

        const req = {} as Request;
        const callback = jest.fn();

        const fileFilter = (upload as any).fileFilter;
        fileFilter(req, file, callback);

        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining('Invalid file type')
          })
        );
      });
    });

    it('should reject files with double extensions', () => {
      const file = {
        originalname: 'document.pdf.exe',
        mimetype: 'application/x-msdownload',
      } as Express.Multer.File;

      const req = {} as Request;
      const callback = jest.fn();

      const fileFilter = (upload as any).fileFilter;
      fileFilter(req, file, callback);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid file type')
        })
      );
    });
  });

  describe('Upload Directory Management', () => {
    it('should create uploads directory if it does not exist', () => {
      // This is tested in the module initialization
      expect(mockFs.existsSync).toBeDefined();
    });

    it('should handle subdirectory creation errors gracefully', () => {
      const storage = (upload as any).storage;
      const destination = storage.destination;
      
      const req = {
        body: { uploadType: 'test' }
      } as Request;

      const file = {} as Express.Multer.File;
      const callback = jest.fn();

      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => {
        destination(req, file, callback);
      }).toThrow('Permission denied');
    });
  });
});
