const fs = require('fs');
const mysql = require('mysql2/promise');

async function main() {
  const host = process.env.DB_HOST || 'srv658.hstgr.io';
  const user = process.env.DB_USER || 'u460080312_miiccof_user';
  const password = process.env.DB_PASS || '';
  const database = process.env.DB_NAME || 'u460080312_miiccof_db';
  const sqlFile = process.env.SQL_FILE || 'hostinger-data-import.sql';

  if (!password) {
    console.error('Set DB_PASS environment variable');
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host,
    port: 3306,
    user,
    password,
    database,
    multipleStatements: true,
    ssl: { rejectUnauthorized: false },
  });

  const sql = fs.readFileSync(sqlFile, 'utf8').replace(/^\uFEFF/, '');
  console.log('Connecting to', host, '...');
  await connection.query(sql);
  console.log('Import completed successfully.');
  await connection.end();
}

main().catch((err) => {
  console.error('Import failed:', err.message);
  process.exit(1);
});
