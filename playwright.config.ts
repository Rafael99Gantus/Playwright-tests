import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    ['html'],
    ['allure-playwright']
  ],

  // подключаем глобальный setup
  globalSetup: require.resolve('./global-setup'),

  use: {
    // BASE_URL остаётся как было
    baseURL: process.env.BASE_URL || 'https://test.c2hero.com',

    // подключаем авторизацию
    storageState: 'auth.json',
  },
});