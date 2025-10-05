// tests/mocks.spec.ts
import { test, expect } from '@playwright/test';

test.describe.skip('Моки UI для экрана карточек', () => {
  test.beforeEach(async ({ page }) => {
     await page.goto('https://test.c2hero.com/');
    await page.getByText('Вход').click();
    await page.getByRole('textbox', { name: 'Email' }).fill('testlingvotronic@gmail.com');
    await page.getByText('Пароль', { exact: true }).click();
    await page.getByRole('textbox', { name: 'Пароль' }).fill('123456Test');
    await page.getByRole('button', { name: 'Войти' }).click();
    await page.getByRole('navigation').getByRole('button').filter({ hasText: /^$/ }).click();
    await page.getByRole('menuitem', { name: 'Пользователь' }).click();
  });

  test(' OK: отрисовываем данные при успешном ответе', async ({ page }) => {
    const url = '**/api/Learn/GetScopedQuestion**';

    await page.route(url, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({
          // TODO: положи минимальный валидный объект, который понимает твой UI
          question: { id: 'q1', term: 'hello', translation: 'привет' }
        }),
      });
    });

    // Триггерим запрос (например, кнопкой "Продолжить")
    await page.locator('[data-cy=cards-btn-next]').click();

    // TODO: замени на реальный признак, что данные отобразились
    await expect(page.locator('[data-cy=learning-card]')).toContainText('hello');

    // Чистим хук
    await page.unroute(url);
  });

  test(' Пусто: показываем empty-state при 200 и пустом ответе', async ({ page }) => {
    const url = '**/api/Learn/GetScopedQuestion**';

    await page.route(url, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({
          // TODO: такой пустой формат, который понимает фронт
          question: null
        }),
      });
    });

    await page.locator('[data-cy=cards-btn-next]').click();

    // TODO: замени на реальный селектор/текст пустого состояния
    await expect(page.locator('[data-cy=empty-state]')).toBeVisible();

    await page.unroute(url);
  });

  test(' Ошибка: показываем ошибку при 500', async ({ page }) => {
    const url = '**/api/Learn/GetScopedQuestion**';

    await page.route(url, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.locator('[data-cy=cards-btn-next]').click();

    // TODO: замени на реальный селектор/текст сообщения об ошибке
    await expect(page.getByText(/ошибка|не удалось|retry/i)).toBeVisible();

    await page.unroute(url);
  });
});