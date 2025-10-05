# Playwright (TypeScript) — демо-проект автотестов

Автотесты **E2E + API** на Playwright. Цель: показать вход через UI, базовые сценарии «Карточек», мини-набор API, отчёты и CI.

---

## 💾 Требования
- Node.js **20+**
- Git
- (браузеры ставятся автоматически: `npx playwright install --with-deps`)

---

## ⚙️ Установка и запуск
```bash
npm ci
# BASE_URL задаётся через .env или переменную окружения
# пример .env:
# BASE_URL=https://test.c2hero.com

npm start          # headless прогон всех тестов (UI+API)
npm test           # UI-режим Playwright (с окном)
npm run report     # открыть последний HTML-отчёт (playwright-report)
npm run test:api   # прогон только API-тестов (tests/api)
npm run save:report  # сохранить отчёт в ./reports/<номер>_run-YYYY-MM-DD_HH-MM-SS и открыть
🔑 Переменные окружения
Проект читает BASE_URL.

Способы задать:

файл .env в корне:

env
Копировать код
BASE_URL=https://test.c2hero.com
или напрямую:

bash
Копировать код
BASE_URL=https://test.c2hero.com npm start
📁 Структура
csharp
Копировать код
tests/
  helpers/
    auth.ts            # логин через UI (без storageState)
  api/
    basic.spec.ts      # VoiceActing: 200/400/404/405 и т.п.
  e2e.smoke.spec.ts    # 2 стабильных E2E по «Карточкам»
  mocks.spec.ts        # шаблон моков (можно включить/выключить)
playwright.config.ts   # baseURL, trace/screenshot/video политики
global-setup.ts        # нейтральный (не блокирует прогон)
🔐 Авторизация (через UI)
По умолчанию проект логинится через UI (без auth.json) — устойчиво для демо и CI.

ts
Копировать код
// tests/helpers/auth.ts (фрагмент)
import { Page, expect } from '@playwright/test';

export async function loginUI(page: Page, opts?: { email?: string; password?: string }) {
  const email = opts?.email ?? 'testlingvotronic@gmail.com';
  const password = opts?.password ?? '123456Test';

  await page.goto('/identity/sign-in');
  await page.locator('input[type="email"], input[name*="email" i]').first().fill(email);
  await page.locator('input[type="password"], input[name*="pass" i]').first().fill(password);
  await page.getByRole('button', { name: /войти|login|sign in/i }).click();
  await expect(page).toHaveURL(/\/home\/courses\/inprogress|\/courses/);
}
Нужен pre-auth? Можно записать:
npx playwright codegen https://…/identity/sign-in --save-storage=auth.json и в конфиг use.storageState = 'auth.json'.

🧪 E2E (что проверяем)
Вход через UI → «Мои курсы».

Открыть Course with students book → перейти в Карточки.

Нажать «Продолжить», убедиться, что карточка реагирует.

Практики для стабильности:

Динамические URL → проверяем через RegExp:
await expect(page).toHaveURL(/\/home\/user\/learn\/cards/);

Цвета → проверяем числами/RegExp (а не точным 'rgb(...)').

Локаторы → уточняем контейнером ({ hasText: '...' }, .nth()), избегаем strict mode violation.

🌐 API-тесты
tests/api/basic.spec.ts — сценарии для /api/VoiceActing/GetVoiceActing:

200 для существующего id + проверка content-type: audio/mp3;

400 для невалидного id;

404/400 для несуществующего UUID;

405 для неподдерживаемых методов (POST/HEAD);

404/400 для запроса без id.

Запуск: npm run test:api.

🎭 Моки UI (шаблон)
Перехватываем запрос до действия и подменяем ответ:

ts
Копировать код
const url = '**/api/Learn/GetScopedQuestion**';

await page.route(url, r => r.fulfill({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify({ question: { id: 'q1', term: 'hello', translation: 'привет' } }),
}));

// триггерим запрос (например, кнопкой «Продолжить»)
await page.locator('[data-cy=cards-btn-next]').click();

// проверяем UI...
await page.unroute(url);
Правила:

page.route() ставим до клика/навигации,

после теста — await page.unroute(url),

фильтруем по маске **/api/....

🧾 Отчёты
HTML-отчёт: playwright-report/ → npm run report

История: npm run save:report (сохраняет в ./reports/... и открывает)

🤖 CI (GitHub Actions)
Файл .github/workflows/playwright.yml:

Устанавливает Node и браузеры,

Гоняет UI и API,

Сохраняет HTML-отчёт артефактом.

yaml
Копировать код
name: Playwright Tests
on:
  push: { branches: [ main ] }
  pull_request: {}
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - name: Run UI tests
        run: npm run start
        env: { BASE_URL: "https://test.c2hero.com" }
      - name: Run API tests
        run: npx playwright test tests/api --reporter=list
        env: { BASE_URL: "https://test.c2hero.com" }
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with: { name: playwright-report, path: playwright-report/ }
🧯 Траблшутинг (коротко)
Invalid URL → проверь BASE_URL (локально и в CI).

Редирект на логин → логин через loginUI() в beforeEach или актуализируй auth.json.

strict mode violation → уточни локатор (.nth(), .first(), toHaveCount()).

Динамический URL → expect(page).toHaveURL(/\/нужный\/путь/).

Проверка цвета → RegExp/компоненты, не строгий 'rgb(...)'.