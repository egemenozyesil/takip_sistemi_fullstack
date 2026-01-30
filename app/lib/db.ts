import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.join(process.cwd(), 'data', 'takip.db');

let db: Database.Database;

export function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initializeDb();
  }
  return db;
}

export function initializeDb() {
  const database = getDb();

  // Users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Students table
  database.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      student_number TEXT UNIQUE NOT NULL,
      department TEXT,
      phone TEXT,
      bio TEXT,
      avatar TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Attendance table
  database.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'present',
      FOREIGN KEY (student_id) REFERENCES students(id)
    )
  `);

  // Daily stats table
  database.exec(`
    CREATE TABLE IF NOT EXISTS daily_stats (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      date TEXT NOT NULL,
      topic_id TEXT,
      work_minutes INTEGER DEFAULT 0,
      questions_answered INTEGER DEFAULT 0,
      soru_tipleri TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (topic_id) REFERENCES topics(id)
    )
  `);
  
  // Migrate existing data if needed
  try {
    const tableInfo = database.prepare("PRAGMA table_info(daily_stats)").all() as any[];
    const hasWorkHours = tableInfo.some(col => col.name === 'work_hours');
    const hasWorkMinutes = tableInfo.some(col => col.name === 'work_minutes');
    const hasTopicId = tableInfo.some(col => col.name === 'topic_id');
    const hasNotes = tableInfo.some(col => col.name === 'notes');
    
    if (hasWorkHours && !hasWorkMinutes) {
      database.exec(`
        ALTER TABLE daily_stats ADD COLUMN work_minutes INTEGER DEFAULT 0;
        UPDATE daily_stats SET work_minutes = CAST(work_hours * 60 AS INTEGER) WHERE work_hours IS NOT NULL;
      `);
    }
    
    if (!hasTopicId) {
      database.exec(`ALTER TABLE daily_stats ADD COLUMN topic_id TEXT;`);
    }
    
    if (!tableInfo.some(col => col.name === 'soru_tipleri')) {
      database.exec(`ALTER TABLE daily_stats ADD COLUMN soru_tipleri TEXT;`);
    }
    
    if (!hasNotes) {
      database.exec(`ALTER TABLE daily_stats ADD COLUMN notes TEXT;`);
    }
    
    // Remove UNIQUE constraint if it exists
    // SQLite doesn't support DROP CONSTRAINT, so we need to recreate the table
    try {
      // Check if table exists and has UNIQUE constraint
      const tableInfo = database.prepare(`
        SELECT sql FROM sqlite_master 
        WHERE type='table' 
        AND name='daily_stats'
      `).get() as any;
      
      if (tableInfo && tableInfo.sql && tableInfo.sql.includes('UNIQUE(student_id, date)')) {
        // Table has UNIQUE constraint, we need to recreate it without the constraint
        // First, create a backup table with all data
        database.exec(`
          CREATE TABLE IF NOT EXISTS daily_stats_backup AS 
          SELECT * FROM daily_stats
        `);
        
        // Drop the old table (this will also drop all indexes)
        database.exec(`DROP TABLE IF EXISTS daily_stats`);
        
        // Recreate without UNIQUE constraint
        database.exec(`
          CREATE TABLE daily_stats (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL,
            date TEXT NOT NULL,
            topic_id TEXT,
            work_minutes INTEGER DEFAULT 0,
            questions_answered INTEGER DEFAULT 0,
            soru_tipleri TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (topic_id) REFERENCES topics(id)
          )
        `);
        
        // Copy data back from backup
        const backupData = database.prepare(`SELECT * FROM daily_stats_backup`).all() as any[];
        if (backupData.length > 0) {
          const insertStmt = database.prepare(`
            INSERT INTO daily_stats (id, student_id, date, topic_id, work_minutes, questions_answered, soru_tipleri, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          for (const row of backupData) {
            insertStmt.run(
              row.id,
              row.student_id,
              row.date,
              row.topic_id || null,
              row.work_minutes || 0,
              row.questions_answered || 0,
              row.soru_tipleri || null,
              row.notes || null,
              row.created_at || new Date().toISOString(),
              row.updated_at || new Date().toISOString()
            );
          }
        }
        
        // Drop backup table
        database.exec(`DROP TABLE IF EXISTS daily_stats_backup`);
      } else {
        // Try to drop any UNIQUE indexes that might exist
        const allIndexes = database.prepare(`
          SELECT name FROM sqlite_master 
          WHERE type='index' 
          AND tbl_name='daily_stats'
        `).all() as any[];
        
        for (const idx of allIndexes) {
          if (idx.name && (idx.name.startsWith('sqlite_autoindex_') || idx.name.includes('unique'))) {
            try {
              database.exec(`DROP INDEX IF EXISTS ${idx.name}`);
            } catch (e) {
              // Ignore errors
            }
          }
        }
      }
    } catch (e) {
      // Migration error - log but continue
      console.error('Error removing UNIQUE constraint:', e);
    }
  } catch (e) {
    // Migration already done or table doesn't exist yet
  }

  // Migrate topic_tracking data to daily_stats
  try {
    const topicTrackingExists = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='topic_tracking'").get() as any;
    
    if (topicTrackingExists) {
      // Check if migration already done by checking if there are any daily_stats records
      // that match topic_tracking records (same student_id, date, topic_id)
      const migrationCheck = database.prepare(`
        SELECT COUNT(*) as count FROM daily_stats ds
        INNER JOIN topic_tracking tt ON 
          ds.student_id = tt.student_id 
          AND ds.date = tt.study_date 
          AND ds.topic_id = tt.topic_id
      `).get() as any;
      
      // Only migrate if no matching data has been migrated yet
      if (migrationCheck.count === 0) {
        const topicTrackingData = database.prepare(`
          SELECT * FROM topic_tracking
        `).all() as any[];
        
        const insertDailyStats = database.prepare(`
          INSERT INTO daily_stats (id, student_id, date, topic_id, work_minutes, questions_answered, notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        for (const record of topicTrackingData) {
          const workMinutes = Math.round((record.study_hours || 0) * 60);
          const newId = uuidv4();
          try {
            insertDailyStats.run(
              newId,
              record.student_id,
              record.study_date,
              record.topic_id,
              workMinutes,
              record.questions_solved || 0,
              record.notes || null,
              record.created_at || new Date().toISOString()
            );
          } catch (err) {
            // Skip if duplicate or error
            console.error('Error migrating topic_tracking record:', err);
          }
        }
      }
    }
  } catch (e) {
    // Migration error - continue anyway
    console.error('Error migrating topic_tracking data:', e);
  }

  // Sessions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Lessons table
  database.exec(`
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Topics table
  database.exec(`
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL,
      unit TEXT,
      topic TEXT NOT NULL,
      meb_kazanim TEXT,
      alt_kazanimlar TEXT,
      soru_tipleri TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    )
  `);

  // Book reading table
  database.exec(`
    CREATE TABLE IF NOT EXISTS book_reading (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      book_title TEXT NOT NULL,
      pages_read INTEGER DEFAULT 0,
      reading_date TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id)
    )
  `);

  // Going out table
  database.exec(`
    CREATE TABLE IF NOT EXISTS going_out (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      out_date TEXT NOT NULL,
      duration_hours REAL DEFAULT 0,
      purpose TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id)
    )
  `);

  // Game sessions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      game_name TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 0,
      play_date TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id)
    )
  `);

}

export default getDb;
