-- 기존 Supabase 프로젝트에서 카테고리를 7대 안전으로 변경할 때 사용
-- 신규 설치 시에는 supabase-schema.sql 만 실행하면 됩니다.

-- 1) 기존 CHECK 제약조건 제거 (제약조건 이름은 Supabase가 자동 부여한 경우 다를 수 있음)
ALTER TABLE safety_pins DROP CONSTRAINT IF EXISTS safety_pins_category_check;

-- 2) category 컬럼 길이 확장 (긴 이름 대비)
ALTER TABLE safety_pins ALTER COLUMN category TYPE VARCHAR(50);

-- 3) 기존 데이터를 7대 안전 값으로 매핑 (CHECK 제거 후에만 가능)
UPDATE safety_pins SET category = '교통안전' WHERE category = '교통';
UPDATE safety_pins SET category = '재난안전' WHERE category = '환경';
UPDATE safety_pins SET category = '생활안전' WHERE category = '기타';

-- 4) 새 CHECK 제약조건 추가 (7대 안전)
ALTER TABLE safety_pins ADD CONSTRAINT safety_pins_category_check CHECK (category IN (
  '생활안전', '교통안전', '응급처치', '폭력예방 및 신변보호',
  '약물 및 사이버 중독 예방', '재난안전', '직업안전'
));
