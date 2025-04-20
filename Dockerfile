FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS prod
# GitHub Actions에서 전달되는 빌드 인자 정의
ARG NODE_ENV
ARG PORT
ARG DATABASE_URL
ARG JWT_SECRET
ARG DATABASE_USER
ARG DATABASE_HOST
ARG DATABASE_PORT
ARG DATABASE_NAME
RUN mkdir /app
COPY package.json pnpm-lock.yaml /app/
WORKDIR /app

# pnpm install 시 --no-frozen-lockfile 옵션 사용
RUN pnpm install --no-frozen-lockfile
RUN pnpm add -g @nestjs/cli

# 소스 코드 복사 및 빌드
COPY . /app
RUN pnpm run build

FROM base
WORKDIR /app
COPY --from=prod /app/package.json /app/package.json
COPY --from=prod /app/node_modules /app/node_modules
COPY --from=prod /app/dist /app/dist

# 런타임 환경 변수 설정
ARG NODE_ENV
ARG PORT
ARG DATABASE_URL
ARG JWT_SECRET
ARG DATABASE_USER
ARG DATABASE_HOST
ARG DATABASE_PORT
ARG DATABASE_NAME

ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV DATABASE_URL=${DATABASE_URL}
ENV JWT_SECRET=${JWT_SECRET}
ENV DATABASE_USER=${DATABASE_USER}
ENV DATABASE_HOST=${DATABASE_HOST}
ENV DATABASE_PORT=${DATABASE_PORT}
ENV DATABASE_NAME=${DATABASE_NAME}

EXPOSE ${PORT}

CMD [ "node", "dist/main.js" ]
