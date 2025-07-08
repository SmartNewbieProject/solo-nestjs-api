ALTER TABLE "gem_feature_costs" RENAME COLUMN "costId" TO "id";
ALTER TABLE "gem_payments" RENAME COLUMN "paymentId" TO "id";
ALTER TABLE "gem_products" RENAME COLUMN "productId" TO "id";
ALTER TABLE "gem_payments" DROP CONSTRAINT "gem_payments_product_id_gem_products_productId_fk";

ALTER TABLE "gem_transactions" ADD COLUMN "id" varchar(128) PRIMARY KEY NOT NULL;
ALTER TABLE "gem_payments" ADD CONSTRAINT "gem_payments_product_id_gem_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."gem_products"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "gem_transactions" DROP COLUMN "transactionId";
ALTER TABLE "gem_transactions" DROP COLUMN "reference_id";