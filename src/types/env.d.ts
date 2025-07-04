declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    JWT_SECRET: string;

    DATABASE_URL: string;
    DATABASE_USER: string;
    DATABASE_HOST: string;
    DATABASE_PORT: string;
    DATABASE_NAME: string;

    QDRANT_HOST: string;
    QDRANT_PORT: string;
    QDRANT_API_KEY: string;

    REDIS_HOST: string;
    REDIS_PORT: string;
    REDIS_PASSWORD: string;

    COOL_SMS_SECRET_KEY: string;
    COOL_SMS_API_KEY: string;
    SMS_SENDER_NUMBER: string;

    SMTP_HOST: string;
    SMTP_USER: string;
    SMTP_PASSWORD: string;
    TZ: string;

    PORTONE_IMP_ID: string;
    PORTONE_SECRET_KEY: string;
    PORTONE_REST_API_KEY: string;
  }
}
