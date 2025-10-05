import { request, FullConfig } from '@playwright/test';
import fs from 'fs';

async function globalSetup(config: FullConfig) {
  const requestContext = await request.newContext();

  // Без логина — просто создаём пустое состояние
  await requestContext.storageState({ path: 'auth.json' });
  await requestContext.dispose();

  console.log('ℹAuth skipped: created empty auth.json');
}

export default globalSetup;