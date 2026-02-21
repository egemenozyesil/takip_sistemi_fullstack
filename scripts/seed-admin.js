/**
 * Varsayılan admin kullanıcısını veritabanına ekler.
 * better-sqlite3 / bcrypt kullanmaz; Node sürümünden etkilenmez.
 *
 * Kullanım: node scripts/seed-admin.js
 * Ortam değişkenleri (isteğe bağlı):
 *   ADMIN_EMAIL=admin@example.com
 *   ADMIN_PASSWORD=admin123
 *   ADMIN_NAME=Admin
 */

const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'data', 'takip.db');

const DEFAULT_EMAIL = 'amean.hesaplar@gmail.com';
const DEFAULT_PASSWORD = 'Amean1415';
const DEFAULT_NAME = 'Emin Kartcı';

async function main() {
  const email = process.env.ADMIN_EMAIL || DEFAULT_EMAIL;
  const password = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
  const name = process.env.ADMIN_NAME || DEFAULT_NAME;

  if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    console.error('Veritabanı bulunamadı:', dbPath);
    console.error('Önce uygulamayı en az bir kez çalıştırıp veritabanının oluşmasını sağlayın (örn. npm run dev).');
    process.exit(1);
  }

  const bcryptjs = require('bcryptjs');
  const { v4: uuidv4 } = require('uuid');
  const initSqlJs = require('sql.js');
  const wasmPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  const SQL = await initSqlJs({ locateFile: () => wasmPath });
  const fileBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const selectStmt = db.prepare('SELECT id, role FROM users WHERE email = ?');
  selectStmt.bind([email]);
  let existing = null;
  if (selectStmt.step()) {
    const row = selectStmt.getAsObject();
    existing = { id: row.id, role: row.role };
  }
  selectStmt.free();

  if (existing) {
    if (existing.role === 'admin') {
      console.log('Bu email zaten admin olarak kayıtlı:', email);
      db.close();
      process.exit(0);
      return;
    }
    db.run('UPDATE users SET role = ? WHERE email = ?', ['admin', email]);
    console.log('Mevcut kullanıcı admin yapıldı:', email);
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
    db.close();
    process.exit(0);
    return;
  }

  const userId = uuidv4();
  const hashedPassword = await bcryptjs.hash(password, 10);
  db.run(
    'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
    [userId, email, hashedPassword, name, 'admin']
  );

  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  db.close();

  console.log('Varsayılan admin oluşturuldu.');
  console.log('  Email:', email);
  console.log('  Şifre:', password);
  console.log('  Ad:', name);
  console.log('\nİlk girişten sonra şifreyi değiştirmeniz önerilir.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
