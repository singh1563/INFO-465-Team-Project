require('dotenv').config();

const bcrypt = require('bcryptjs');
const { pool } = require('../db');

async function seedDatabase() {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const tableName of [
      'course_prerequisite',
      'enrollment',
      'course_session',
      'term',
      'course',
      'instructor',
      'student',
      'department'
    ]) {
      await connection.query(`DELETE FROM ${tableName}`);
      await connection.query(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    const passwordHash = await bcrypt.hash('student123', 10);

    await connection.query(
      `INSERT INTO department
       (department_id, department_code, department_name)
       VALUES
       (1, 'INFO', 'Information Systems'),
       (2, 'MKTG', 'Marketing'),
       (3, 'CMSC', 'Computer Science')`
    );

    await connection.execute(
      `INSERT INTO student
       (student_id, student_number, major_department_id, first_name, last_name, email, password_hash, account_status)
       VALUES
       (1, 'V00999999', 1, 'Demo', 'Student', 'demo.student@vcu.edu', ?, 'Active'),
       (2, 'V00999998', 1, 'Alex', 'Morgan', 'alex.morgan@vcu.edu', ?, 'Active'),
       (3, 'V00999997', 2, 'Taylor', 'Reed', 'taylor.reed@vcu.edu', ?, 'Active'),
       (4, 'V00999996', 3, 'Jordan', 'Lee', 'jordan.lee@vcu.edu', ?, 'Active')`,
      [passwordHash, passwordHash, passwordHash, passwordHash]
    );

    await connection.query(
      `INSERT INTO instructor
       (instructor_id, department_id, first_name, last_name, email)
       VALUES
       (1, 1, 'Michael', 'McGarry', 'mcgarrym@vcu.edu'),
       (2, 1, 'Renee', 'Carter', 'renee.carter@vcu.edu'),
       (3, 1, 'Minh', 'Nguyen', 'minh.nguyen@vcu.edu'),
       (4, 1, 'Chris', 'Davis', 'chris.davis@vcu.edu'),
       (5, 2, 'Angela', 'Allen', 'angela.allen@vcu.edu')`
    );

    await connection.query(
      `INSERT INTO course
       (course_id, department_id, course_number, course_title, credit_hours, course_description, real_designation)
       VALUES
       (1, 1, '465', 'Projects in Information Systems', 3, 'Team-based application development using cloud, database, and Agile practices.', TRUE),
       (2, 1, '364', 'Database Systems', 3, 'Relational database design, SQL, normalization, and implementation.', FALSE),
       (3, 1, '370', 'Systems Analysis', 3, 'Requirements analysis, system modeling, and information systems design.', FALSE),
       (4, 1, '350', 'Programming Fundamentals', 3, 'Programming concepts and application development fundamentals.', FALSE),
       (5, 2, '302', 'Marketing Management', 3, 'Marketing strategy, customer analysis, and business decision making.', FALSE)`
    );

    await connection.query(
      `INSERT INTO term
       (term_id, term_name, start_date, end_date)
       VALUES
       (1, 'Summer 2027', '2027-05-24', '2027-08-06')`
    );

    await connection.query(
      `INSERT INTO course_session
       (session_id, course_id, instructor_id, term_id, section_number, meeting_days, start_time, end_time, location, modality, capacity)
       VALUES
       (1, 1, 1, 1, '001', 'Monday / Wednesday', '10:30:00', '11:45:00', 'Online / Zoom', 'Online', 30),
       (2, 1, 1, 1, '002', 'Tuesday / Thursday', '13:00:00', '14:15:00', 'Snead Hall 2045', 'In Person', 30),
       (3, 2, 2, 1, '001', 'Tuesday / Thursday', '13:00:00', '14:15:00', 'Snead Hall 3012', 'In Person', 35),
       (4, 3, 3, 1, '003', 'Monday / Wednesday', '15:00:00', '16:15:00', 'Hybrid', 'Hybrid', 34),
       (5, 4, 4, 1, '001', 'Monday / Wednesday', '10:30:00', '11:45:00', 'Online', 'Online', 30),
       (6, 5, 5, 1, '001', 'Tuesday / Thursday', '09:00:00', '10:15:00', 'Online', 'Online', 30)`
    );

    await connection.query(
      `INSERT INTO course_prerequisite
       (course_id, prerequisite_course_id)
       VALUES
       (1, 2),
       (1, 3),
       (1, 4),
       (2, 4),
       (3, 4)`
    );

    await connection.query(
      `INSERT INTO enrollment
       (enrollment_id, student_id, session_id, registration_date, registration_status)
       VALUES
       (1, 1, 5, '2027-03-01', 'Registered'),
       (2, 1, 3, '2027-03-01', 'Registered'),
       (3, 3, 1, '2027-03-02', 'Registered'),
       (4, 4, 4, '2027-03-02', 'Registered')`
    );

    await connection.commit();

    console.log('Database seed completed successfully.');
    console.log('Test account 1: V00999999 / student123 (two enrolled classes)');
    console.log('Test account 2: V00999998 / student123 (zero enrolled classes)');
    console.log('Test account 3: V00999997 / student123 (one enrolled class)');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

seedDatabase().catch((error) => {
  console.error('Database seed failed.');
  console.error(error);
  process.exit(1);
});
