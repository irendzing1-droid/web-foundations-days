-- ==========================================
-- DAY 6: SCHOOL DATABASE
-- ==========================================

-- Drop tables if they exist (helpful for re-running)
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS courses;

-- 1. Create Students Table
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- 2. Create Courses Table
CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL
);

-- 3. Create Enrollments Table (Junction Table with Composite Primary Key)
CREATE TABLE enrollments (
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    PRIMARY KEY (student_id, course_id), -- Composite primary key prevents duplicates
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- ==========================================
-- INSERT SAMPLE DATA
-- ==========================================
INSERT INTO students (id, name, email) VALUES
(1, 'Irene Dzingai', 'irene@example.com'),
(2, 'John Doe', 'john@example.com'),
(3, 'Jane Smith', 'jane@example.com');

INSERT INTO courses (id, title) VALUES
(1, 'Web Development'),
(2, 'Database Design'),
(3, 'Python Programming');

-- Note: We no longer provide an id for enrollments; the student_id + course_id is enough
INSERT INTO enrollments (student_id, course_id, grade) VALUES
(1, 1, 'A'),
(1, 2, 'B'),
(2, 1, 'C'),
(2, 3, 'A'),
(3, 2, 'B');

-- ==========================================
-- FIVE REQUIRED QUERIES
-- ==========================================

-- Query 1: All courses for one student (by name) - Using JOIN
SELECT courses.title 
FROM courses
JOIN enrollments ON courses.id = enrollments.course_id
JOIN students ON students.id = enrollments.student_id
WHERE students.name = 'Irene Dzingai';

-- Query 2: All students on one course - Using JOIN
SELECT students.name 
FROM students
JOIN enrollments ON students.id = enrollments.student_id
JOIN courses ON courses.id = enrollments.course_id
WHERE courses.title = 'Web Development';

-- Query 3: Number of students per course - Using JOIN & GROUP BY
SELECT courses.title, COUNT(enrollments.student_id) AS student_count
FROM courses
LEFT JOIN enrollments ON courses.id = enrollments.course_id
GROUP BY courses.id, courses.title;

-- Query 4: Students who have NO enrollments - Using LEFT JOIN & WHERE IS NULL
SELECT students.name
FROM students
LEFT JOIN enrollments ON students.id = enrollments.student_id
WHERE enrollments.course_id IS NULL; -- Updated to check the composite key

-- Query 5: Update one enrollment's grade
-- Because the primary key is now composite, we identify the row by student AND course
UPDATE enrollments 
SET grade = 'A+' 
WHERE student_id = 1 AND course_id = 2;

-- Query to generate a transcript: Student Name, Course Title, and Letter Grade
-- Ordered alphabetically by student name
SELECT 
    students.student_name,
    courses.course_title,
    enrollments.letter_grade
FROM students
JOIN enrollments ON students.student_id = enrollments.student_id
JOIN courses ON enrollments.course_id = courses.course_id
ORDER BY students.student_name ASC;