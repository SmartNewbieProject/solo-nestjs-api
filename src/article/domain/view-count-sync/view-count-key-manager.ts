export class ViewCountKeyManager {
  private readonly prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  getViewCountKey(articleId: string): string {
    return `${this.prefix}${articleId}`;
  }

  extractArticleId(key: string): string {
    return key.replace(this.prefix, '');
  }

  getViewCountPattern(): string {
    return `${this.prefix}*`;
  }

  getUserViewKey(articleId: string, userId: string): string {
    const key = this.getViewCountKey(articleId);
    return `${key}:user:${userId}`;
  }
}
