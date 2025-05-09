#!/bin/bash

# 스크립트 실행 중 오류 발생시 즉시 중단
set -e

# 현재 디렉토리 출력
echo "현재 디렉토리: $(pwd)"

# 환경 변수 파일이 있는지 확인
if [ ! -f .env ]; then
  echo "환경 변수 파일(.env)이 없습니다. 환경 변수를 확인해주세요."
  exit 1
fi

# 환경 변수 로드
source .env

echo "🔍 데이터베이스 연결 정보 확인 중..."
echo "데이터베이스: $DATABASE_NAME"
echo "호스트: $DATABASE_HOST"
echo "포트: $DATABASE_PORT"

# Drizzle 스키마 생성
echo "🔄 Drizzle 스키마 생성 중..."
pnpm db:generate

# 생성된 마이그레이션 파일 확인
echo "📋 생성된 마이그레이션 파일 목록:"
ls -la drizzle

# 마이그레이션 적용 (선택적)
read -p "마이그레이션을 데이터베이스에 적용하시겠습니까? (y/n): " apply_migration
if [ "$apply_migration" = "y" ]; then
  echo "🚀 마이그레이션 적용 중..."
  pnpm db:push
  echo "✅ 마이그레이션이 성공적으로 적용되었습니다."
else
  echo "⏭️ 마이그레이션 적용을 건너뛰었습니다."
fi

echo "🎉 모든 작업이 완료되었습니다!"
