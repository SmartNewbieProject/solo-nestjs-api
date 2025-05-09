import { Test, TestingModule } from '@nestjs/testing';
import { AnonymousNameService } from '../../src/article/services/anonymous-name.service';
import * as bcrypt from 'bcryptjs';

describe('AnonymousNameService', () => {
  let service: AnonymousNameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnonymousNameService],
    }).compile();

    service = module.get<AnonymousNameService>(AnonymousNameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('same name should generate same anonymous name', async () => {
    const name = '홍길동';
    const anonymousName1 = await service.generateAnonymousName(name);
    const anonymousName2 = await service.generateAnonymousName(name);

    expect(anonymousName1).toBe(anonymousName2);
  });

  describe('generateAnonymousName', () => {
    it('should generate different anonymous names for different inputs', async () => {
      const name1 = '홍길동';
      const name2 = '김철수';

      const anonymousName1 = await service.generateAnonymousName(name1);
      const anonymousName2 = await service.generateAnonymousName(name2);

      expect(anonymousName1).toBeDefined();
      expect(anonymousName2).toBeDefined();
      expect(anonymousName1).not.toBe(anonymousName2);
    });

    it('should generate valid anonymous name format', async () => {
      const name = '홍길동';
      const anonymousName = await service.generateAnonymousName(name);

      // 익명 이름은 "수식어 동물" 형식이어야 함
      const parts = anonymousName.split(' ');
      expect(parts.length).toBe(2);
      expect(parts[0]).toMatch(/^[가-힣]+$/); // 수식어는 한글
      expect(parts[1]).toMatch(/^[가-힣]+$/); // 동물 이름은 한글
    });
  });

  it('same name should generate same anonymous name', async () => {
    const name = '홍길동';
    const anonymousName1 = await service.generateAnonymousName(name);
    const anonymousName2 = await service.generateAnonymousName(name);

    expect(anonymousName1).toBe(anonymousName2);
  });

  describe('getConsistentAnonymousName', () => {
    it('should generate same anonymous name for same input', async () => {
      const name = '홍길동';

      const anonymousName1 = await service.getConsistentAnonymousName(name);
      const anonymousName2 = await service.getConsistentAnonymousName(name);

      expect(anonymousName1).toBe(anonymousName2);
    });

    it('should generate different anonymous names for different inputs', async () => {
      const name1 = '홍길동';
      const name2 = '김철수';

      const anonymousName1 = await service.getConsistentAnonymousName(name1);
      const anonymousName2 = await service.getConsistentAnonymousName(name2);

      expect(anonymousName1).not.toBe(anonymousName2);
    });
  });

  describe('bcrypt integration', () => {
    it('should use bcrypt for hashing', async () => {
      const name = '홍길동';
      const spy = jest.spyOn(bcrypt, 'hash');

      await service.generateAnonymousName(name);

      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0]).toBe(name);
      expect(spy.mock.calls[0][1]).toBeDefined(); // salt가 전달되었는지 확인
    });
  });
});
