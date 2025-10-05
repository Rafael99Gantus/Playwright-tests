import { test, expect, request } from '@playwright/test';

// Тесты выполняются в курсе "Course with students book"
// Авторизация берётся из auth.json (storageState)

test.describe('Карточки, Новое слово', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto('https://test.c2hero.com/');
    await page.getByText('Вход').click();
    await page.getByRole('textbox', { name: 'Email' }).fill('testlingvotronic@gmail.com');
    await page.getByText('Пароль', { exact: true }).click();
    await page.getByRole('textbox', { name: 'Пароль' }).fill('123456Test');
    await page.getByRole('button', { name: 'Войти' }).click();
    await page.getByRole('navigation').getByRole('button').filter({ hasText: /^$/ }).click();
    await page.getByRole('menuitem', { name: 'Пользователь' }).click();
  });

  test('Сброс курса', async ({ page }) => {
    await page
      .locator('lt-course-preview', { hasText: 'Course with students book' })
      .locator('[data-cy=open-menu]').click();
    await page.locator('[data-cy=reset-progress]').click();
    await page.locator('[data-cy=alert-dialog-confirm]').click();
    await page.waitForTimeout(1000);
  });

  test('Общий дизайн карточки "Новое слово"', async ({ page }) => {
    await page
      .locator('lt-course-preview', { hasText: 'Course with students book' })
      .locator('[data-cy=course-preview-cards-btn]').click();
    await expect(page).toHaveURL(/\/home\/user\/learn\/cards/);

    const card = page.locator('[data-cy=learning-card]');
    const bg = await page.getByRole('button', { name: 'Продолжить' }).evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bg.replace(/\s+/g, '')).toContain('64,179,79');

    await expect(card.locator('lt-learning-panel')).toBeVisible();
    await expect(card.locator('lt-card-body')).toBeVisible();
    await expect(card.locator('[data-cy=complete-btn]')).toBeVisible();
    await expect(card.locator('[data-cy=open-menu]')).toBeVisible();
    await expect(card.locator('[data-mat-icon-name="card-speaker-icon"]')).toBeVisible();

    await expect(card.locator('lt-study-degree')).toHaveText(' 0 ');
    const segments = page.locator('[data-cy=learning-card] .progress__segment');
    await expect(segments).toHaveCount(4);
    await expect(segments.first()).toBeVisible();

    const btn = page.getByRole('button', { name: 'Продолжить' });
    await expect(btn).toHaveCSS('background-color', 'rgb(64, 179, 79)');
  });

  test('У кнопки "Продолжить" есть тултип с текстом', async ({ page }) => {
    await page.locator('[data-cy=course-preview-cards-btn]').click({ force: true });
    await expect(page).toHaveURL(/\/cards/);

    const btn = page.locator('[data-cy=cards-btn-next]');
    await btn.hover();

    const tooltip = page.locator('div.tooltip__simple-text');
    await expect(tooltip).toBeVisible();
    const text = await tooltip.textContent();
    expect(text?.trim()).toContain('Продолжить (Пробел)');
  });

  test('Нажатие на "Продолжить"', async ({ page }) => {
    await page.locator('[data-cy=course-preview-cards-btn]').click();
    await expect(page).toHaveURL(/\/cards/);

    const card = page.locator('[data-cy=learning-card]').first();

    await page.route('**/GetScopedQuestion**', (route) => route.continue());
    await page.route('**/GetStatistics**', (route) => route.continue());
    await page.route('**/api/Learn/Answer', (route) => route.continue());

    await card.locator('[data-cy=cards-btn-next]').click();
    await expect(page.locator('.ng-animating')).toBeVisible();

    // Проверяем, что запросы прошли
    // (Playwright не ждёт их так же, как Cypress, но можно проверить network logs позже)
  });

  test('Сохранение состояния "Новое слово" при переходе', async ({ page }) => {
    await page.locator('[data-cy=course-preview-cards-btn]').click();
    await expect(page).toHaveURL(/\/cards/);

    const card = page.locator('[data-cy=learning-card]').first();
    await expect(card).toBeVisible();

    await page.locator('[data-mat-icon-name="previous"]').click();
    await expect(page.getByText('Просмотр')).toBeVisible();

    await page.locator('[data-mat-icon-name="next"]').click();
    await expect(page.getByText('Новое слово')).toBeVisible();
  });

  test('Отправка запроса на звуковой файл', async ({ request }) => {
    const res = await request.get('/api/VoiceActing/GetVoiceActing?id=adfc2b30-4627-4213-b985-62d7ef800137');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('audio/mp3');
  });

  test('Иконка "Пояснение" — открытие и закрытие', async ({ page }) => {
    await page.locator('[data-cy=course-preview-cards-btn]').click();
    await expect(page).toHaveURL(/\/cards/);

    const card = page.locator('[data-cy=learning-card]').first();
    await card.locator('[data-cy=btn-note]').click();

    const dialog = page.locator('[data-cy=lt-note-dialog]');
    await expect(dialog).toBeVisible();

    await dialog.locator('[data-cy=dialog-close]').click();
    await expect(dialog).not.toBeVisible();

    await expect(card.getByText('Новое слово')).toHaveCSS('color', 'rgb(64, 179, 79)');
    await expect(card.locator('lt-study-degree')).toHaveText(' 0 ');
    await expect(card.locator('.progress__segment')).toHaveCount(4);
  });
});