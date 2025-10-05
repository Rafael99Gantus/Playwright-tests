import { test, expect } from '@playwright/test';

test.describe('API: VoiceActing', () => {

  test('GET VoiceActing 200 (существующий id)', async ({ request }) => {
    const res = await request.get('/api/VoiceActing/GetVoiceActing?id=adfc2b30-4627-4213-b985-62d7ef800137');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('audio/mp3');
  });

  test('GET VoiceActing 400 (невалидный id)', async ({ request }) => {
    const res = await request.get('/api/VoiceActing/GetVoiceActing?id=invalid');
    expect([400, 404]).toContain(res.status());
  });

  test('GET VoiceActing 404 (несуществующий UUID)', async ({ request }) => {
    const res = await request.get('/api/VoiceActing/GetVoiceActing?id=00000000-0000-0000-0000-000000000000');
    expect([400, 404]).toContain(res.status());
  });

  test('POST VoiceActing без тела — ожидаем 405', async ({ request }) => {
    const res = await request.post('/api/VoiceActing/GetVoiceActing');
    expect(res.status()).toBe(405);
  });

  test('HEAD VoiceActing — ожидаем 405', async ({ request }) => {
    const res = await request.head('/api/VoiceActing/GetVoiceActing?id=adfc2b30-4627-4213-b985-62d7ef800137');
    expect(res.status()).toBe(405);
  });

  test('GET VoiceActing без id — ожидаем 404', async ({ request }) => {
    const res = await request.get('/api/VoiceActing/GetVoiceActing');
    expect([400, 404]).toContain(res.status());
  });
});
