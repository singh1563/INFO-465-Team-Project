DROP DATABASE IF EXISTS course_registration;
CREATE DATABASE course_registration
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE course_registration;

CREATE TABLE department (
  department_id INT AUTO_INCREMENT PRIMARY KEY,
  department_code VARCHAR(10) NOT NULL UNIQUE,
  department_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE student (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  student_number VARCHAR(20) NOT NULL UNIQUE,
  major_department_id INT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  account_status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  CONSTRAINT fk_student_department
    FOREIGN KEY (major_department_id)
    REFERENCES department(department_id)
);

CREATE TABLE instructor (
  instructor_id INT AUTO_INCREMENT PRIMARY KEY,
  department_id INT NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  CONSTRAINT fk_instructor_department
    FOREIGN KEY (department_id)
    REFERENCES department(department_id)
);

CREATE TABLE course (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  department_id INT NOT NULL,
  course_number VARCHAR(20) NOT NULL,
  course_title VARCHAR(150) NOT NULL,
  credit_hours INT NOT NULL,
  course_description VARCHAR(500) NULL,
  real_designation BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_course_department
    FOREIGN KEY (department_id)
    REFERENCES department(department_id),
  CONSTRAINT uq_course_department_number
    UNIQUE (department_id, course_number),
  CONSTRAINT chk_course_credit_hours
    CHECK (credit_hours > 0)
);

CREATE TABLE term (
  term_id INT AUTO_INCREMENT PRIMARY KEY,
  term_name VARCHAR(50) NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  CONSTRAINT chk_term_dates
    CHECK (end_date >= start_date)
);

CREATE TABLE course_session (
  session_id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  instructor_id INT NOT NULL,
  term_id INT NOT NULL,
  section_number VARCHAR(10) NOT NULL,
  meeting_days VARCHAR(50) NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  location VARCHAR(100) NULL,
  modality ENUM('In Person', 'Online', 'Hybrid') NOT NULL,
  capacity INT NOT NULL,
  CONSTRAINT fk_session_course
    FOREIGN KEY (course_id)
    REFERENCES course(course_id),
  CONSTRAINT fk_session_instructor
    FOREIGN KEY (instructor_id)
    REFERENCES instructor(instructor_id),
  CONSTRAINT fk_session_term
    FOREIGN KEY (term_id)
    REFERENCES term(term_id),
  CONSTRAINT uq_course_term_section
    UNIQUE (course_id, term_id, section_number),
  CONSTRAINT chk_session_capacity
    CHECK (capacity > 0)
);

CREATE TABLE enrollment (
  enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  session_id INT NOT NULL,
  registration_date DATE NOT NULL,
  registration_status ENUM('Registered', 'Dropped', 'Waitlisted')
    NOT NULL DEFAULT 'Registered',
  CONSTRAINT fk_enrollment_student
    FOREIGN KEY (student_id)
    REFERENCES student(student_id),
  CONSTRAINT fk_enrollment_session
    FOREIGN KEY (session_id)
    REFERENCES course_session(session_id),
  CONSTRAINT uq_student_session
    UNIQUE (student_id, session_id)
);

CREATE TABLE course_prerequisite (
  course_id INT NOT NULL,
  prerequisite_course_id INT NOT NULL,
  PRIMARY KEY (course_id, prerequisite_course_id),
  CONSTRAINT fk_prerequisite_course
    FOREIGN KEY (course_id)
    REFERENCES course(course_id),
  CONSTRAINT fk_required_course
    FOREIGN KEY (prerequisite_course_id)
    REFERENCES course(course_id),
  CONSTRAINT chk_no_self_prerequisite
    CHECK (course_id <> prerequisite_course_id)
);

CREATE INDEX idx_session_course ON course_session(course_id);
CREATE INDEX idx_session_instructor ON course_session(instructor_id);
CREATE INDEX idx_enrollment_student_status
  ON enrollment(student_id, registration_status);
CREATE INDEX idx_enrollment_session_status
  ON enrollment(session_id, registration_status);
