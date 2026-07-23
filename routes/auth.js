const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

const router = express.Router();

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

router.post('/login', async (req, res, next) => {
  try {
    const studentNumber = String(req.body.studentNumber || '')
      .trim()
      .toUpperCase();
    const password = String(req.body.password || '');

    if (!studentNumber || !password) {
      return res.status(400).json({
        error: 'Missing credentials.',
        message: 'Student ID and password are required.'
      });
    }

    if (studentNumber.length > 20 || password.length > 72) {
      return res.status(400).json({
        error: 'Invalid credentials.',
        message: 'The supplied credentials are not valid.'
      });
    }

    const [rows] = await pool.execute(
      `SELECT
         student_id,
         student_number,
         first_name,
         last_name,
         email,
         account_status,
         password_hash
       FROM student
       WHERE student_number = ?
       LIMIT 1`,
      [studentNumber]
    );

    const student = rows[0];

    if (!student || student.account_status !== 'Active') {
      return res.status(401).json({
        error: 'Login failed.',
        message: 'The Student ID or password is incorrect.'
      });
    }

    const passwordMatches = await bcrypt.compare(password, student.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        error: 'Login failed.',
        message: 'The Student ID or password is incorrect.'
      });
    }

    await regenerateSession(req);

    req.session.studentId = student.student_id;
    req.session.studentNumber = student.student_number;
    req.session.role = 'student';

    await saveSession(req);

    return res.json({
      message: 'Student login successful.',
      student: {
        studentId: student.student_id,
        studentNumber: student.student_number,
        name: `${student.first_name} ${student.last_name}`,
        email: student.email
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    if (!req.session || !req.session.studentId) {
      return res.status(401).json({
        authenticated: false,
        message: 'No active student session.'
      });
    }

    const [rows] = await pool.execute(
      `SELECT
         student_id,
         student_number,
         first_name,
         last_name,
         email,
         account_status
       FROM student
       WHERE student_id = ?
       LIMIT 1`,
      [req.session.studentId]
    );

    const student = rows[0];

    if (!student || student.account_status !== 'Active') {
      req.session.destroy(() => {});
      return res.status(401).json({
        authenticated: false,
        message: 'The student account is no longer available.'
      });
    }

    return res.json({
      authenticated: true,
      student: {
        studentId: student.student_id,
        studentNumber: student.student_number,
        name: `${student.first_name} ${student.last_name}`,
        email: student.email
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (req, res, next) => {
  if (!req.session) {
    return res.json({ message: 'Student logged out.' });
  }

  return req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie('courseReg.sid');
    return res.json({ message: 'Student logged out.' });
  });
});

module.exports = router;
