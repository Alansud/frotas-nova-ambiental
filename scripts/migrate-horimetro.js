const Database = require('better-sqlite3');
const db = new Database('./prisma/dev.db');
try {
  db.exec("ALTER TABLE Veiculo ADD COLUMN tipoMedicao TEXT DEFAULT 'km'");
  console.log('Migration OK: coluna tipoMedicao adicionada');
} catch(e) {
  if (e.message.includes('duplicate column')) {
    console.log('Coluna tipoMedicao ja existe, pulando');
  } else {
    throw e;
  }
} finally {
  db.close();
}
