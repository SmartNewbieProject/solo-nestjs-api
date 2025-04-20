#!/bin/bash

# 프로젝트 디렉토리로 이동
cd /home/ubuntu/solo-nestjs-api

# 환경 변수 파일 복사 (서버에 미리 준비되어 있어야 함)
cp /home/ubuntu/.env .env

# 의존성 설치
pnpm install

# 데이터베이스 마이그레이션 실행
echo "데이터베이스 마이그레이션 실행 중..."
chmod +x scripts/db-migrate-auto.sh
./scripts/db-migrate-auto.sh

# 프로젝트 빌드
pnpm build

# PM2로 애플리케이션 재시작
pm2 restart solo-api || pm2 start dist/main.js --name "solo-api"
