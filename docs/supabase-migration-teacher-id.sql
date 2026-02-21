-- classes 테이블의 teacher_id 외래키 제거 + nullable로 변경
-- Supabase SQL Editor에서 실행해 주세요.

-- 1) 기존 외래키 제약조건 삭제
ALTER TABLE classes DROP CONSTRAINT IF EXISTS classes_teacher_id_fkey;

-- 2) NOT NULL 제약 제거
ALTER TABLE classes ALTER COLUMN teacher_id DROP NOT NULL;

-- 3) 기본값 NULL 설정
ALTER TABLE classes ALTER COLUMN teacher_id SET DEFAULT NULL;

-- 4) classes에 대한 RLS 정책도 완화 (누구나 조회/생성 가능하도록)
DROP POLICY IF EXISTS "Teachers can view their own classes" ON classes;
DROP POLICY IF EXISTS "Teachers can create their own classes" ON classes;

CREATE POLICY "Anyone can view classes"
  ON classes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create classes"
  ON classes FOR INSERT
  WITH CHECK (true);

-- 5) students 테이블도 RLS 정책 완화 (서버 API가 service_role로 처리하지만, 안전하게)
DROP POLICY IF EXISTS "Students can view classmates" ON students;

CREATE POLICY "Anyone can view students"
  ON students FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create students"
  ON students FOR INSERT
  WITH CHECK (true);

-- 6) safety_pins 테이블도 RLS 정책 완화
DROP POLICY IF EXISTS "Students can view pins in their class" ON safety_pins;
DROP POLICY IF EXISTS "Students can create their own pins" ON safety_pins;

CREATE POLICY "Anyone can view pins"
  ON safety_pins FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create pins"
  ON safety_pins FOR INSERT
  WITH CHECK (true);
