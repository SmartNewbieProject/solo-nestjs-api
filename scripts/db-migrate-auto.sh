#!/bin/bash

# 스크립트 실행 중 오류 발생시 즉시 중단
set -e

echo "🚀 자동 데이터베이스 마이그레이션 시작..."

# 환경 변수 확인
if [ -z "$DATABASE_NAME" ] || [ -z "$DATABASE_HOST" ] || [ -z "$DATABASE_PORT" ] || [ -z "$DATABASE_USER" ] || [ -z "$DATABASE_PASSWORD" ]; then
  echo "❌ 필요한 환경 변수가 설정되지 않았습니다."
  echo "DATABASE_NAME, DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD가 필요합니다."
  exit 1
fi

echo "🔍 데이터베이스 연결 정보:"
echo "데이터베이스: $DATABASE_NAME"
echo "호스트: $DATABASE_HOST"
echo "포트: $DATABASE_PORT"
echo "사용자: $DATABASE_USER"

# Drizzle 스키마 생성
echo "🔄 Drizzle 스키마 생성 중..."
pnpm db:generate

# 생성된 마이그레이션 파일 확인
echo "📋 생성된 마이그레이션 파일 목록:"
ls -la drizzle

# 마이그레이션 적용
echo "🚀 마이그레이션 적용 중..."
pnpm db:push

echo "✅ 마이그레이션이 성공적으로 적용되었습니다."
echo "🎉 자동 데이터베이스 마이그레이션 완료!"

# 마이그레이션 SQL 파일 백업 (선택적)
BACKUP_DIR="./db-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

if [ ! -d "$BACKUP_DIR" ]; then
  mkdir -p "$BACKUP_DIR"
fi

echo "💾 마이그레이션 SQL 파일 백업 중..."
cp -r drizzle "$BACKUP_DIR/drizzle_$TIMESTAMP"
echo "✅ 백업 완료: $BACKUP_DIR/drizzle_$TIMESTAMP"
