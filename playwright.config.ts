import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    ['html'],
    ['allure-playwright']
  ],
  use: { baseURL: process.env.BASE_URL },
});