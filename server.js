require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const MySQLStoreFactory = require('express-mysql-session');
const { testConnection } = require('./db');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const scheduleRoutes = require('./routes/schedule');

const requiredVariables = ['SESSION_SECRET'];
for (const variableName of requiredVariables) {
  if (!process.env[variableName]) {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }
}

const app = express();
const port = Number(process.env.PORT || 3000);

const MySQLStore = MySQLStoreFactory(session);
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  createDatabaseTable: true,
  schema: {
    tableName: 'app_sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
});

app.set('trust proxy', 1);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.use(
  session({
    name: 'courseReg.sid',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
      maxAge: 60 * 60 * 1000
    }
  })
);

app.get('/api/health', async (req, res, next) => {
  try {
    await testConnection();
    return res.json({
      status: 'ok',
      application: 'INFO 465 Course Registration',
      database: 'connected'
    });
  } catch (error) {
    return next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/student/schedule', scheduleRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'API route not found.',
    message: 'The requested API endpoint does not exist.'
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) return next(error);

  return res.status(500).json({
    error: 'Server error.',
    message: 'The server could not complete the request.'
  });
});

async function startServer() {
  try {
    await testConnection();
    await sessionStore.onReady();

    app.listen(port, () => {
      console.log(`INFO 465 application running at http://localhost:${port}`);
      console.log('Database connection successful.');
      console.log('Session store ready.');
    });
  } catch (error) {
    console.error('Application startup failed.');
    console.error(error);
    process.exit(1);
  }
}

startServer();
