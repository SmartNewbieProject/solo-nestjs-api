import { CommandFactory } from 'nest-commander';
import { ConsoleModule } from './console/console.module';

async function bootstrap() {
  // 명령줄 인수를 올바르게 처리하기 위해 옵션 추가
  await CommandFactory.run(ConsoleModule, {
    logger: ['error', 'warn', 'log'],
    // 인수 처리 옵션 추가
    cliName: 'console',
    usePlugins: true,
    // 인수 전달 방식 지정
    serviceErrorHandler: (error) => {
      console.error('Error:', error);
      process.exit(1);
    }
  });
}

bootstrap();
