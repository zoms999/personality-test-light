-- test_attempts 테이블에 language_code 컬럼 추가
ALTER TABLE public.test_attempts 
ADD COLUMN IF NOT EXISTS language_code varchar(5) NOT NULL DEFAULT 'ko';

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS test_attempts_lang_idx 
ON public.test_attempts (language_code);

-- 확인
SELECT column_name, data_type, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_name = 'test_attempts' AND column_name = 'language_code';
