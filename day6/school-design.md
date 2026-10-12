# School Database Design

## Table Explanations

### `students` Table

Stores information about each student. The `id` is the primary key, `name` is required, and `email` must be unique across all records to prevent duplicate student accounts.

### `courses` Table

Stores the catalog of available courses. The `id` is the primary key and `title` is required. This is an independent table.

### `enrollments` Table (Junction Table)

This is a **junction table** that links students to courses. Instead of a surrogate primary key `id`, this table uses a **composite primary key** made of `student_id` and `course_id` together. This guarantees that a single student cannot enroll in the same course twice, since that combination would violate the primary key constraint. It also stores the `grade` a student received.

## Relationships

- **One-to-Many:** A single `student` can be enrolled in many `courses`, but each enrollment belongs to only one student.
- **One-to-Many:** A single `course` can have many `students` enrolled in it, but each enrollment belongs to only one course.
- **Many-to-Many:** Because students can take many courses and courses can have many students, the `enrollments` table is required to break this many-to-many relationship into two one-to-many relationships.

## Index Recommendation

I would add an index on the `enrollments.course_id` column. Because the composite primary key is `(student_id, course_id)`, SQLite automatically creates an internal index that can be used for queries filtering by `student_id` (the leftmost column). However, queries that filter by `course_id` alone (like Query 2 "All students on one course") will not benefit from that internal index. Adding an explicit index on `course_id` will speed up those lookups as the `enrollments` table grows.

## SQL vs. NoSQL Recommendation

For this specific school system, I would choose a **SQL database**. The data is highly structured with clear relationships (students, courses, enrollments) and the use of constraints (like UNIQUE emails, foreign keys, and composite primary keys) is essential for data integrity. NoSQL databases are better for unstructured or rapidly-changing data schemas, but a school system benefits from the reliability and query power of SQL.
