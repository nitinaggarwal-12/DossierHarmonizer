import { DatabaseSync } from 'node:sqlite';

export interface DBInterface {
  query(sql: string, params?: any[]): Promise<any[]>;
  close(): Promise<void>;
}

class SQLiteDB implements DBInterface {
  private db: DatabaseSync;

  constructor() {
    this.db = new DatabaseSync('dossier_workspace.db');
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    // Convert PostgreSQL parameter placeholders ($1, $2, etc) to SQLite (? or placeholders)
    let sqliteSql = sql;
    const cleanParams = [...params];
    
    // Replace $1 with ?
    sqliteSql = sqliteSql.replace(/\$\d+/g, '?');

    // SQLite executes prepared statements
    const stmt = this.db.prepare(sqliteSql);
    
    if (sqliteSql.trim().toUpperCase().startsWith('SELECT')) {
      return stmt.all(...cleanParams);
    } else {
      const result = stmt.run(...cleanParams);
      return [result];
    }
  }

  async close() {
    // node:sqlite doesn't have a close method on DatabaseSync in standard API yet, it closes on process exit
  }
}

class PostgresDB implements DBInterface {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    const res = await this.client.query(sql, params);
    return res.rows;
  }

  async close() {
    await this.client.end();
  }
}

let dbInstance: DBInterface | null = null;
let isPostgres = false;

export async function getDB(): Promise<DBInterface> {
  if (dbInstance) return dbInstance;

  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    try {
      console.log('DATABASE_URL detected. Attempting to initialize PostgreSQL client...');
      // @ts-ignore
      const { default: pg } = await import('pg');
      const client = new pg.Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false } // Needed for Railway production SSL connections
      });
      await client.connect();
      dbInstance = new PostgresDB(client);
      isPostgres = true;
      console.log('PostgreSQL client initialized and connected successfully.');
      return dbInstance;
    } catch (err) {
      console.warn('Failed to load or connect via pg, falling back to local SQLite.', err);
    }
  }

  console.log('Initializing local SQLite database...');
  dbInstance = new SQLiteDB();
  isPostgres = false;
  return dbInstance;
}

export async function initializeDatabase() {
  const db = await getDB();
  
  // Standard SQL structure compatible with both SQLite and PostgreSQL
  const idType = isPostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS dossiers (
      id TEXT PRIMARY KEY,
      drug_name TEXT NOT NULL,
      dossier_type TEXT NOT NULL,
      source_authority TEXT NOT NULL,
      target_authorities TEXT NOT NULL, -- comma separated list
      status TEXT NOT NULL,
      read_only BOOLEAN DEFAULT FALSE
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY,
      dossier_id TEXT NOT NULL,
      section_code TEXT,
      title TEXT,
      content TEXT,
      status TEXT,
      order_index INTEGER DEFAULT 0
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS gaps (
      id TEXT PRIMARY KEY,
      section_id TEXT NOT NULL,
      severity TEXT NOT NULL,
      category TEXT NOT NULL,
      section TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      guideline_citation TEXT,
      suggestion TEXT,
      status TEXT DEFAULT 'pending'
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id ${idType},
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_id TEXT NOT NULL,
      action_type TEXT NOT NULL,
      section_code TEXT,
      before_value TEXT,
      after_value TEXT
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS api_cache (
      hash TEXT PRIMARY KEY,
      response_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default data if dossiers table is empty
  const dossiersCount = await db.query('SELECT COUNT(*) as count FROM dossiers');
  const count = parseInt(dossiersCount[0].count || dossiersCount[0].COUNT || '0', 10);
  
  if (count === 0) {
    console.log('Seeding database with default dossiers data...');
    // Seed Dossiers
    await db.query(`
      INSERT INTO dossiers (id, drug_name, dossier_type, source_authority, target_authorities, status, read_only)
      VALUES 
      ('dossier-adalimumab', 'Adalimumab Monoclonal Antibody', 'Biologic', 'EMA', 'FDA,PMDA', 'in_progress', false),
      ('dossier-sitagliptin', 'Sitagliptin Januvia', 'Small Molecule', 'FDA', 'EMA,PMDA,CDSCO', 'aligned', false)
    `);

    // Seed Sections for Adalimumab
    await db.query(`
      INSERT INTO sections (id, dossier_id, section_code, title, content, status, order_index)
      VALUES 
      ('M1-spec', 'dossier-adalimumab', '1.3.1', 'Product Labeling Specs', '### 1.3.1 Summary of Product Characteristics (SmPC) \n\n**Name of the Medicinal Product:** Adalimumab 40mg injection. \n\n**Qualitative and Quantitative Composition:** Each pre-filled syringe contains 40mg of active substance. \n\n**Undesirable Effects:** Very common (>=1/10) undesirable effects include injection site reactions and upper respiratory tract infections. Minor undesirable effects include mild diarrhoea.', 'in_progress', 0),
      ('M3-stability', 'dossier-adalimumab', '3.2.S.7.1', 'Stability testing protocols', '### 3.2.S.7.1 Stability Summary\n\nStability testing conducted under long-term conditions at 25 °C ± 2 °C / 60% RH ± 5% RH, and accelerated conditions at 40 °C ± 2 °C / 75% RH ± 5% RH for three commercial production batches.\n\nPhotostability studies performed matching standard requirements.', 'in_progress', 1)
    `);

    // Seed Gaps for Adalimumab Product Labeling Specs
    await db.query(`
      INSERT INTO gaps (id, section_id, severity, category, section, title, description, guideline_citation, suggestion, status)
      VALUES 
      ('gap-1', 'M1-spec', 'critical', 'Terminology', '1.3.1', 'Terminology and Labeling Standard Discrepancy (SmPC vs USPI)', 'The dossier uses European EMA nomenclature and SmPC structural headers. FDA expects a US Prescribing Information (USPI) layout following 21 CFR 201.57, using terms like "drug substance" and US-style adverse reaction grouping.', '21 CFR 201.56 & 21 CFR 201.57', 'Convert the layout to USPI standards, update spelling to US English (color, theater, etc.), and rename "Active Substance" to "Drug Substance / Active Ingredient".', 'pending'),
      ('gap-2', 'M3-stability', 'warning', 'Specification', '3.2.S.7.1', 'Photostability Reference Details Missing', 'The stability section refers to general photostability studies but does not explicitly cite the ICH Q1B light source options or lux-hour values.', 'ICH Q1B Photostability Guidelines', 'Provide detailed lux-hours (minimum 1.2 million) and UV watt-hours (minimum 200) settings.', 'pending')
    `);
  }
}
