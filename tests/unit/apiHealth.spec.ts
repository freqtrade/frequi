import type * as Ofetch from 'ofetch';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useApi } from '@/composables/api';

const { fetchMock, bots } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  bots: {} as Record<string, { isBotLoggedIn: boolean; setIsBotOnline: ReturnType<typeof vi.fn> }>,
}));
vi.mock('ofetch', async (importOriginal) => {
  const original = await importOriginal<typeof Ofetch>();
  return {
    ...original,
    ofetch: original.createFetch({
      fetch: (...args) => fetchMock(...args),
      Headers,
      AbortController,
    }),
  };
});
vi.mock('@/stores/ftbotwrapper', () => ({ useBotStore: () => ({ botStores: bots }) }));

function client(id = 'bot') {
  bots[id] = { isBotLoggedIn: true, setIsBotOnline: vi.fn() };
  const accessToken = ref('old');
  const user = {
    baseUrl: ref('https://example.test/api/v1'),
    accessToken,
    refreshToken: vi.fn(async () => 'renewed'),
  } as unknown as ReturnType<typeof useLoginInfo>;
  return { ...useApi(user, id), user, accessToken, bot: bots[id]! };
}
beforeEach(() => {
  fetchMock.mockReset();
  Object.keys(bots).forEach((id) => delete bots[id]);
});

describe('API errors and bot health', () => {
  it('propagates optional endpoint errors without declaring the bot offline', async () => {
    fetchMock.mockResolvedValue(
      new Response('{"detail":"unavailable"}', {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const { api, bot } = client();
    await expect(api('/strategy')).rejects.toMatchObject({ status: 500 });
    expect(bot.setIsBotOnline).not.toHaveBeenCalled();
    expect(bot.isBotLoggedIn).toBe(true);
  });

  it('leaves online classification to the heartbeat after a transport error', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const { api, bot } = client();
    await expect(api('/status')).rejects.toThrow();
    expect(bot.setIsBotOnline).not.toHaveBeenCalled();
    expect(bot.isBotLoggedIn).toBe(true);
  });

  it('preserves token renewal and the authenticated retry', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 401 })).mockResolvedValueOnce(
      new Response('{"ok":true}', {
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const { api, user, accessToken, bot } = client();
    vi.mocked(user.refreshToken).mockImplementation(async () => {
      accessToken.value = 'renewed';
      return 'renewed';
    });
    await expect(api('/status')).resolves.toEqual({ ok: true });
    expect(user.refreshToken).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[1]![1].headers.get('Authorization')).toBe('Bearer renewed');
    expect(bot.setIsBotOnline).not.toHaveBeenCalled();
  });

  it('keeps refresh failure logged out and isolated to its own bot', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 401 }));
    const first = client('one');
    const second = client('two');
    vi.mocked(first.user.refreshToken).mockRejectedValue(new Error('refresh rejected'));
    await expect(first.api('/status')).rejects.toMatchObject({ status: 401 });
    expect(first.bot.setIsBotOnline).toHaveBeenCalledWith(false);
    expect(first.bot.isBotLoggedIn).toBe(false);
    expect(second.bot.setIsBotOnline).not.toHaveBeenCalled();
    expect(second.bot.isBotLoggedIn).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
