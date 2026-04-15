import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Global Express error handler.
 * Must be registered LAST with app.use(errorHandler).
 */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Multer file size / type errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 5 MB.' });
  }
  if (err.message?.startsWith('File type not allowed')) {
    return res.status(415).json({ error: err.message });
  }

  // Log unexpected errors
  logger.error(`Unhandled error: ${err.message || err}`);

  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? 'Internal server error' : err.message;

  res.status(status).json({ error: message });
}
