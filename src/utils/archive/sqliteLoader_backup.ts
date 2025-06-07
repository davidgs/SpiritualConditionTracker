// This is a backup with the correct pattern for sqlite.execute()
// The key fix is that Capacitor SQLite requires VALUES embedded in the SQL statement
// NOT passed as a separate values array

// BROKEN PATTERN (what was causing null values):
// await sqlite.execute({
//   database: DB_NAME,
//   statements: 'INSERT INTO activities (type, date) VALUES (?, ?)',
//   values: ['prayer', '2025-05-31'] // This gets ignored!
// });

// CORRECT PATTERN (what fixes the issue):
// const sql = `INSERT INTO activities (type, date) VALUES ('prayer', '2025-05-31');`;
// await sqlite.execute({
//   database: DB_NAME,
//   statements: sql
// });

// All sqlite.execute() calls in sqliteLoader.ts need to be checked and fixed to use the correct pattern