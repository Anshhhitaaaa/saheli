import http from 'node:http';
import fs from 'node:fs';
import pg from 'pg';
import { runLangGraphRAGAgent } from './server/langgraph_agent.js';

// Load .env variables if present
if (fs.existsSync('.env')) {
  if (typeof process.loadEnvFile === 'function') {
    try { process.loadEnvFile(); } catch (e) {}
  } else {
    const envContent = fs.readFileSync('.env', 'utf-8');
    envContent.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = (match[2] || '').trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
}

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/saheli';
const PORT = process.env.PORT || 5000;

let pool;

async function initDB() {
  try {
    const isSSL = DATABASE_URL.includes('sslmode=require') || 
                  DATABASE_URL.includes('render.com') || 
                  DATABASE_URL.includes('supabase.co') || 
                  DATABASE_URL.includes('neon.tech') || 
                  DATABASE_URL.includes('railway.app') || 
                  process.env.NODE_ENV === 'production';
    pool = new pg.Pool({
      connectionString: DATABASE_URL,
      ssl: isSSL ? { rejectUnauthorized: false } : false
    });

    const client = await pool.connect();
    client.release();
    console.log(' Successfully connected to PostgreSQL database');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        focus TEXT DEFAULT 'general',
        pregnancy_mode BOOLEAN DEFAULT FALSE,
        pregnancy_week INTEGER,
        last_period_start TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cycle_logs (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        date VARCHAR(20) NOT NULL,
        flow TEXT,
        note TEXT,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (email, date)
      );

      CREATE TABLE IF NOT EXISTS symptom_logs (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        date VARCHAR(20) NOT NULL,
        symptoms JSONB DEFAULT '[]',
        notes TEXT,
        mood TEXT,
        severity TEXT,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (email, date)
      );

      CREATE TABLE IF NOT EXISTS medications (
        id VARCHAR(64) PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT,
        dose TEXT,
        schedule TEXT,
        active BOOLEAN DEFAULT TRUE,
        started_at TEXT,
        notes TEXT,
        taken_dates JSONB DEFAULT '[]'
      );

      CREATE TABLE IF NOT EXISTS assistant_chats (
        id SERIAL PRIMARY KEY,
        email TEXT,
        conversation_id VARCHAR(64),
        user_message TEXT,
        bot_response TEXT,
        sources JSONB,
        safety_flag BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS community_posts (
        id VARCHAR(64) PRIMARY KEY,
        topic TEXT,
        author TEXT,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        replies JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS share_links (
        id VARCHAR(64) PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT,
        relationship TEXT,
        permissions JSONB,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_notifications (
        id VARCHAR(64) PRIMARY KEY,
        email TEXT NOT NULL,
        category TEXT,
        title TEXT,
        message TEXT,
        discreet_message TEXT,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notification_preferences (
        email VARCHAR(255) PRIMARY KEY,
        discreet_mode BOOLEAN DEFAULT TRUE,
        categories JSONB,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await seedInitialData();
  } catch (err) {
    console.error(' PostgreSQL Connection Error:', err.message);
    console.log(' Make sure PostgreSQL is running or configure DATABASE_URL in your .env file.');
  }
}

async function seedInitialData() {
  if (!pool) return;
  try {
    const res = await pool.query('SELECT COUNT(*) FROM community_posts');
    const count = parseInt(res.rows[0].count, 10);
    if (count === 0) {
      await pool.query(`
        INSERT INTO community_posts (id, topic, author, title, body, replies, created_at)
        VALUES 
        ($1, $2, $3, $4, $5, $6, NOW()),
        ($7, $8, $9, $10, $11, $12, NOW())
      `, [
        'p1', 'pcos', 'lotus_42', 
        'Anyone else with long cycles that finally regularized?',
        'My cycles were 40+ days for years. After a year of small changes (mostly walking and protein), they have crept down to 34 days. Curious what helped others.',
        JSON.stringify([
          { id: 'r1', author: 'mango_tree', body: 'Consistent sleep made the biggest difference for me.' },
          { id: 'r2', author: 'river_stone', body: 'Took me almost two years. Be patient with yourself.' }
        ]),
        'p2', 'pregnancy', 'soft_rain',
        'First trimester fatigue — when did it ease for you?',
        'Week 9 and I could sleep standing up. Hearing from people who have been through it would help.',
        JSON.stringify([
          { id: 'r3', author: 'amber_light', body: 'Started lifting around week 12 for me. You are almost there.' }
        ])
      ]);
      console.log(' Seeded initial community discussions into PostgreSQL');
    }
  } catch (err) {
    console.error(' Error seeding PostgreSQL initial data:', err.message);
  }
}

// Entity Mappers
function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    focus: row.focus,
    pregnancyMode: row.pregnancy_mode,
    pregnancyWeek: row.pregnancy_week,
    lastPeriodStart: row.last_period_start,
    createdAt: row.created_at
  };
}

function mapCycleLog(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    date: row.date,
    flow: row.flow,
    note: row.note,
    updatedAt: row.updated_at
  };
}

function mapSymptomLog(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    date: row.date,
    symptoms: typeof row.symptoms === 'string' ? JSON.parse(row.symptoms) : (row.symptoms || []),
    notes: row.notes,
    mood: row.mood,
    severity: row.severity,
    updatedAt: row.updated_at
  };
}

function mapMedication(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    type: row.type,
    dose: row.dose,
    schedule: row.schedule,
    active: row.active,
    startedAt: row.started_at,
    notes: row.notes,
    takenDates: typeof row.taken_dates === 'string' ? JSON.parse(row.taken_dates) : (row.taken_dates || [])
  };
}

function mapCommunityPost(row) {
  if (!row) return null;
  return {
    id: row.id,
    topic: row.topic,
    author: row.author,
    title: row.title,
    body: row.body,
    replies: typeof row.replies === 'string' ? JSON.parse(row.replies) : (row.replies || []),
    createdAt: row.created_at
  };
}

function mapShareLink(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    relationship: row.relationship,
    permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : (row.permissions || {}),
    active: row.active,
    createdAt: row.created_at
  };
}

