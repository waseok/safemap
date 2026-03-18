-- 질문 요소 추가 마이그레이션
-- Supabase 대시보드 > SQL Editor에서 실행하세요

-- A. 핀 등록 시 분석 질문 컬럼 추가
ALTER TABLE safety_pins
  ADD COLUMN IF NOT EXISTS danger_level SMALLINT CHECK (danger_level BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS cause TEXT,
  ADD COLUMN IF NOT EXISTS predicted_accident TEXT;
