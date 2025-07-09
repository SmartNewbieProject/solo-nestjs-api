-- Migration: University Details to University Info
-- This migration moves data from university_details table to the new university_info table

-- First, ensure universities table has the required data
INSERT INTO universities (id, name, region, code, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  university_name,
  'UNKNOWN',
  NULL,
  true,
  NOW(),
  NOW()
FROM (
  SELECT DISTINCT university_name
  FROM university_details ud
  JOIN users u ON ud.user_id = u.id
  WHERE u.suspended_at IS NULL
) AS distinct_universities
WHERE NOT EXISTS (
  SELECT 1 FROM universities WHERE name = distinct_universities.university_name
);

-- Then, ensure departments table has the required data
INSERT INTO departments (id, university_id, name, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  univ.id,
  dept_data.department,
  true,
  NOW(),
  NOW()
FROM (
  SELECT DISTINCT ud.university_name, ud.department
  FROM university_details ud
  JOIN users u ON ud.user_id = u.id
  WHERE u.suspended_at IS NULL
) AS dept_data
JOIN universities univ ON univ.name = dept_data.university_name
WHERE NOT EXISTS (
  SELECT 1 FROM departments d 
  WHERE d.university_id = univ.id AND d.name = dept_data.department
);

-- Finally, insert data into university_info table
INSERT INTO university_info (id, profile_id, university_id, department_id, grade, student_number, verified_at, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  p.id,
  univ.id,
  dept.id,
  ud.grade,
  ud.student_number,
  CASE WHEN ud.authentication = true THEN ud.updated_at ELSE NULL END,
  ud.created_at,
  ud.updated_at
FROM university_details ud
JOIN users u ON ud.user_id = u.id
JOIN profiles p ON p.user_id = u.id
JOIN universities univ ON univ.name = ud.university_name
JOIN departments dept ON dept.university_id = univ.id AND dept.name = ud.department
WHERE u.suspended_at IS NULL;