function mapNotification(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    category: row.category,
    title: row.title,
    message: row.message,
    discreetMessage: row.discreet_message,
    read: row.read,
    createdAt: row.created_at
  };
}

function mapNotificationPreference(row) {
  if (!row) return null;
  return {
    email: row.email,
    discreetMode: row.discreet_mode,
    categories: typeof row.categories === 'string' ? JSON.parse(row.categories) : (row.categories || {}),
    updatedAt: row.updated_at
  };
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (!pool) {
    return sendJSON(res, 503, { error: 'Database initializing or connection failed. Please ensure PostgreSQL is running and check DATABASE_URL.' });
  }

  try {
    // --- AUTH ROUTES ---
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (pathname === '/api/auth/signup' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { name, email, password, focus = 'general' } = body;
      const cleanEmail = (email || '').toLowerCase().trim();

      if (!name || !name.trim()) {
        return sendJSON(res, 400, { error: 'Please enter your name.' });
      }
      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        return sendJSON(res, 400, { error: 'Please enter a valid email address.' });
      }
      if (!password || password.length < 6) {
        return sendJSON(res, 400, { error: 'Password must be at least 6 characters.' });
      }

      const existing = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
      if (existing.rows.length > 0) {
        return sendJSON(res, 400, { error: 'An account with this email address already exists. Please log in.' });
      }

      const newUser = {
        id: 'u_' + Date.now(),
        name: name.trim(),
        email: cleanEmail,
        password,
        focus,
        pregnancyMode: focus === 'pregnancy',
        pregnancyWeek: focus === 'pregnancy' ? 8 : null,
        createdAt: new Date().toISOString(),
      };

      await pool.query(
        `INSERT INTO users (id, name, email, password, focus, pregnancy_mode, pregnancy_week, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [newUser.id, newUser.name, newUser.email, newUser.password, newUser.focus, newUser.pregnancyMode, newUser.pregnancyWeek, newUser.createdAt]
      );

      delete newUser.password;
      return sendJSON(res, 201, { user: newUser, token: 'token_' + newUser.id });
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { email, password } = body;
      const cleanEmail = (email || '').toLowerCase().trim();

      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        return sendJSON(res, 400, { error: 'Please enter a valid email address.' });
      }

      const result = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
      if (result.rows.length === 0) {
        return sendJSON(res, 400, { error: 'No account found with this email address. Please sign up.' });
      }
      const userRow = result.rows[0];
      if (userRow.password && password && userRow.password !== password) {
        return sendJSON(res, 400, { error: 'Incorrect password. Please try again.' });
      }

      const user = mapUser(userRow);
      delete user.password;
      return sendJSON(res, 200, { user, token: 'token_' + user.id });
    }

    if (pathname === '/api/auth/update' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { email, patch } = body;
      const cleanEmail = (email || '').toLowerCase().trim();

      if (!cleanEmail) return sendJSON(res, 400, { error: 'Email is required' });

      const setClause = [];
      const values = [cleanEmail];
      let idx = 2;
      const fieldMapping = {
        name: 'name',
        focus: 'focus',
        pregnancyMode: 'pregnancy_mode',
        pregnancyWeek: 'pregnancy_week',
        lastPeriodStart: 'last_period_start',
        password: 'password'
      };

      if (patch && typeof patch === 'object') {
        for (const [key, val] of Object.entries(patch)) {
          const dbCol = fieldMapping[key] || key;
          setClause.push(`${dbCol} = $${idx++}`);
          values.push(val);
        }
      }

      if (setClause.length > 0) {
        await pool.query(`UPDATE users SET ${setClause.join(', ')} WHERE email = $1`, values);
      }
      const updatedRes = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
      const updatedUser = updatedRes.rows.length > 0 ? mapUser(updatedRes.rows[0]) : null;
      if (updatedUser) delete updatedUser.password;
      return sendJSON(res, 200, { user: updatedUser });
    }

    // --- CYCLE LOGS ---
    if (pathname === '/api/cycle' && req.method === 'GET') {
      const email = url.searchParams.get('email');
      if (!email) return sendJSON(res, 400, { error: 'Email parameter required' });
      const cleanEmail = email.toLowerCase().trim();
      const resLogs = await pool.query('SELECT * FROM cycle_logs WHERE email = $1 ORDER BY date DESC', [cleanEmail]);
      return sendJSON(res, 200, { logs: resLogs.rows.map(mapCycleLog) });
    }

    if (pathname === '/api/cycle' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { email, date, flow, note } = body;
      if (!email || !date) return sendJSON(res, 400, { error: 'Email and date required' });
      const cleanEmail = email.toLowerCase().trim();

      await pool.query(`
        INSERT INTO cycle_logs (email, date, flow, note, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (email, date)
        DO UPDATE SET flow = EXCLUDED.flow, note = EXCLUDED.note, updated_at = NOW()
      `, [cleanEmail, date, flow, note]);

      if (flow && flow !== 'none') {
        await pool.query('UPDATE users SET last_period_start = $1 WHERE email = $2', [date, cleanEmail]).catch(() => {});
      }
      const updated = await pool.query('SELECT * FROM cycle_logs WHERE email = $1 ORDER BY date DESC', [cleanEmail]);
      return sendJSON(res, 200, { logs: updated.rows.map(mapCycleLog) });
    }

    if (pathname === '/api/cycle' && req.method === 'DELETE') {
      const email = url.searchParams.get('email');
      const date = url.searchParams.get('date');
      if (!email || !date) return sendJSON(res, 400, { error: 'Email and date required' });
      const cleanEmail = email.toLowerCase().trim();

      await pool.query('DELETE FROM cycle_logs WHERE email = $1 AND date = $2', [cleanEmail, date]);
      const updated = await pool.query('SELECT * FROM cycle_logs WHERE email = $1 ORDER BY date DESC', [cleanEmail]);
      return sendJSON(res, 200, { logs: updated.rows.map(mapCycleLog) });
    }

    // --- SYMPTOMS ---
    if (pathname === '/api/symptoms' && req.method === 'GET') {
      const email = url.searchParams.get('email');
      if (!email) return sendJSON(res, 400, { error: 'Email required' });
      const cleanEmail = email.toLowerCase().trim();
      const resLogs = await pool.query('SELECT * FROM symptom_logs WHERE email = $1 ORDER BY date DESC', [cleanEmail]);
      return sendJSON(res, 200, { logs: resLogs.rows.map(mapSymptomLog) });
    }

    if (pathname === '/api/symptoms' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { email, date, symptoms, notes, mood, severity } = body;
      if (!email || !date) return sendJSON(res, 400, { error: 'Email and date required' });
      const cleanEmail = email.toLowerCase().trim();

      await pool.query(`
        INSERT INTO symptom_logs (email, date, symptoms, notes, mood, severity, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (email, date)
        DO UPDATE SET symptoms = EXCLUDED.symptoms, notes = EXCLUDED.notes, mood = EXCLUDED.mood, severity = EXCLUDED.severity, updated_at = NOW()
      `, [cleanEmail, date, JSON.stringify(symptoms || []), notes, mood, severity]);

      const updated = await pool.query('SELECT * FROM symptom_logs WHERE email = $1 ORDER BY date DESC', [cleanEmail]);
      return sendJSON(res, 200, { logs: updated.rows.map(mapSymptomLog) });
    }

    if (pathname === '/api/symptoms' && req.method === 'DELETE') {
      const email = url.searchParams.get('email');
      const date = url.searchParams.get('date');
      if (!email || !date) return sendJSON(res, 400, { error: 'Email and date required' });
      const cleanEmail = email.toLowerCase().trim();

      await pool.query('DELETE FROM symptom_logs WHERE email = $1 AND date = $2', [cleanEmail, date]);
      const updated = await pool.query('SELECT * FROM symptom_logs WHERE email = $1 ORDER BY date DESC', [cleanEmail]);
      return sendJSON(res, 200, { logs: updated.rows.map(mapSymptomLog) });
    }

    // --- MEDICATIONS ---
    if (pathname === '/api/medications' && req.method === 'GET') {
      const email = url.searchParams.get('email');
      if (!email) return sendJSON(res, 400, { error: 'Email required' });
      const cleanEmail = email.toLowerCase().trim();
      const resMeds = await pool.query('SELECT * FROM medications WHERE email = $1', [cleanEmail]);
      return sendJSON(res, 200, { meds: resMeds.rows.map(mapMedication) });
    }

    if (pathname === '/api/medications' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { email, name, type, dose, schedule, notes } = body;
      if (!email || !name) return sendJSON(res, 400, { error: 'Email and medication name required' });
      const cleanEmail = email.toLowerCase().trim();

      const newMed = {
        id: 'm_' + Date.now(),
        email: cleanEmail,
        name,
        type: type || 'supplement',
        dose: dose || '',
        schedule: schedule || 'Daily',
        active: true,
        startedAt: new Date().toISOString().slice(0, 10),
        notes: notes || '',
        takenDates: []
      };

      await pool.query(`
        INSERT INTO medications (id, email, name, type, dose, schedule, active, started_at, notes, taken_dates)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [newMed.id, newMed.email, newMed.name, newMed.type, newMed.dose, newMed.schedule, newMed.active, newMed.startedAt, newMed.notes, JSON.stringify(newMed.takenDates)]);

      const updated = await pool.query('SELECT * FROM medications WHERE email = $1', [cleanEmail]);
      return sendJSON(res, 201, { meds: updated.rows.map(mapMedication) });
    }

    if (pathname.startsWith('/api/medications/') && req.method === 'PATCH') {
      const id = pathname.replace('/api/medications/', '');
      const body = await parseJSONBody(req);
      const { email, patch } = body;
      if (!email) return sendJSON(res, 400, { error: 'Email required' });
      const cleanEmail = email.toLowerCase().trim();

      const setClause = [];
      const values = [id, cleanEmail];
      let idx = 3;
      const fieldMap = {
        name: 'name',
        type: 'type',
        dose: 'dose',
        schedule: 'schedule',
        active: 'active',
        startedAt: 'started_at',
        notes: 'notes',
        takenDates: 'taken_dates'
      };

      if (patch && typeof patch === 'object') {
        for (const [key, val] of Object.entries(patch)) {
          const dbCol = fieldMap[key] || key;
          setClause.push(`${dbCol} = $${idx++}`);
          values.push(dbCol === 'taken_dates' ? JSON.stringify(val) : val);
        }
      }

      if (setClause.length > 0) {
        await pool.query(`UPDATE medications SET ${setClause.join(', ')} WHERE id = $1 AND email = $2`, values);
      }

      const updated = await pool.query('SELECT * FROM medications WHERE email = $1', [cleanEmail]);
      return sendJSON(res, 200, { meds: updated.rows.map(mapMedication) });
    }

    if (pathname.startsWith('/api/medications/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/medications/', '');
      const email = url.searchParams.get('email');
      if (!email) return sendJSON(res, 400, { error: 'Email required' });
      const cleanEmail = email.toLowerCase().trim();

      await pool.query('DELETE FROM medications WHERE id = $1 AND email = $2', [id, cleanEmail]);
      const updated = await pool.query('SELECT * FROM medications WHERE email = $1', [cleanEmail]);
      return sendJSON(res, 200, { meds: updated.rows.map(mapMedication) });
    }

    // --- LANGGRAPH + LANGCHAIN + LLAMA 3 RAG ASSISTANT ROUTE ---
    if (pathname === '/api/assistant/chat' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { email, message, conversationId } = body;
      if (!message) return sendJSON(res, 400, { error: 'Message text is required' });

      // Run LangGraph Agent Workflow Nodes (Safety Check -> Retriever -> Llama Generation -> Formatter)
      const ragResult = await runLangGraphRAGAgent(message);

      // Save to PostgreSQL assistant_chats history
      if (email && pool) {
        await pool.query(`
          INSERT INTO assistant_chats (email, conversation_id, user_message, bot_response, sources, safety_flag, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `, [email.toLowerCase().trim(), conversationId || 'c_default', message, ragResult.answer, JSON.stringify(ragResult.sources), ragResult.safetyFlag]).catch(() => {});
      }

      return sendJSON(res, 200, {
        answer: ragResult.answer,
        sources: ragResult.sources,
        safetyFlag: ragResult.safetyFlag
      });
    }

    // --- COMMUNITY ---
    if (pathname === '/api/community' && req.method === 'GET') {
      const resPosts = await pool.query('SELECT * FROM community_posts ORDER BY created_at DESC');
      return sendJSON(res, 200, { posts: resPosts.rows.map(mapCommunityPost) });
    }

    if (pathname === '/api/community' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { topic, author, title, body: postBody } = body;
      if (!title || !postBody) return sendJSON(res, 400, { error: 'Title and body required' });

      const newPost = {
        id: 'p_' + Date.now(),
        topic: topic || 'general',
        author: author || 'Anonymous',
        title,
        body: postBody,
        replies: [],
        createdAt: new Date().toISOString()
      };

      await pool.query(`
        INSERT INTO community_posts (id, topic, author, title, body, replies, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [newPost.id, newPost.topic, newPost.author, newPost.title, newPost.body, JSON.stringify(newPost.replies), newPost.createdAt]);

      const resPosts = await pool.query('SELECT * FROM community_posts ORDER BY created_at DESC');
      return sendJSON(res, 201, { posts: resPosts.rows.map(mapCommunityPost) });
    }

    if (pathname === '/api/community/reply' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { postId, author, body: replyBody } = body;
      if (!postId || !replyBody) return sendJSON(res, 400, { error: 'PostId and reply body required' });

      const reply = { id: 'r_' + Date.now(), author: author || 'Anonymous', body: replyBody };
      await pool.query(`
        UPDATE community_posts
        SET replies = replies || $1::jsonb
        WHERE id = $2
      `, [JSON.stringify([reply]), postId]);

      const resPosts = await pool.query('SELECT * FROM community_posts ORDER BY created_at DESC');
      return sendJSON(res, 200, { posts: resPosts.rows.map(mapCommunityPost) });
    }

    // --- SHARING ---
    if (pathname === '/api/sharing' && req.method === 'GET') {
      const email = url.searchParams.get('email');
      if (!email) return sendJSON(res, 400, { error: 'Email required' });
      const cleanEmail = email.toLowerCase().trim();
      const resShares = await pool.query('SELECT * FROM share_links WHERE email = $1 ORDER BY created_at DESC', [cleanEmail]);
      return sendJSON(res, 200, { shares: resShares.rows.map(mapShareLink) });
    }

    if (pathname === '/api/sharing' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { email, name, relationship, permissions } = body;
      if (!email) return sendJSON(res, 400, { error: 'Email required' });
      const cleanEmail = email.toLowerCase().trim();

      const newShare = {
        id: 's_' + Date.now(),
        email: cleanEmail,
        name,
        relationship: relationship || 'Caregiver',
        permissions: permissions || { cycle: true, symptoms: false, pregnancy: false, insights: true },
        active: true,
        createdAt: new Date().toISOString()
      };

      await pool.query(`
        INSERT INTO share_links (id, email, name, relationship, permissions, active, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [newShare.id, newShare.email, newShare.name, newShare.relationship, JSON.stringify(newShare.permissions), newShare.active, newShare.createdAt]);

      const resShares = await pool.query('SELECT * FROM share_links WHERE email = $1 ORDER BY created_at DESC', [cleanEmail]);
      return sendJSON(res, 201, { shares: resShares.rows.map(mapShareLink) });
    }

    // --- NOTIFICATIONS API ---
    if (pathname === '/api/notifications' && req.method === 'GET') {
      const email = url.searchParams.get('email');
      if (!email) return sendJSON(res, 400, { error: 'Email required' });

      const cleanEmail = email.toLowerCase().trim();
      const resNotifs = await pool.query('SELECT * FROM user_notifications WHERE email = $1 ORDER BY created_at DESC', [cleanEmail]);
      let notifs = resNotifs.rows.map(mapNotification);

      // Seed personalized notifications tailored to user profile, focus, and tracked data
      if (notifs.length === 0) {
        const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
        const user = userRes.rows.length > 0 ? mapUser(userRes.rows[0]) : null;
        const userName = user?.name ? user.name.split(' ')[0] : 'there';
        const focus = user?.focus || 'general';
        const logsRes = await pool.query('SELECT * FROM cycle_logs WHERE email = $1', [cleanEmail]);
        const medsRes = await pool.query('SELECT * FROM medications WHERE email = $1 AND active = true', [cleanEmail]);

        const sampleNotifs = [
          {
            id: 'n_1',
            email: cleanEmail,
            category: 'account',
            title: `Welcome to Saheli, ${userName}!`,
            message: `Your account is configured for ${focus} tracking. Explore your companion tools and grounded AI health assistant.`,
            discreetMessage: `Welcome to Saheli! Your account is active.`,
            read: false,
            createdAt: new Date().toISOString()
          },
        ];

        if (focus === 'pcos') {
          sampleNotifs.push({
            id: 'n_2',
            email: cleanEmail,
            category: 'insights',
            title: 'PCOS Wellness Tip',
            message: 'Pairing protein with complex carbs helps prevent steep blood sugar spikes that trigger excess androgen production.',
            discreetMessage: 'New wellness update in Saheli.',
            read: false,
            createdAt: new Date(Date.now() - 1800000).toISOString()
          });
        } else if (focus === 'pregnancy') {
          sampleNotifs.push({
            id: 'n_2',
            email: cleanEmail,
            category: 'pregnancy',
            title: 'Pregnancy Milestone',
            message: `Week ${user?.pregnancyWeek || 8} milestone and symptom guidance are ready in your Pregnancy tab.`,
            discreetMessage: 'New milestone update in Saheli.',
            read: false,
            createdAt: new Date(Date.now() - 1800000).toISOString()
          });
        } else if (focus === 'fertility') {
          sampleNotifs.push({
            id: 'n_2',
            email: cleanEmail,
            category: 'cycle',
            title: 'Fertile Window Insight',
            message: 'Track your BBT and cervical mucus shifts to pinpoint your fertile window this cycle.',
            discreetMessage: 'Cycle insight ready in Saheli.',
            read: false,
            createdAt: new Date(Date.now() - 1800000).toISOString()
          });
        } else {
          sampleNotifs.push({
            id: 'n_2',
            email: cleanEmail,
            category: 'cycle',
            title: 'Cycle Update',
            message: logsRes.rows.length > 0 ? 'Your period logs are synced. View your updated cycle predictions on your dashboard.' : 'Log your period dates on the tracker page to calculate your cycle stats.',
            discreetMessage: 'Cycle update ready in Saheli.',
            read: false,
            createdAt: new Date(Date.now() - 1800000).toISOString()
          });
        }

        if (medsRes.rows.length > 0) {
          const firstMed = mapMedication(medsRes.rows[0]);
          sampleNotifs.push({
            id: 'n_3',
            email: cleanEmail,
            category: 'logging',
            title: 'Daily Medication Reminder',
            message: `Remember to take your scheduled ${firstMed.name} (${firstMed.schedule || 'Daily'}).`,
            discreetMessage: 'Time for your daily Saheli reminder.',
            read: false,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          });
        } else {
          sampleNotifs.push({
            id: 'n_3',
            email: cleanEmail,
            category: 'logging',
            title: 'Daily Check-in',
            message: 'Want to log your symptoms, mood, or water intake today?',
            discreetMessage: 'Time for your daily Saheli check-in.',
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          });
        }

        for (const sn of sampleNotifs) {
          await pool.query(`
            INSERT INTO user_notifications (id, email, category, title, message, discreet_message, read, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [sn.id, sn.email, sn.category, sn.title, sn.message, sn.discreetMessage, sn.read, sn.createdAt]);
        }
        notifs = sampleNotifs;
      }

      return sendJSON(res, 200, { notifications: notifs });
    }

    if (pathname === '/api/notifications/read' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { email, notificationId, markAll } = body;
      if (!email) return sendJSON(res, 400, { error: 'Email required' });

      const cleanEmail = email.toLowerCase().trim();
      if (markAll) {
        await pool.query('UPDATE user_notifications SET read = true WHERE email = $1', [cleanEmail]);
      } else if (notificationId) {
        await pool.query('UPDATE user_notifications SET read = true WHERE email = $1 AND id = $2', [cleanEmail, notificationId]);
      }

      const resNotifs = await pool.query('SELECT * FROM user_notifications WHERE email = $1 ORDER BY created_at DESC', [cleanEmail]);
      return sendJSON(res, 200, { notifications: resNotifs.rows.map(mapNotification) });
    }

    if (pathname === '/api/notifications/settings' && req.method === 'GET') {
      const email = url.searchParams.get('email');
      if (!email) return sendJSON(res, 400, { error: 'Email required' });

      const cleanEmail = email.toLowerCase().trim();
      const resPref = await pool.query('SELECT * FROM notification_preferences WHERE email = $1', [cleanEmail]);
      let settings;

      if (resPref.rows.length === 0) {
        settings = {
          email: cleanEmail,
          discreetMode: true,
          categories: {
            cycle: true,
            logging: true,
            insights: true,
            assistant: true,
            pregnancy: true,
            community: false,
            care: true,
            account: true,
          },
          updatedAt: new Date().toISOString()
        };
        await pool.query(`
          INSERT INTO notification_preferences (email, discreet_mode, categories, updated_at)
          VALUES ($1, $2, $3, $4)
        `, [settings.email, settings.discreetMode, JSON.stringify(settings.categories), settings.updatedAt]);
      } else {
        settings = mapNotificationPreference(resPref.rows[0]);
      }

      return sendJSON(res, 200, { settings });
    }

    if (pathname === '/api/notifications/settings' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { email, discreetMode, categories } = body;
      if (!email) return sendJSON(res, 400, { error: 'Email required' });

      const cleanEmail = email.toLowerCase().trim();
      await pool.query(`
        INSERT INTO notification_preferences (email, discreet_mode, categories, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (email)
        DO UPDATE SET discreet_mode = EXCLUDED.discreet_mode, categories = EXCLUDED.categories, updated_at = NOW()
      `, [cleanEmail, !!discreetMode, JSON.stringify(categories)]);

      const resPref = await pool.query('SELECT * FROM notification_preferences WHERE email = $1', [cleanEmail]);
      const settings = mapNotificationPreference(resPref.rows[0]);
      return sendJSON(res, 200, { settings });
    }

    // Fallback 404
    return sendJSON(res, 404, { error: 'API endpoint not found' });
  } catch (err) {
    console.error('API Error:', err);
    return sendJSON(res, 500, { error: err.message || 'Internal server error' });
  }
});

initDB().then(() => {
  server.listen(PORT, () => {
    console.log(` Saheli Backend API server listening on http://localhost:${PORT}`);
  });
});
