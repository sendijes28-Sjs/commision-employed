import { Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import db from '../db.js';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function hashFiles(filePaths: string[]): string {
  const hash = crypto.createHash('md5');
  for (const fp of filePaths) {
    hash.update(fs.readFileSync(fp));
  }
  return hash.digest('hex');
}

export const scanInvoice = async (req: any, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const filePaths = files.map(f => f.path);
  const cleanupFiles = () => filePaths.forEach(fp => { 
    try { if (fs.existsSync(fp)) fs.unlinkSync(fp); } catch {} 
  });

  let fileHash: string;
  try {
    fileHash = hashFiles(filePaths);
  } catch (e) {
    cleanupFiles();
    return res.status(500).json({ error: 'Failed to hash uploaded files' });
  }

  const cached = await db('ocr_cache').where({ file_hash: fileHash }).first();

  if (cached) {
    await db('ocr_cache').where({ file_hash: fileHash }).increment('hit_count', 1);
    cleanupFiles();
    logger.info(`[CACHE HIT] Hash: ${fileHash.substring(0, 12)}...`);
    return res.json(JSON.parse(cached.result_json));
  }

  logger.info(`[CACHE MISS] Hash: ${fileHash.substring(0, 12)}... — calling AI`);

  const pythonProcess = spawn('python', [
    path.join(__dirname, '../parser.py'),
    ...filePaths
  ], {
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
  });

  let resultData = '';
  let errorData = '';

  pythonProcess.stdout.on('data', (data) => { resultData += data.toString(); });
  pythonProcess.stderr.on('data', (data) => { errorData += data.toString(); });

  pythonProcess.on('error', (err) => {
    cleanupFiles();
    if (!res.headersSent) res.status(500).json({ error: 'Failed to start OCR subprocess' });
  });

  pythonProcess.on('close', async (code) => {
    cleanupFiles();
    if (res.headersSent) return;
    
    if (code !== 0) {
      logger.error(`Python OCR failed: ${errorData}`);
      return res.status(500).json({ error: 'OCR processing failed' });
    }

    try {
      if (!resultData) throw new Error('No data received from OCR parser');
      const data = JSON.parse(resultData);

      if (!data.error) {
        try {
          await db('ocr_cache').insert({ file_hash: fileHash, result_json: resultData }).onConflict('file_hash').merge();
        } catch (cacheErr) {
          logger.error(`[CACHE ERROR] Failed to store: ${cacheErr}`);
        }
      }
      res.json(data);
    } catch (e) {
      logger.error(`Failed to parse Python output: ${resultData.substring(0, 200)}`);
      res.status(500).json({ error: 'Invalid response from OCR parser' });
    }
  });
};

/**
 * BUG-5 FIX: Use Knex query builder for database-agnostic date comparison
 * instead of raw SQL that differs between SQLite and PostgreSQL.
 */
export const cleanupOcrCache = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deleted = await db('ocr_cache')
      .where('created_at', '<', thirtyDaysAgo.toISOString())
      .del();

    if (deleted > 0) {
      logger.info(`[CACHE] Cleaned ${deleted} expired entries`);
    }
  } catch (e) { /* ignore */ }
};
