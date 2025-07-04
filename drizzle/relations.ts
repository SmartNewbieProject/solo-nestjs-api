import { relations } from "drizzle-orm/relations";
import { users, comments, articles, likes, matchingFailureLogs, hotArticles, profiles, matches, additionalPreferences, articleCategories, payHistories, reports, tickets, universityDetails, userPreferences, profileImages, images } from "./schema";

export const commentsRelations = relations(comments, ({one, many}) => ({
	user: one(users, {
		fields: [comments.authorId],
		references: [users.id]
	}),
	comment: one(comments, {
		fields: [comments.parentId],
		references: [comments.id],
		relationName: "comments_parentId_comments_id"
	}),
	comments: many(comments, {
		relationName: "comments_parentId_comments_id"
	}),
	article: one(articles, {
		fields: [comments.articleId],
		references: [articles.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	comments: many(comments),
	likes: many(likes),
	matchingFailureLogs: many(matchingFailureLogs),
	profiles: many(profiles),
	matches_myId: many(matches, {
		relationName: "matches_myId_users_id"
	}),
	matches_matcherId: many(matches, {
		relationName: "matches_matcherId_users_id"
	}),
	articles: many(articles),
	payHistories: many(payHistories),
	reports_reporterId: many(reports, {
		relationName: "reports_reporterId_users_id"
	}),
	reports_reportedId: many(reports, {
		relationName: "reports_reportedId_users_id"
	}),
	tickets: many(tickets),
	universityDetails: many(universityDetails),
	userPreferences: many(userPreferences),
}));

export const articlesRelations = relations(articles, ({one, many}) => ({
	comments: many(comments),
	likes: many(likes),
	hotArticles: many(hotArticles),
	user: one(users, {
		fields: [articles.authorId],
		references: [users.id]
	}),
	articleCategory: one(articleCategories, {
		fields: [articles.categoryId],
		references: [articleCategories.id]
	}),
	reports: many(reports),
}));

export const likesRelations = relations(likes, ({one}) => ({
	user: one(users, {
		fields: [likes.userId],
		references: [users.id]
	}),
	article: one(articles, {
		fields: [likes.articleId],
		references: [articles.id]
	}),
}));

export const matchingFailureLogsRelations = relations(matchingFailureLogs, ({one}) => ({
	user: one(users, {
		fields: [matchingFailureLogs.userId],
		references: [users.id]
	}),
}));

export const hotArticlesRelations = relations(hotArticles, ({one}) => ({
	article: one(articles, {
		fields: [hotArticles.articleId],
		references: [articles.id]
	}),
}));

export const profilesRelations = relations(profiles, ({one, many}) => ({
	user: one(users, {
		fields: [profiles.userId],
		references: [users.id]
	}),
	additionalPreferences: many(additionalPreferences),
	profileImages: many(profileImages),
}));

export const matchesRelations = relations(matches, ({one}) => ({
	user_myId: one(users, {
		fields: [matches.myId],
		references: [users.id],
		relationName: "matches_myId_users_id"
	}),
	user_matcherId: one(users, {
		fields: [matches.matcherId],
		references: [users.id],
		relationName: "matches_matcherId_users_id"
	}),
}));

export const additionalPreferencesRelations = relations(additionalPreferences, ({one}) => ({
	profile: one(profiles, {
		fields: [additionalPreferences.profileId],
		references: [profiles.id]
	}),
}));

export const articleCategoriesRelations = relations(articleCategories, ({many}) => ({
	articles: many(articles),
}));

export const payHistoriesRelations = relations(payHistories, ({one}) => ({
	user: one(users, {
		fields: [payHistories.userId],
		references: [users.id]
	}),
}));

export const reportsRelations = relations(reports, ({one}) => ({
	article: one(articles, {
		fields: [reports.postId],
		references: [articles.id]
	}),
	user_reporterId: one(users, {
		fields: [reports.reporterId],
		references: [users.id],
		relationName: "reports_reporterId_users_id"
	}),
	user_reportedId: one(users, {
		fields: [reports.reportedId],
		references: [users.id],
		relationName: "reports_reportedId_users_id"
	}),
}));

export const ticketsRelations = relations(tickets, ({one}) => ({
	user: one(users, {
		fields: [tickets.userId],
		references: [users.id]
	}),
}));

export const universityDetailsRelations = relations(universityDetails, ({one}) => ({
	user: one(users, {
		fields: [universityDetails.userId],
		references: [users.id]
	}),
}));

export const userPreferencesRelations = relations(userPreferences, ({one}) => ({
	user: one(users, {
		fields: [userPreferences.userId],
		references: [users.id]
	}),
}));

export const profileImagesRelations = relations(profileImages, ({one}) => ({
	profile: one(profiles, {
		fields: [profileImages.profileId],
		references: [profiles.id]
	}),
	image: one(images, {
		fields: [profileImages.imageId],
		references: [images.id]
	}),
}));

export const imagesRelations = relations(images, ({many}) => ({
	profileImages: many(profileImages),
}));