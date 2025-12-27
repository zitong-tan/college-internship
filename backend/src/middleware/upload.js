/**
 * File Upload Middleware
 * Handles file uploads for internship files
 */

const fs = require('fs').promises;
const path = require('path');
const { errorResponse } = require('../utils/response');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

/**
 * Simple file upload middleware without external dependencies
 * Parses multipart/form-data and saves files
 */
const uploadFile = (fieldName = 'file') => {
  return async (req, res, next) => {
    try {
      const contentType = req.headers['content-type'] || '';
      
      if (!contentType.includes('multipart/form-data')) {
        return next();
      }

      // Extract boundary from content-type
      const boundaryMatch = contentType.match(/boundary=(.+)$/);
      if (!boundaryMatch) {
        return errorResponse(res, 'VALIDATION_ERROR', '无效的请求格式', 400);
      }

      const boundary = '--' + boundaryMatch[1];
      const chunks = [];

      // Collect data chunks
      req.on('data', chunk => chunks.push(chunk));

      req.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const parts = buffer.toString('binary').split(boundary);

          for (const part of parts) {
            if (part.includes(`name="${fieldName}"`)) {
              // Extract filename
              const filenameMatch = part.match(/filename="(.+?)"/);
              if (!filenameMatch) continue;

              const originalname = filenameMatch[1];
              
              // Extract content type
              const contentTypeMatch = part.match(/Content-Type: (.+?)\r\n/);
              const mimetype = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';

              // Extract file data (after double CRLF)
              const dataStart = part.indexOf('\r\n\r\n') + 4;
              const dataEnd = part.lastIndexOf('\r\n');
              
              if (dataStart < 4 || dataEnd < 0) continue;

              const fileData = Buffer.from(part.substring(dataStart, dataEnd), 'binary');

              // Generate unique filename
              const timestamp = Date.now();
              const ext = path.extname(originalname);
              const filename = `${timestamp}-${Math.random().toString(36).substring(7)}${ext}`;
              const filepath = path.join(uploadsDir, filename);

              // Save file
              await fs.writeFile(filepath, fileData);

              // Attach file info to request
              req.file = {
                fieldname: fieldName,
                originalname: originalname,
                filename: filename,
                path: filepath,
                mimetype: mimetype,
                size: fileData.length
              };

              break;
            }
          }

          next();
        } catch (error) {
          console.error('File upload error:', error);
          return errorResponse(res, 'INTERNAL_ERROR', '文件上传失败', 500);
        }
      });

      req.on('error', (error) => {
        console.error('Request error:', error);
        return errorResponse(res, 'INTERNAL_ERROR', '请求处理失败', 500);
      });

    } catch (error) {
      console.error('Upload middleware error:', error);
      next(error);
    }
  };
};

module.exports = { uploadFile };
