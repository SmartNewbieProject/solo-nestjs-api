import { Inject } from '@nestjs/common';

/**
 * Drizzle ORM 객체를 주입하기 위한 커스텀 데코레이터
 * 
 * @example
 * ```typescript
 * class SomeRepository {
 *   constructor(
 *     @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>
 *   ) {}
 * }
 * ```
 */
export const InjectDrizzle = () => Inject('DRIZZLE_ORM');
