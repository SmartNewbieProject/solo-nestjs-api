import { AuthorDetails } from "@/types/community";

export default class AnonymityHandler {
  static comment(anonymousName: string | null, authorDetails: AuthorDetails): AuthorDetails {
    if (anonymousName) {
      return {
        id:  authorDetails.id,
        name: anonymousName,
      }
    }
    return authorDetails;
  }
}
