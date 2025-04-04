-- 선호도 타입 테이블 생성
CREATE TABLE IF NOT EXISTS preference_types (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  multi_select BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 선호도 옵션 테이블 생성
CREATE TABLE IF NOT EXISTS preference_options (
  id UUID PRIMARY KEY,
  preference_type_id UUID NOT NULL REFERENCES preference_types(id),
  value VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 선호도 테이블 생성
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  distance_max VARCHAR(36),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 선호도 옵션 테이블 생성
CREATE TABLE IF NOT EXISTS user_preference_options (
  id UUID PRIMARY KEY,
  user_preference_id UUID NOT NULL REFERENCES user_preferences(id),
  preference_option_id UUID NOT NULL REFERENCES preference_options(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 범위 선호도 테이블 생성
CREATE TABLE IF NOT EXISTS user_range_preferences (
  id UUID PRIMARY KEY,
  user_preference_id UUID NOT NULL REFERENCES user_preferences(id),
  preference_type_id UUID NOT NULL REFERENCES preference_types(id),
  min_value INTEGER,
  max_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
