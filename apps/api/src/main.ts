import { AppModule } from './app.module';

async function bootstrap() {
  console.log('[Poco API] Backend modular API initialized.');
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap().catch(console.error);
}

export { bootstrap, AppModule };
