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