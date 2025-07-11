import { pgTable, varchar, timestamp, text, unique, boolean, integer, foreignKey, numeric, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const preferenceTarget = pgEnum("preference_target", ['PARTNER', 'SELF'])


export const matchingRequests = pgTable("matching_requests", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	userId: varchar("user_id", { length: 128 }),
	score: varchar({ length: 36 }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
});

export const preferenceOptions = pgTable("preference_options", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	imageUrl: text("image_url"),
	preferenceTypeId: varchar("preference_type_id", { length: 128 }),
	value: varchar({ length: 100 }).notNull(),
	displayName: varchar("display_name", { length: 100 }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
});

export const preferenceTypes = pgTable("preference_types", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	multiSelect: boolean("multi_select").default(false).notNull(),
	maximumChoiceCount: integer("maximum_choice_count").default(1).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("preference_types_code_unique").on(table.code),
]);

export const images = pgTable("images", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	s3Url: varchar("s3_url", { length: 255 }).notNull(),
	s3Key: varchar("s3_key", { length: 255 }),
	originalFilename: varchar("original_filename", { length: 255 }),
	mimeType: varchar("mime_type", { length: 100 }),
	sizeInBytes: integer("size_in_bytes"),
	isVerified: boolean("is_verified").default(false),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
});

export const smsAuthorization = pgTable("sms_authorization", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	phoneNumber: varchar("phone_number", { length: 15 }).notNull(),
	uniqueKey: varchar("unique_key", { length: 62 }).notNull(),
	authorizationCode: varchar("authorization_code", { length: 12 }).notNull(),
	isAuthorized: boolean("is_authorized").default(false).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
});

export const comments = pgTable("comments", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	authorId: varchar("author_id", { length: 36 }).notNull(),
	articleId: varchar("article_id", { length: 36 }).notNull(),
	content: varchar({ length: 255 }).notNull(),
	nickname: varchar({ length: 15 }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	parentId: varchar("parent_id", { length: 36 }),
	blindedAt: timestamp("blinded_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "comments_author_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "comments_parent_id_comments_id_fk"
		}),
	foreignKey({
			columns: [table.articleId],
			foreignColumns: [articles.id],
			name: "comments_article_id_articles_id_fk"
		}),
]);

export const likes = pgTable("likes", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	userId: varchar("user_id", { length: 128 }).notNull(),
	articleId: varchar("article_id", { length: 128 }).notNull(),
	up: boolean().default(false).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "likes_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.articleId],
			foreignColumns: [articles.id],
			name: "likes_article_id_articles_id_fk"
		}),
]);

export const userRangePreferences = pgTable("user_range_preferences", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	userPreferenceId: varchar("user_preference_id", { length: 36 }),
	preferenceTypeId: varchar("preference_type_id", { length: 36 }),
	minValue: integer("min_value"),
	maxValue: integer("max_value"),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
});

export const userPreferenceOptions = pgTable("user_preference_options", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	userPreferenceId: varchar("user_preference_id", { length: 36 }).notNull(),
	preferenceOptionId: varchar("preference_option_id", { length: 36 }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	preferenceTarget: preferenceTarget("preference_target").default('PARTNER').notNull(),
});

export const users = pgTable("users", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	name: varchar({ length: 15 }).notNull(),
	email: varchar({ length: 100 }),
	password: varchar({ length: 100 }),
	phoneNumber: varchar("phone_number", { length: 16 }).notNull(),
	profileId: varchar("profile_id", { length: 36 }),
	oauthProvider: varchar("oauth_provider", { length: 30 }),
	refreshToken: varchar("refresh_token", { length: 500 }),
	role: varchar({ length: 10 }).default('user').notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	suspendedAt: timestamp("suspended_at", { mode: 'string' }),
});

export const articleCategories = pgTable("article_categories", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	emojiUrl: text("emoji_url").notNull(),
	displayName: varchar("display_name", { length: 20 }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	code: varchar({ length: 15 }).notNull(),
});

export const withdrawalReasons = pgTable("withdrawal_reasons", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	userId: varchar("user_id", { length: 128 }).notNull(),
	reason: varchar().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
});

export const matchingFailureLogs = pgTable("matching_failure_logs", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	userId: varchar("user_id", { length: 128 }).notNull(),
	reason: text().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "matching_failure_logs_user_id_users_id_fk"
		}),
]);

export const hotArticles = pgTable("hot_articles", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	articleId: varchar("article_id", { length: 128 }).notNull(),
	curatorComment: varchar("curator_comment", { length: 255 }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.articleId],
			foreignColumns: [articles.id],
			name: "hot_articles_article_id_articles_id_fk"
		}),
]);

