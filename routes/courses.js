const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const department = String(req.query.department || '').trim();
    const instructor = String(req.query.instructor || '').trim();
    const courseNumber = String(req.query.courseNumber || '').trim();
    const search = String(req.query.search || '').trim();

    const inputValues = [department, instructor, courseNumber, search];
    if (inputValues.some((value) => value.length > 100)) {
      return res.status(400).json({
        error: 'Invalid search input.',
        message: 'Search values must be 100 characters or fewer.'
      });
    }

    const conditions = [];
    const parameters = [];

    if (department) {
      conditions.push('(d.department_code LIKE ? OR d.department_name LIKE ?)');
      parameters.push(`%${department}%`, `%${department}%`);
    }

    if (instructor) {
      conditions.push("CONCAT(i.first_name, ' ', i.last_name) LIKE ?");
      parameters.push(`%${instructor}%`);
    }

    if (courseNumber) {
      conditions.push('(c.course_number LIKE ? OR CONCAT(d.department_code, \' \', c.course_number) LIKE ?)');
      parameters.push(`%${courseNumber}%`, `%${courseNumber}%`);
    }

    if (search) {
      conditions.push(`(
        d.department_code LIKE ?
        OR d.department_name LIKE ?
        OR c.course_number LIKE ?
        OR CONCAT(d.department_code, ' ', c.course_number) LIKE ?
        OR c.course_title LIKE ?
        OR CONCAT(i.first_name, ' ', i.last_name) LIKE ?
      )`);
      const pattern = `%${search}%`;
      parameters.push(pattern, pattern, pattern, pattern, pattern, pattern);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const sql = `
      SELECT
        cs.session_id AS sessionId,
        d.department_code AS department,
        d.department_name AS departmentName,
        c.course_number AS courseNumber,
        CONCAT(d.department_code, ' ', c.course_number) AS courseCode,
        c.course_title AS title,
        c.credit_hours AS credits,
        c.course_description AS description,
        c.real_designation AS realDesignation,
        CONCAT(i.first_name, ' ', i.last_name) AS instructor,
        cs.section_number AS section,
        cs.meeting_days AS days,
        TIME_FORMAT(cs.start_time, '%h:%i %p') AS startTime,
        TIME_FORMAT(cs.end_time, '%h:%i %p') AS endTime,
        cs.location,
        cs.modality,
        cs.capacity,
        COUNT(DISTINCT CASE
          WHEN e.registration_status = 'Registered' THEN e.enrollment_id
          ELSE NULL
        END) AS enrolled,
        GREATEST(
          cs.capacity - COUNT(DISTINCT CASE
            WHEN e.registration_status = 'Registered' THEN e.enrollment_id
            ELSE NULL
          END),
          0
        ) AS openSeats,
        GROUP_CONCAT(
          DISTINCT CONCAT(pd.department_code, ' ', pc.course_number)
          ORDER BY pd.department_code, pc.course_number
          SEPARATOR ', '
        ) AS prerequisites
      FROM course_session cs
      INNER JOIN course c ON c.course_id = cs.course_id
      INNER JOIN department d ON d.department_id = c.department_id
      INNER JOIN instructor i ON i.instructor_id = cs.instructor_id
      INNER JOIN term t ON t.term_id = cs.term_id
      LEFT JOIN enrollment e ON e.session_id = cs.session_id
      LEFT JOIN course_prerequisite cp ON cp.course_id = c.course_id
      LEFT JOIN course pc ON pc.course_id = cp.prerequisite_course_id
      LEFT JOIN department pd ON pd.department_id = pc.department_id
      ${whereClause}
      GROUP BY
        cs.session_id,
        d.department_code,
        d.department_name,
        c.course_number,
        c.course_title,
        c.credit_hours,
        c.course_description,
        c.real_designation,
        i.first_name,
        i.last_name,
        cs.section_number,
        cs.meeting_days,
        cs.start_time,
        cs.end_time,
        cs.location,
        cs.modality,
        cs.capacity
      ORDER BY d.department_code, c.course_number, cs.section_number
      LIMIT 100
    `;

    const [rows] = await pool.execute(sql, parameters);

    const courses = rows.map((row) => ({
      ...row,
      realDesignation: Boolean(row.realDesignation),
      prerequisites: row.prerequisites || 'None',
      meetingTime: row.startTime && row.endTime
        ? `${row.days}, ${row.startTime} - ${row.endTime}`
        : row.days || 'To be announced',
      isFull: Number(row.openSeats) <= 0
    }));

    return res.json({
      count: courses.length,
      courses
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
