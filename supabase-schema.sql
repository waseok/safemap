-- 안전지도 웹앱 데이터베이스 스키마

-- 교사 테이블 (Supabase Auth의 users 테이블과 연동)
-- 교사는 Supabase Auth를 통해 인증되므로 별도 테이블 불필요

-- 학급 테이블 (teacher_id는 선택: Supabase Auth 없이도 학급 생성 가능)
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin VARCHAR(4) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  teacher_id UUID DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 학생 테이블
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 안전 핀 테이블
CREATE TABLE safety_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  location_type VARCHAR(10) NOT NULL CHECK (location_type IN ('학교', '집', '마을')),
  category VARCHAR(50) NOT NULL CHECK (category IN (
    '생활안전', '교통안전', '응급처치', '폭력예방 및 신변보호',
    '약물 및 사이버 중독 예방', '재난안전', '직업안전'
  )),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address VARCHAR(255),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 교사 피드백 테이블 (teacher_id는 선택: Supabase Auth 없이도 피드백 가능)
CREATE TABLE teacher_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  safety_pin_id UUID NOT NULL REFERENCES safety_pins(id) ON DELETE CASCADE,
  teacher_id UUID DEFAULT NULL,
  feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 해결방법 제안 테이블
CREATE TABLE solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  safety_pin_id UUID NOT NULL REFERENCES safety_pins(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'image', 'drawing')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_classes_pin ON classes(pin);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_session_id ON students(session_id);
CREATE INDEX idx_safety_pins_class_id ON safety_pins(class_id);
CREATE INDEX idx_safety_pins_student_id ON safety_pins(student_id);
CREATE INDEX idx_safety_pins_location_type ON safety_pins(location_type);
CREATE INDEX idx_teacher_feedbacks_safety_pin_id ON teacher_feedbacks(safety_pin_id);
CREATE INDEX idx_solutions_safety_pin_id ON solutions(safety_pin_id);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- teacher_feedbacks의 updated_at 자동 업데이트 트리거
CREATE TRIGGER update_teacher_feedbacks_updated_at
  BEFORE UPDATE ON teacher_feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책 설정
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;

-- classes: 교사는 자신이 만든 학급만 볼 수 있음
CREATE POLICY "Teachers can view their own classes"
  ON classes FOR SELECT
  USING (auth.uid() = teacher_id);

-- classes: 교사는 자신의 학급을 생성할 수 있음
CREATE POLICY "Teachers can create their own classes"
  ON classes FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- students: 같은 학급의 학생들은 서로를 볼 수 있음
CREATE POLICY "Students can view classmates"
  ON students FOR SELECT
  USING (
    class_id IN (
      SELECT class_id FROM students WHERE session_id = current_setting('app.session_id', true)
    )
  );

-- students: 학급에 속한 학생은 자신을 생성할 수 있음 (PIN 기반)
-- 이는 API 레벨에서 처리

-- safety_pins: 같은 학급의 학생들은 모든 핀을 볼 수 있음
CREATE POLICY "Students can view pins in their class"
  ON safety_pins FOR SELECT
  USING (
    class_id IN (
      SELECT class_id FROM students WHERE session_id = current_setting('app.session_id', true)
    )
  );

-- safety_pins: 학생은 자신의 핀을 생성할 수 있음
CREATE POLICY "Students can create their own pins"
  ON safety_pins FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE session_id = current_setting('app.session_id', true)
    )
  );

-- teacher_feedbacks: 교사는 자신의 학급 핀에 피드백을 작성할 수 있음
CREATE POLICY "Teachers can manage feedbacks for their class pins"
  ON teacher_feedbacks FOR ALL
  USING (
    teacher_id = auth.uid() AND
    safety_pin_id IN (
      SELECT id FROM safety_pins WHERE class_id IN (
        SELECT id FROM classes WHERE teacher_id = auth.uid()
      )
    )
  );

-- solutions: 같은 학급의 학생들은 모든 해결방법을 볼 수 있음
CREATE POLICY "Students can view solutions in their class"
  ON solutions FOR SELECT
  USING (
    safety_pin_id IN (
      SELECT id FROM safety_pins WHERE class_id IN (
        SELECT class_id FROM students WHERE session_id = current_setting('app.session_id', true)
      )
    )
  );

-- solutions: 학생은 자신의 해결방법을 생성할 수 있음
CREATE POLICY "Students can create their own solutions"
  ON solutions FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE session_id = current_setting('app.session_id', true)
    )
  );
