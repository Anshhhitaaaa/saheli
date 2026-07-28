import http from 'node:http';
import fs from 'node:fs';
import { MongoClient, ObjectId } from 'mongodb';
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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://agrawalanshita07_db_user:aE9Q4McP84natISI@cluster0.873j5ic.mongodb.net/saheli?retryWrites=true&w=majority&appName=Cluster0';
const PORT = process.env.PORT || 5000;

let db;

async function initDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('saheli');
    console.log(' Successfully connected to MongoDB Atlas (saheli database)');
    await seedInitialData();
  } catch (err) {
    console.error(' MongoDB Connection Error:', err.message);
  }
}

async function seedInitialData() {
  // Seed sample community posts if empty
  const communityCol = db.collection('community_posts');
  const count = await communityCol.countDocuments();
  if (count === 0) {
    await communityCol.insertMany([
      {
        id: 'p1',
        topic: 'pcos',
        author: 'lotus_42',
        title: 'Anyone else with long cycles that finally regularized?',
        body: 'My cycles were 40+ days for years. After a year of small changes (mostly walking and protein), they have crept down to 34 days. Curious what helped others.',
        replies: [
          { id: 'r1', author: 'mango_tree', body: 'Consistent sleep made the biggest difference for me.' },
          { id: 'r2', author: 'river_stone', body: 'Took me almost two years. Be patient with yourself.' }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'p2',
        topic: 'pregnancy',
        author: 'soft_rain',
        title: 'First trimester fatigue — when did it ease for you?',
        body: 'Week 9 and I could sleep standing up. Hearing from people who have been through it would help.',
        replies: [
          { id: 'r3', author: 'amber_light', body: 'Started lifting around week 12 for me. You are almost there.' }
        ],
        createdAt: new Date().toISOString()
      }
    ]);
    console.log(' Seeded initial community discussions into MongoDB');
  }
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

  if (!db) {
    return sendJSON(res, 503, { error: 'Database initializing, please try again in a few seconds.' });
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

      const existing = await db.collection('users').findOne({ email: cleanEmail });
      if (existing) {
        return sendJSON(res, 400, { error: 'An account with this email address already exists. Please log in.' });
      }

      const newUser = {
        id: 'u_' + Date.now(),
        name: name.trim(),
        email: cleanEmail,
        password,
        focus,
        pregnancyMode: focus === 'pregnancy',
        pregnancyWeek: focus === 'pregnancy' ? 8 : undefined,
        createdAt: new Date().toISOString(),
      };

      await db.collection('users').insertOne(newUser);
      delete newUser.password;
      delete newUser._id;
      return sendJSON(res, 201, { user: newUser, token: 'token_' + newUser.id });
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { email, password } = body;
      const cleanEmail = (email || '').toLowerCase().trim();

      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        return sendJSON(res, 400, { error: 'Please enter a valid email address.' });
      }

      const user = await db.collection('users').findOne({ email: cleanEmail });
      if (!user) {
        return sendJSON(res, 400, { error: 'No account found with this email address. Please sign up.' });
      }

      if (user.password && password && user.password !== password) {
        return sendJSON(res, 400, { error: 'Incorrect password. Please try again.' });
      }

      delete user.password;
      delete user._id;
      return sendJSON(res, 200, { user, token: 'token_' + user.id });
    }

    if (pathname === '/api/auth/update' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { email, patch } = body;
      const cleanEmail = (email || '').toLowerCase().trim();

      if (!cleanEmail) return sendJSON(res, 400, { error: 'Email is required' });

      await db.collection('users').updateOne({ email: cleanEmail }, { $set: patch });
      const updatedUser = await db.collection('users').findOne({ email: cleanEmail });
      if (updatedUser) {
        delete updatedUser._id;
        delete updatedUser.password;
      }
      return sendJSON(res, 200, { user: updatedUser });
    }

    // --- CYCLE LOGS ---
    if (pathname === '/api/cycle' && req.method === 'GET') {
      const email = url.searchParams.get('email');
      if (!email) return sendJSON(res, 400, { error: 'Email parameter required' });
      const logs = await db.collection('cycle_logs').find({ email: email.toLowerCase().trim() }).toArray();
      return sendJSON(res, 200, { logs });
    }

    if (pathname === '/api/cycle' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { email, date, flow, note } = body;
      if (!email || !date) return sendJSON(res, 400, { error: 'Email and date required' });

      await db.collection('cycle_logs').updateOne(
        { email: email.toLowerCase().trim(), date },
        { $set: { email: email.toLowerCase().trim(), date, flow, note, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
      if (flow && flow !== 'none') {
        await db.collection('users').updateOne(
          { email: email.toLowerCase().trim() },
          { $set: { lastPeriodStart: date } }
        ).catch(() => {});
      }
      const updated = await db.collection('cycle_logs').find({ email: email.toLowerCase().trim() }).toArray();
      return sendJSON(res, 200, { logs: updated });
    }

    // --- SYMPTOMS ---
    if (pathname === '/api/symptoms' && req.method === 'GET') {
      const email = url.searchParams.get('email');
      if (!email) return sendJSON(res, 400, { error: 'Email required' });
      const logs = await db.collection('symptom_logs').find({ email: email.toLowerCase().trim() }).toArray();
      return sendJSON(res, 200, { logs });
    }

    if (pathname === '/api/symptoms' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { email, date, symptoms, notes } = body;
      if (!email || !date) return sendJSON(res, 400, { error: 'Email and date required' });

      await db.collection('symptom_logs').updateOne(
        { email: email.toLowerCase().trim(), date },
        { $set: { email: email.toLowerCase().trim(), date, symptoms, notes, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
      const logs = await db.collection('symptom_logs').find({ email: email.toLowerCase().trim() }).toArray();
      return sendJSON(res, 200, { logs });
    }

    // --- MEDICATIONS ---
    if (pathname === '/api/medications' && req.method === 'GET') {
      const email = url.searchParams.get('email');
      if (!email) return sendJSON(res, 400, { error: 'Email required' });
      const meds = await db.collection('medications').find({ email: email.toLowerCase().trim() }).toArray();
      return sendJSON(res, 200, { meds });
    }

    if (pathname === '/api/medications' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { email, name, type, dose, schedule, notes } = body;
      if (!email || !name) return sendJSON(res, 400, { error: 'Email and medication name required' });

      const newMed = {
        id: 'm_' + Date.now(),
        email: email.toLowerCase().trim(),
        name,
        type: type || 'supplement',
        dose: dose || '',
        schedule: schedule || 'Daily',
        active: true,
        startedAt: new Date().toISOString().slice(0, 10),
        notes: notes || '',
        takenDates: []
      };

      await db.collection('medications').insertOne(newMed);
      const meds = await db.collection('medications').find({ email: email.toLowerCase().trim() }).toArray();
      return sendJSON(res, 201, { meds });
    }

    if (pathname.startsWith('/api/medications/') && req.method === 'PATCH') {
      const id = pathname.replace('/api/medications/', '');
      const body = await parseJSONBody(req);
      const { email, patch } = body;

      await db.collection('medications').updateOne({ id, email: email.toLowerCase().trim() }, { $set: patch });
      const meds = await db.collection('medications').find({ email: email.toLowerCase().trim() }).toArray();
      return sendJSON(res, 200, { meds });
    }

    if (pathname.startsWith('/api/medications/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/medications/', '');
      const email = url.searchParams.get('email');
      if (!email) return sendJSON(res, 400, { error: 'Email required' });

      await db.collection('medications').deleteOne({ id, email: email.toLowerCase().trim() });
      const meds = await db.collection('medications').find({ email: email.toLowerCase().trim() }).toArray();
      return sendJSON(res, 200, { meds });
    }

    // --- LANGGRAPH + LANGCHAIN + LLAMA 3 RAG ASSISTANT ROUTE ---
    if (pathname === '/api/assistant/chat' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { email, message, conversationId } = body;
      if (!message) return sendJSON(res, 400, { error: 'Message text is required' });

      // Run LangGraph Agent Workflow Nodes (Safety Check -> Retriever -> Llama Generation -> Formatter)
      const ragResult = await runLangGraphRAGAgent(message);

      // Save to MongoDB assistant_chats history
      if (email && db) {
        await db.collection('assistant_chats').insertOne({
          email: email.toLowerCase().trim(),
          conversationId: conversationId || 'c_default',
          userMessage: message,
          botResponse: ragResult.answer,
          sources: ragResult.sources,
          safetyFlag: ragResult.safetyFlag,
          createdAt: new Date().toISOString()
        }).catch(() => {});
      }

      return sendJSON(res, 200, {
        answer: ragResult.answer,
        sources: ragResult.sources,
        safetyFlag: ragResult.safetyFlag
      });
    }

    // --- COMMUNITY ---
    if (pathname === '/api/community' && req.method === 'GET') {
      const posts = await db.collection('community_posts').find({}).sort({ createdAt: -1 }).toArray();
      return sendJSON(res, 200, { posts });
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

      await db.collection('community_posts').insertOne(newPost);
      const posts = await db.collection('community_posts').find({}).sort({ createdAt: -1 }).toArray();
      return sendJSON(res, 201, { posts });
    }

    if (pathname === '/api/community/reply' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { postId, author, body: replyBody } = body;
      if (!postId || !replyBody) return sendJSON(res, 400, { error: 'PostId and reply body required' });

      const reply = { id: 'r_' + Date.now(), author: author || 'Anonymous', body: replyBody };
      await db.collection('community_posts').updateOne(
        { id: postId },
        { $push: { replies: reply } }
      );
      const posts = await db.collection('community_posts').find({}).sort({ createdAt: -1 }).toArray();
      return sendJSON(res, 200, { posts });
    }

    // --- SHARING ---
    if (pathname === '/api/sharing' && req.method === 'GET') {
      const email = url.searchParams.get('email');
      if (!email) return sendJSON(res, 400, { error: 'Email required' });
      const shares = await db.collection('share_links').find({ email: email.toLowerCase().trim() }).toArray();
      return sendJSON(res, 200, { shares });
    }

    if (pathname === '/api/sharing' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { email, name, relationship, permissions } = body;

      const newShare = {
        id: 's_' + Date.now(),
        email: email.toLowerCase().trim(),
        name,
        relationship: relationship || 'Caregiver',
        permissions: permissions || { cycle: true, symptoms: false, pregnancy: false, insights: true },
        active: true,
        createdAt: new Date().toISOString()
      };

      await db.collection('share_links').insertOne(newShare);
      const shares = await db.collection('share_links').find({ email: email.toLowerCase().trim() }).toArray();
      return sendJSON(res, 201, { shares });
    }

    // --- NOTIFICATIONS API ---
    if (pathname === '/api/notifications' && req.method === 'GET') {
      const email = url.searchParams.get('email');
      if (!email) return sendJSON(res, 400, { error: 'Email required' });

      const cleanEmail = email.toLowerCase().trim();
      let notifs = await db.collection('user_notifications').find({ email: cleanEmail }).sort({ createdAt: -1 }).toArray();

      // Seed initial discreet sample notifications if empty
      if (notifs.length === 0) {
        const sampleNotifs = [
          {
            id: 'n_1',
            email: cleanEmail,
            category: 'cycle',
            title: 'Cycle Update',
            message: 'Your period is expected in 2–3 days.',
            discreetMessage: 'You have an update in Saheli.',
            read: false,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'n_2',
            email: cleanEmail,
            category: 'logging',
            title: 'Daily Check-in',
            message: 'Want to log your symptoms or mood today?',
            discreetMessage: 'Time for your daily Saheli check-in.',
            read: false,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'n_3',
            email: cleanEmail,
            category: 'insights',
            title: 'Cycle Insights',
            message: 'Your personalized cycle report for this month is ready to view.',
            discreetMessage: 'New insight ready in Saheli.',
            read: true,
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ];
        await db.collection('user_notifications').insertMany(sampleNotifs);
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
        await db.collection('user_notifications').updateMany({ email: cleanEmail }, { $set: { read: true } });
      } else if (notificationId) {
        await db.collection('user_notifications').updateOne({ email: cleanEmail, id: notificationId }, { $set: { read: true } });
      }

      const notifs = await db.collection('user_notifications').find({ email: cleanEmail }).sort({ createdAt: -1 }).toArray();
      return sendJSON(res, 200, { notifications: notifs });
    }

    if (pathname === '/api/notifications/settings' && req.method === 'GET') {
      const email = url.searchParams.get('email');
      if (!email) return sendJSON(res, 400, { error: 'Email required' });

      const cleanEmail = email.toLowerCase().trim();
      let settings = await db.collection('notification_preferences').findOne({ email: cleanEmail });

      if (!settings) {
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
        await db.collection('notification_preferences').insertOne(settings);
      }

      return sendJSON(res, 200, { settings });
    }

    if (pathname === '/api/notifications/settings' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const { email, discreetMode, categories } = body;
      if (!email) return sendJSON(res, 400, { error: 'Email required' });

      const cleanEmail = email.toLowerCase().trim();
      await db.collection('notification_preferences').updateOne(
        { email: cleanEmail },
        { $set: { email: cleanEmail, discreetMode: !!discreetMode, categories, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );

      const settings = await db.collection('notification_preferences').findOne({ email: cleanEmail });
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
