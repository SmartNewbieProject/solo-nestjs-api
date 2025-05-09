import { sql } from 'drizzle-orm';

/**
 * 이 마이그레이션은 timestamp 필드의 모드를 변경하지 않습니다.
 * 실제로는 스키마 정의(helper.ts)에서 모드를 변경하고,
 * 새로운 스키마를 생성하는 방식으로 적용됩니다.
 * 
 * 이 파일은 변경 내용을 문서화하는 용도로 사용됩니다.
 */
export async function up(db: any): Promise<void> {
  // 데이터베이스 시간대 설정 확인
  await db.execute(sql`SHOW timezone;`);
  
  // 시간대 설정이 Asia/Seoul인지 확인하고, 아니라면 설정
  await db.execute(sql`SET timezone = 'Asia/Seoul';`);
  
  console.log('타임스탬프 모드가 { mode: "date" }로 변경되었습니다.');
  console.log('이 변경은 src/database/schema/helper.ts 파일에서 이루어졌습니다.');
}

export async function down(db: any): Promise<void> {
  console.log('이 마이그레이션은 롤백할 필요가 없습니다.');
  console.log('필요한 경우 src/database/schema/helper.ts 파일을 수동으로 수정하세요.');
}
