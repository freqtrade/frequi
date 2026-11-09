import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useBotStore, type BotSubStore } from '@/stores/ftbotwrapper';

vi.mock('@/stores/ftbot', () => ({ createBotSubStore: vi.fn() }));

let store: ReturnType<typeof useBotStore>;
function addBot(id: string, overrides: Partial<Omit<BotSubStore, 'fetchPing'>> = {}) {
  const bot = {
    isBotLoggedIn: true,
    autoRefresh: true,
    isBotOnline: false,
    refreshNow: false,
    botStatusAvailable: true,
    fetchPing: vi.fn(async () => {}),
    ...overrides,
  };
  store.botStores[id] = bot as BotSubStore;
  return bot;
}
beforeEach(() => {
  vi.useFakeTimers();
  setActivePinia(createPinia());
  store = useBotStore();
});
afterEach(() => {
  store.$dispose();
  vi.useRealTimers();
});

describe('periodic bot health', () => {
  it('checks offline bots again after a failed heartbeat', async () => {
    const bot = addBot('bot');
    bot.fetchPing.mockRejectedValueOnce(new Error('unavailable'));
    store.startRefresh();
    await vi.advanceTimersByTimeAsync(0);
    expect(bot.fetchPing).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(15000);
    expect(bot.fetchPing).toHaveBeenCalledTimes(2);
  });

  it('respects global and per-bot pause while allowing a manual health check', async () => {
    const active = addBot('active');
    const paused = addBot('paused', { autoRefresh: false });
    const loggedOut = addBot('logged-out', { isBotLoggedIn: false });
    store.startRefresh();
    await vi.advanceTimersByTimeAsync(0);
    active.fetchPing.mockClear();
    paused.fetchPing.mockClear();
    store.setGlobalAutoRefresh(false);
    await vi.advanceTimersByTimeAsync(15000);
    expect(active.fetchPing).not.toHaveBeenCalled();
    expect(paused.fetchPing).not.toHaveBeenCalled();
    await store.pingAll();
    expect(active.fetchPing).toHaveBeenCalledOnce();
    expect(paused.fetchPing).toHaveBeenCalledOnce();
    store.setGlobalAutoRefresh(true);
    await vi.advanceTimersByTimeAsync(15000);
    expect(active.fetchPing).toHaveBeenCalledTimes(2);
    expect(paused.fetchPing).toHaveBeenCalledOnce();
    expect(loggedOut.fetchPing).not.toHaveBeenCalled();
  });

  it('does not create duplicate timers and stops scheduling on stop or disposal', async () => {
    const bot = addBot('bot');
    store.startRefresh();
    await vi.advanceTimersByTimeAsync(0);
    store.startRefresh();
    await vi.advanceTimersByTimeAsync(0);
    bot.fetchPing.mockClear();
    await vi.advanceTimersByTimeAsync(15000);
    expect(bot.fetchPing).toHaveBeenCalledOnce();
    store.stopRefresh();
    await vi.advanceTimersByTimeAsync(30000);
    expect(bot.fetchPing).toHaveBeenCalledOnce();
    store.startRefresh();
    await vi.advanceTimersByTimeAsync(0);
    bot.fetchPing.mockClear();
    store.$dispose();
    await vi.advanceTimersByTimeAsync(30000);
    expect(bot.fetchPing).not.toHaveBeenCalled();
  });

  it('shares pending checks per bot without blocking other bots', async () => {
    let finish!: () => void;
    const slow = addBot('slow');
    slow.fetchPing.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const healthy = addBot('healthy');
    const first = store.pingAll();
    await vi.advanceTimersByTimeAsync(0);
    const second = store.pingAll();
    expect(slow.fetchPing).toHaveBeenCalledOnce();
    expect(healthy.fetchPing).toHaveBeenCalledTimes(2);
    finish();
    await Promise.all([first, second]);
  });
});
