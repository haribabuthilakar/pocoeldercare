import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`[Poco API] Backend modular API running on port ${port}`);
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap().catch(console.error);
}

export { bootstrap, AppModule };
