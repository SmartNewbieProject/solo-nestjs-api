import { relations } from 'drizzle-orm';
import { matchingRequests } from '../matching_requests';
import { profiles } from '../profiles';

export const matchingRequestsRelations = relations(
  matchingRequests,
  ({ many }) => ({
    user: many(profiles),
  }),
);
