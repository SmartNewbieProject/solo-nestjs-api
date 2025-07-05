DO $$ BEGIN
CREATE TYPE "feature_type" AS ENUM('PROFILE_OPEN', 'LIKE_MESSAGE', 'CHAT_START', 'PREMIUM_FILTER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
CREATE TYPE "payment_method" AS ENUM('CARD', 'BANK_TRANSFER', 'MOBILE', 'KAKAO_PAY', 'NAVER_PAY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
CREATE TYPE "payment_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
CREATE TYPE "gem_transaction_type" AS ENUM('CHARGE', 'CONSUME');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
CREATE TYPE "gem_reference_type" AS ENUM('PAYMENT', 'PROFILE_OPEN', 'LIKE_MESSAGE', 'CHAT', 'FILTER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE "gem_daily_stats" (
                                   "statId" varchar(128) PRIMARY KEY NOT NULL,
                                   "date" date NOT NULL,
                                   "feature_type" "feature_type" NOT NULL,
                                   "total_usage_count" integer DEFAULT 0 NOT NULL,
                                   "total_gems_consumed" integer DEFAULT 0 NOT NULL,
                                   "unique_users" integer DEFAULT 0 NOT NULL,
                                   "success_rate" numeric(5, 2) DEFAULT '0.00' NOT NULL,
                                   "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "gem_feature_costs" (
                                     "costId" varchar(128) PRIMARY KEY NOT NULL,
                                     "feature_type" "feature_type" NOT NULL,
                                     "gem_cost" integer NOT NULL,
                                     "description" text,
                                     "is_active" boolean DEFAULT true NOT NULL,
                                     "effective_from" timestamp with time zone DEFAULT now() NOT NULL,
                                     "updated_at" timestamp with time zone,
                                     "created_at" timestamp with time zone DEFAULT now() NOT NULL,
                                     "deleted_at" timestamp with time zone,
                                     CONSTRAINT "gem_feature_costs_feature_type_unique" UNIQUE("feature_type")
);

CREATE TABLE "gem_payments" (
                                "paymentId" varchar(128) PRIMARY KEY NOT NULL,
                                "user_id" varchar(128) NOT NULL,
                                "product_id" varchar(128) NOT NULL,
                                "payment_method" "payment_method" NOT NULL,
                                "payment_amount" integer NOT NULL,
                                "payment_status" "payment_status" DEFAULT 'PENDING' NOT NULL,
                                "pg_transaction_id" varchar(255),
                                "receipt_url" text,
                                "paid_at" timestamp with time zone,
                                "updated_at" timestamp with time zone,
                                "created_at" timestamp with time zone DEFAULT now() NOT NULL,
                                "deleted_at" timestamp with time zone
);

CREATE TABLE "gem_products" (
                                "id" varchar(128) PRIMARY KEY NOT NULL,
                                "product_name" varchar(255) NOT NULL,
                                "gem_amount" integer NOT NULL,
                                "bonus_gems" integer DEFAULT 0 NOT NULL,
                                "total_gems" integer NOT NULL,
                                "price" integer NOT NULL,
                                "discount_rate" integer DEFAULT 0 NOT NULL,
                                "sort_order" integer DEFAULT 0 NOT NULL,
                                "is_active" boolean DEFAULT true NOT NULL,
                                "updated_at" timestamp with time zone,
                                "created_at" timestamp with time zone DEFAULT now() NOT NULL,
                                "deleted_at" timestamp with time zone
);

CREATE TABLE "gem_transactions" (
                                    "transactionId" varchar(128) PRIMARY KEY NOT NULL,
                                    "user_id" varchar(128) NOT NULL,
                                    "transaction_type" "gem_transaction_type" NOT NULL,
                                    "gem_amount" integer NOT NULL,
                                    "balance_before" integer NOT NULL,
                                    "balance_after" integer NOT NULL,
                                    "reference_type" "gem_reference_type" NOT NULL,
                                    "reference_id" varchar(128),
                                    "description" text,
                                    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "user_gems" (
                             "user_id" varchar(128) PRIMARY KEY NOT NULL,
                             "gem_balance" integer DEFAULT 0 NOT NULL,
                             "total_charged" integer DEFAULT 0 NOT NULL,
                             "total_consumed" integer DEFAULT 0 NOT NULL,
                             "last_transaction_at" timestamp with time zone,
                             "updated_at" timestamp with time zone,
                             "created_at" timestamp with time zone DEFAULT now() NOT NULL,
                             "deleted_at" timestamp with time zone
);

ALTER TABLE "gem_payments" ADD CONSTRAINT "gem_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
INSERT INTO "gem_products" ("id", "product_name", "gem_amount", "bonus_gems", "total_gems", "price", "discount_rate", "sort_order") VALUES
('613cc729-dc80-4312-8dad-43b8c2ece6be', '스타터 팩', 15, 0, 15, 8800, 0, 1),
('15e3c44a-b570-4651-95ef-26e506dfde3b', '베이직 팩', 30, 0, 30, 14000, 0, 2),
('112e035b-38f4-46d2-924e-58c20409b425', '스탠다드 팩', 60, 0, 60, 22000, 0, 3),
('b83479c6-e227-468d-b9b5-2766d1db62d5', '플러스 팩', 130, 0, 130, 39000, 0, 4),
('6664f489-2963-49da-841e-6e0f5b72f36c', '프리미엄 팩', 200, 0, 200, 57900, 0, 5),
('ffab8bf2-5946-417e-ae72-9a07c1ac274a', '메가 팩', 400, 0, 400, 109000, 0, 6),
('a188e018-ecf2-4a9d-8e22-84f961f9d298', '울트라 팩', 500, 0, 500, 129000, 0, 7),
('0914b11e-71c4-4b3b-a353-612a566a4f28', '맥시멈 팩', 800, 0, 800, 198000, 0, 8);

ALTER TABLE "gem_payments" ADD CONSTRAINT "gem_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "gem_payments" ADD CONSTRAINT "gem_payments_product_id_gem_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."gem_products"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "gem_transactions" ADD CONSTRAINT "gem_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_gems" ADD CONSTRAINT "user_gems_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;