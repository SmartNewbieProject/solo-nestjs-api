import { CommandFactory } from 'nest-commander';
import { ConsoleModule } from './console/console.module';

async function bootstrap() {
  // 명령줄 인수를 올바르게 처리하기 위해 옵션 추가
  await CommandFactory.run(ConsoleModule, {
    logger: ['error', 'warn', 'log'],
    cliName: 'console',
    usePlugins: true,
    serviceErrorHandler: (error) => {
      console.error('Error:', error);
      process.exit(1);
    },
  });
}

bootstrap();
