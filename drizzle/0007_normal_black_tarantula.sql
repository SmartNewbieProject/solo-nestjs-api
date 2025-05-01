ALTER TABLE "comments" RENAME COLUMN "post_id" TO "article_id";
ALTER TABLE "comments" DROP CONSTRAINT "comments_post_id_articles_id_fk";

ALTER TABLE "withdrawal_reasons" ALTER COLUMN "reason" SET DATA TYPE varchar;
ALTER TABLE "comments" ADD CONSTRAINT "comments_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;