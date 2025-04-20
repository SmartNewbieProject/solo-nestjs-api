declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    DATABASE_USER: string;
    DATABASE_HOST: string;
    DATABASE_PORT: string;
    DATABASE_NAME: string;
    PORTONE_SECRET_KEY: string;
    COOL_SMS_SECRET_KEY: string;
    COOL_SMS_API_KEY: string;
    SMS_SENDER_NUMBER: string;
  }
}
