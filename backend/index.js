require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./prisma');
const crypto = require('crypto');
const PORT = process.env.PORT || 3001;

const app = express();

const statsRoutes = require('./statsRoutes');
const adminRoutes = require('./adminRoutes');
const teacherRoutes = require('./teacherRoutes');
const studentRoutes = require('./studentRoutes');

app.use(express.json());
// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
// API Routes
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/attendance', teacherRoutes);
app.use('/api/student', studentRoutes);

// In-memory store for reset tokens (for demo only)
const resetTokens = {};


app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Attenda Backend Home</title>
        <style>
          body { font-family: sans-serif; padding: 2rem; }
          a.button {
            display: inline-block;
            background: #e11d48;
            color: #fff;
            padding: 0.7rem 1.2rem;
            border-radius: 5px;
            text-decoration: none;
            font-size: 1rem;
            margin: 1rem 0.5rem 0 0;
          }
        </style>
      </head>
      <body>
        <h1>Welcome to the Attenda Express.js backend!</h1>
        <p>
          <a href="/db-view" class="button">Open DB Viewer</a>
          <a href="http://localhost:5555" class="button" target="_blank">Open Prisma Studio</a>
        </p>
        <p style="margin-top:2rem; color:#444;">To use Prisma Studio, run <code>npx prisma studio</code> in your <b>backend</b> directory.</p>
      </body>
    </html>
  `);
});

// Simple DB viewer page
app.get('/db-view', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Attenda DB Viewer</title>
        <style>
          body { font-family: sans-serif; padding: 2rem; }
          button { background: #e11d48; color: #fff; border: none; padding: 0.7rem 1.2rem; border-radius: 5px; font-size: 1rem; cursor: pointer; }
          pre { background: #f3f3f3; padding: 1rem; border-radius: 5px; margin-top: 2rem; }
        </style>
      </head>
      <body>
        <h2>Attenda DB Viewer</h2>
        <button onclick="fetchUsers()">Show All Users</button>
        <pre id="output"></pre>
        <script>
          async function fetchUsers() {
            const res = await fetch('/api/users');
            const data = await res.json();
            document.getElementById('output').textContent = JSON.stringify(data, null, 2);
          }
        </script>
      </body>
    </html>
  `);
});

// API endpoint to get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot password
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required.' });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security, do not reveal if user exists
      return res.json({ success: true });
    }
    // Generate token and expiry
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 1000 * 60 * 30; // 30 min
    resetTokens[token] = { userId: user.id, expiry };
    // Log reset link to console (simulate email)
    console.log(`Password reset link for ${email}: http://localhost:3000/reset-password?token=${token}`);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Reset password
app.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ success: false, message: 'Token and password required.' });
  const data = resetTokens[token];
  if (!data || data.expiry < Date.now()) {
    return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
  }
  try {
    await prisma.user.update({ where: { id: data.userId }, data: { password } });
    delete resetTokens[token];
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required.' });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true, role: { select: { name: true } } }
    });
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    // For demo, return user info (never send password in real apps)
    const { password: _, ...userData } = user;
    userData.role = user.role.name;
    res.json({ success: true, user: userData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
