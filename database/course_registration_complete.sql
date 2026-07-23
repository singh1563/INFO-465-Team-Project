CREATE DATABASE  IF NOT EXISTS `course_registration` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `course_registration`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: course_registration
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `app_sessions`
--

DROP TABLE IF EXISTS `app_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_sessions`
--

LOCK TABLES `app_sessions` WRITE;
/*!40000 ALTER TABLE `app_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `app_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course` (
  `course_id` int NOT NULL AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `course_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `credit_hours` int NOT NULL,
  `course_description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `real_designation` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `uq_course_department_number` (`department_id`,`course_number`),
  CONSTRAINT `fk_course_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`),
  CONSTRAINT `chk_course_credit_hours` CHECK ((`credit_hours` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES (1,1,'465','Projects in Information Systems',3,'Team-based application development using cloud, database, and Agile practices.',1),(2,1,'364','Database Systems',3,'Relational database design, SQL, normalization, and implementation.',0),(3,1,'370','Systems Analysis',3,'Requirements analysis, system modeling, and information systems design.',0),(4,1,'350','Programming Fundamentals',3,'Programming concepts and application development fundamentals.',0),(5,2,'302','Marketing Management',3,'Marketing strategy, customer analysis, and business decision making.',0);
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_prerequisite`
--

DROP TABLE IF EXISTS `course_prerequisite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_prerequisite` (
  `course_id` int NOT NULL,
  `prerequisite_course_id` int NOT NULL,
  PRIMARY KEY (`course_id`,`prerequisite_course_id`),
  KEY `fk_required_course` (`prerequisite_course_id`),
  CONSTRAINT `fk_prerequisite_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `fk_required_course` FOREIGN KEY (`prerequisite_course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `chk_no_self_prerequisite` CHECK ((`course_id` <> `prerequisite_course_id`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_prerequisite`
--

LOCK TABLES `course_prerequisite` WRITE;
/*!40000 ALTER TABLE `course_prerequisite` DISABLE KEYS */;
INSERT INTO `course_prerequisite` VALUES (1,2),(1,3),(1,4),(2,4),(3,4);
/*!40000 ALTER TABLE `course_prerequisite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_session`
--

DROP TABLE IF EXISTS `course_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_session` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `instructor_id` int NOT NULL,
  `term_id` int NOT NULL,
  `section_number` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meeting_days` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `modality` enum('In Person','Online','Hybrid') COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int NOT NULL,
  PRIMARY KEY (`session_id`),
  UNIQUE KEY `uq_course_term_section` (`course_id`,`term_id`,`section_number`),
  KEY `fk_session_term` (`term_id`),
  KEY `idx_session_course` (`course_id`),
  KEY `idx_session_instructor` (`instructor_id`),
  CONSTRAINT `fk_session_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `fk_session_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `instructor` (`instructor_id`),
  CONSTRAINT `fk_session_term` FOREIGN KEY (`term_id`) REFERENCES `term` (`term_id`),
  CONSTRAINT `chk_session_capacity` CHECK ((`capacity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_session`
--

LOCK TABLES `course_session` WRITE;
/*!40000 ALTER TABLE `course_session` DISABLE KEYS */;
INSERT INTO `course_session` VALUES (1,1,1,1,'001','Monday / Wednesday','10:30:00','11:45:00','Online / Zoom','Online',30),(2,1,1,1,'002','Tuesday / Thursday','13:00:00','14:15:00','Snead Hall 2045','In Person',30),(3,2,2,1,'001','Tuesday / Thursday','13:00:00','14:15:00','Snead Hall 3012','In Person',35),(4,3,3,1,'003','Monday / Wednesday','15:00:00','16:15:00','Hybrid','Hybrid',34),(5,4,4,1,'001','Monday / Wednesday','10:30:00','11:45:00','Online','Online',30),(6,5,5,1,'001','Tuesday / Thursday','09:00:00','10:15:00','Online','Online',30);
/*!40000 ALTER TABLE `course_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `department_id` int NOT NULL AUTO_INCREMENT,
  `department_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `department_code` (`department_code`),
  UNIQUE KEY `department_name` (`department_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (1,'INFO','Information Systems'),(2,'MKTG','Marketing'),(3,'CMSC','Computer Science');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollment`
--

DROP TABLE IF EXISTS `enrollment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollment` (
  `enrollment_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `session_id` int NOT NULL,
  `registration_date` date NOT NULL,
  `registration_status` enum('Registered','Dropped','Waitlisted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Registered',
  PRIMARY KEY (`enrollment_id`),
  UNIQUE KEY `uq_student_session` (`student_id`,`session_id`),
  KEY `idx_enrollment_student_status` (`student_id`,`registration_status`),
  KEY `idx_enrollment_session_status` (`session_id`,`registration_status`),
  CONSTRAINT `fk_enrollment_session` FOREIGN KEY (`session_id`) REFERENCES `course_session` (`session_id`),
  CONSTRAINT `fk_enrollment_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollment`
--

LOCK TABLES `enrollment` WRITE;
/*!40000 ALTER TABLE `enrollment` DISABLE KEYS */;
INSERT INTO `enrollment` VALUES (1,1,5,'2027-03-01','Registered'),(2,1,3,'2027-03-01','Registered'),(3,3,1,'2027-03-02','Registered'),(4,4,4,'2027-03-02','Registered');
/*!40000 ALTER TABLE `enrollment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructor`
--

DROP TABLE IF EXISTS `instructor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor` (
  `instructor_id` int NOT NULL AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`instructor_id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_instructor_department` (`department_id`),
  CONSTRAINT `fk_instructor_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor`
--

LOCK TABLES `instructor` WRITE;
/*!40000 ALTER TABLE `instructor` DISABLE KEYS */;
INSERT INTO `instructor` VALUES (1,1,'Michael','McGarry','mcgarrym@vcu.edu'),(2,1,'Renee','Carter','renee.carter@vcu.edu'),(3,1,'Minh','Nguyen','minh.nguyen@vcu.edu'),(4,1,'Chris','Davis','chris.davis@vcu.edu'),(5,2,'Angela','Allen','angela.allen@vcu.edu');
/*!40000 ALTER TABLE `instructor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `student_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `major_department_id` int DEFAULT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `student_number` (`student_number`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_student_department` (`major_department_id`),
  CONSTRAINT `fk_student_department` FOREIGN KEY (`major_department_id`) REFERENCES `department` (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES (1,'V00999999',1,'Demo','Student','demo.student@vcu.edu','$2b$10$fmAI73VIiCQUD7i/DPARge.tMKdds1g7J9fyzy2onYGTN33xG3q9S','Active'),(2,'V00999998',1,'Alex','Morgan','alex.morgan@vcu.edu','$2b$10$fmAI73VIiCQUD7i/DPARge.tMKdds1g7J9fyzy2onYGTN33xG3q9S','Active'),(3,'V00999997',2,'Taylor','Reed','taylor.reed@vcu.edu','$2b$10$fmAI73VIiCQUD7i/DPARge.tMKdds1g7J9fyzy2onYGTN33xG3q9S','Active'),(4,'V00999996',3,'Jordan','Lee','jordan.lee@vcu.edu','$2b$10$fmAI73VIiCQUD7i/DPARge.tMKdds1g7J9fyzy2onYGTN33xG3q9S','Active');
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `term`
--

DROP TABLE IF EXISTS `term`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `term` (
  `term_id` int NOT NULL AUTO_INCREMENT,
  `term_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  PRIMARY KEY (`term_id`),
  UNIQUE KEY `term_name` (`term_name`),
  CONSTRAINT `chk_term_dates` CHECK ((`end_date` >= `start_date`))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `term`
--

LOCK TABLES `term` WRITE;
/*!40000 ALTER TABLE `term` DISABLE KEYS */;
INSERT INTO `term` VALUES (1,'Summer 2027','2027-05-24','2027-08-06');
/*!40000 ALTER TABLE `term` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-22 22:48:25
