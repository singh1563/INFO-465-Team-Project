const express = require('express');
const { pool } = require('../db');
const requireStudent = require('../middleware/requireStudent');

const router = express.Router();

router.get('/', requireStudent, async (req, res, next) => {
  try {
    const [studentRows] = await pool.execute(
      `SELECT
         s.student_id,
         s.student_number,
         s.first_name,
         s.last_name,
         s.email,
         d.department_code AS major_department
       FROM student s
       LEFT JOIN department d ON d.department_id = s.major_department_id
       WHERE s.student_id = ?
       LIMIT 1`,
      [req.session.studentId]
    );

    const student = studentRows[0];

    if (!student) {
      return res.status(404).json({
        error: 'Student not found.',
        message: 'The authenticated student account could not be located.'
      });
    }

    const [scheduleRows] = await pool.execute(
      `SELECT
         e.enrollment_id AS enrollmentId,
         e.registration_status AS registrationStatus,
         e.registration_date AS registrationDate,
         cs.session_id AS sessionId,
         cs.section_number AS section,
         cs.meeting_days AS days,
         TIME_FORMAT(cs.start_time, '%h:%i %p') AS startTime,
         TIME_FORMAT(cs.end_time, '%h:%i %p') AS endTime,
         cs.location,
         cs.modality,
         c.course_number AS courseNumber,
         CONCAT(d.department_code, ' ', c.course_number) AS courseCode,
         c.course_title AS title,
         c.credit_hours AS credits,
         CONCAT(i.first_name, ' ', i.last_name) AS instructor,
         t.term_name AS term
       FROM enrollment e
       INNER JOIN course_session cs ON cs.session_id = e.session_id
       INNER JOIN course c ON c.course_id = cs.course_id
       INNER JOIN department d ON d.department_id = c.department_id
       INNER JOIN instructor i ON i.instructor_id = cs.instructor_id
       INNER JOIN term t ON t.term_id = cs.term_id
       WHERE e.student_id = ?
         AND e.registration_status = 'Registered'
       ORDER BY c.course_number, cs.section_number`,
      [req.session.studentId]
    );

    const schedule = scheduleRows.map((row) => ({
      ...row,
      meetingTime: row.startTime && row.endTime
        ? `${row.days}, ${row.startTime} - ${row.endTime}`
        : row.days || 'To be announced'
    }));

    const totalCredits = schedule.reduce(
      (sum, section) => sum + Number(section.credits || 0),
      0
    );

    return res.json({
      student: {
        studentId: student.student_id,
        studentNumber: student.student_number,
        name: `${student.first_name} ${student.last_name}`,
        email: student.email,
        majorDepartment: student.major_department || 'Undeclared'
      },
      totalCredits,
      count: schedule.length,
      schedule
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