export const profiles = pgTable("profiles", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	userId: varchar("user_id", { length: 128 }).notNull(),
	age: integer().notNull(),
	gender: varchar({ length: 10 }).notNull(),
	name: varchar({ length: 15 }).notNull(),
	title: varchar({ length: 100 }),
	instagramId: varchar("instagram_id", { length: 100 }),
	introduction: varchar({ length: 255 }),
	universityDetailId: varchar("university_detail_id", { length: 36 }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	isMatchingEnable: boolean("is_matching_enable").default(true).notNull(),
	rank: varchar({ length: 7 }).default('UNKNOWN').notNull(),
	mbti: varchar({ length: 4 }),
	statusAt: varchar("status_at", { length: 16 }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "profiles_user_id_users_id_fk"
		}),
	unique("profiles_user_id_unique").on(table.userId),
]);

export const matches = pgTable("matches", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	myId: varchar("my_id", { length: 128 }).notNull(),
	matcherId: varchar("matcher_id", { length: 128 }),
	score: numeric({ precision: 8, scale:  2 }).notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }).notNull(),
	type: varchar({ length: 30 }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	direct: boolean().default(false),
	expiredAt: timestamp("expired_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.myId],
			foreignColumns: [users.id],
			name: "matches_my_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.matcherId],
			foreignColumns: [users.id],
			name: "matches_matcher_id_users_id_fk"
		}),
]);

export const additionalPreferences = pgTable("additional_preferences", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	goodMbti: varchar("good_mbti", { length: 4 }),
	badMbti: varchar("bad_mbti", { length: 4 }),
	profileId: varchar("profile_id").notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.profileId],
			foreignColumns: [profiles.id],
			name: "additional_preferences_profile_id_profiles_id_fk"
		}),
	unique("additional_preferences_profile_id_unique").on(table.profileId),
]);

export const articles = pgTable("articles", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	authorId: varchar("author_id", { length: 128 }).notNull(),
	content: varchar({ length: 255 }).notNull(),
	anonymous: varchar({ length: 15 }),
	likeCount: integer("like_count").default(0).notNull(),
	blindedAt: timestamp("blinded_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	categoryId: varchar("category_id", { length: 128 }).notNull(),
	readCount: integer("read_count").default(0).notNull(),
	title: varchar({ length: 30 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "articles_author_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [articleCategories.id],
			name: "articles_category_id_article_categories_id_fk"
		}),
]);

export const payHistories = pgTable("pay_histories", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	amount: integer().notNull(),
	userId: varchar("user_id", { length: 128 }).notNull(),
	method: varchar({ length: 50 }),
	orderId: varchar("order_id", { length: 128 }),
	orderName: varchar("order_name", { length: 30 }).notNull(),
	txId: varchar("tx_id"),
	paymentKey: varchar("payment_key", { length: 128 }),
	receiptUrl: text("receipt_url"),
	paidAt: timestamp("paid_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "pay_histories_user_id_users_id_fk"
		}),
]);

export const reports = pgTable("reports", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	postId: varchar("post_id", { length: 128 }).notNull(),
	reporterId: varchar("reporter_id", { length: 128 }).notNull(),
	reportedId: varchar("reported_id", { length: 128 }).notNull(),
	reason: varchar({ length: 255 }),
	status: varchar({ length: 15 }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [articles.id],
			name: "reports_post_id_articles_id_fk"
		}),
	foreignKey({
			columns: [table.reporterId],
			foreignColumns: [users.id],
			name: "reports_reporter_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.reportedId],
			foreignColumns: [users.id],
			name: "reports_reported_id_users_id_fk"
		}),
]);

export const tickets = pgTable("tickets", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	name: varchar({ length: 30 }).notNull(),
	userId: varchar("user_id", { length: 128 }).notNull(),
	status: varchar({ length: 10 }).notNull(),
	type: varchar({ length: 10 }).notNull(),
	expiredAt: timestamp("expired_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	usedAt: timestamp("used_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "tickets_user_id_users_id_fk"
		}),
]);

export const universityDetails = pgTable("university_details", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	universityName: varchar("university_name", { length: 30 }).notNull(),
	department: varchar({ length: 30 }).notNull(),
	authentication: boolean().default(false).notNull(),
	grade: varchar({ length: 10 }).notNull(),
	studentNumber: varchar("student_number", { length: 10 }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "university_details_user_id_users_id_fk"
		}),
]);

export const userPreferences = pgTable("user_preferences", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	distanceMax: varchar("distance_max", { length: 36 }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_preferences_user_id_users_id_fk"
		}),
	unique("user_preferences_user_id_unique").on(table.userId),
]);

export const profileImages = pgTable("profile_images", {
	id: varchar({ length: 128 }).primaryKey().notNull(),
	profileId: varchar("profile_id", { length: 36 }).notNull(),
	imageId: varchar("image_id", { length: 36 }).notNull(),
	imageOrder: integer("image_order").notNull(),
	isMain: boolean("is_main").default(false).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.profileId],
			foreignColumns: [profiles.id],
			name: "profile_images_profile_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.imageId],
			foreignColumns: [images.id],
			name: "profile_images_image_id_images_id_fk"
		}),
]);
