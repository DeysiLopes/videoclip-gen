/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'app.sqlite');

// Criar diretório se não existir
mkdirSync(DATA_DIR, { recursive: true });

// Criar DB
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

export function initDatabase() {
  // Tabela de jobs
  db.exec(`
    CREATE TABLE IF NOT EXISTS render_jobs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      progress INTEGER DEFAULT 0,
      output_path TEXT,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      started_at DATETIME,
      completed_at DATETIME
    )
  `);

  console.log('✅ Database initialized at:', DB_PATH);
}

export function createJob(jobId: string, projectId: string) {
  const stmt = db.prepare(`
    INSERT INTO render_jobs (id, project_id, status)
    VALUES (?, ?, 'queued')
  `);
  stmt.run(jobId, projectId);
}

export function getJob(jobId: string) {
  const stmt = db.prepare(`
    SELECT * FROM render_jobs WHERE id = ?
  `);
  return stmt.get(jobId) as any;
}

export function updateJobStatus(
  jobId: string,
  status: string,
  progress?: number,
  error?: string
) {
  const stmt = db.prepare(`
    UPDATE render_jobs
    SET status = ?, progress = ?, error_message = ?, started_at = COALESCE(started_at, CURRENT_TIMESTAMP)
    WHERE id = ?
  `);
  stmt.run(status, progress ?? 0, error ?? null, jobId);
}

export function completeJob(jobId: string, outputPath: string) {
  const stmt = db.prepare(`
    UPDATE render_jobs
    SET status = 'completed', progress = 100, output_path = ?, completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(outputPath, jobId);
}

export function failJob(jobId: string, error: string) {
  const stmt = db.prepare(`
    UPDATE render_jobs
    SET status = 'failed', error_message = ?, completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(error, jobId);
}


