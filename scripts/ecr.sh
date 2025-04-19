#!/bin/bash

# 스크립트 실행 중 오류 발생시 즉시 중단
set -e

# 변수 설정
REGION="ap-northeast-2"
ACCOUNT_ID="565393029823"
REPOSITORY_NAME="sometimes-integration-api"
ECR_REPOSITORY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPOSITORY_NAME}"
IMAGE_TAG="latest"

# 현재 시간을 태그로 사용
DATETIME_TAG=$(date '+%Y%m%d_%H%M%S')

echo "🚀 ECR 빌드 및 푸시 프로세스 시작..."

# ECR 로그인
echo "📦 ECR 로그인 중..."
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

# 빌더 생성
echo "🔨 Docker 빌더 설정 중..."
docker buildx create --use --name multiarch-builder || true

# 멀티 아키텍처 빌드 및 푸시
echo "🏗️ 멀티 아키텍처 이미지 빌드 및 푸시 중..."
docker buildx build \
  --platform linux/amd64 \
  --tag ${ECR_REPOSITORY}:${IMAGE_TAG} \
  --tag ${ECR_REPOSITORY}:${DATETIME_TAG} \
  --push \
  --build-arg NODE_ENV=production \
  --build-arg PORT=8044 \
  .

echo "✅ 빌드 및 푸시 완료!"
echo "이미지 태그:"
echo "- ${ECR_REPOSITORY}:${IMAGE_TAG}"
echo "- ${ECR_REPOSITORY}:${DATETIME_TAG}"

# 빌더 제거
echo "🧹 빌더 정리 중..."
docker buildx rm multiarch-builder

echo "🎉 모든 프로세스가 성공적으로 완료되었습니다!"