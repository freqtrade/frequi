import type * as VueUse from '@vueuse/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick, reactive, ref } from 'vue';
import { createBotSubStore } from '@/stores/ftbot';

const { sessions, sockets, api } = vi.hoisted(() => ({
  sessions: new Map<string, { accessToken: string }>(),
  sockets: [] as {
    url: string;
    close: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
    options: { onError: (...args: unknown[]) => void; onConnected: () => void };
  }[],
  api: vi.fn(),
}));

vi.mock('@/composables/loginInfo', () => ({
  useLoginInfo: (id: string) => ({
    baseWsUrl: ref('wss://example.test/api/v1'),
    accessToken: {
      get value() {
        return sessions.get(id)?.accessToken ?? '';
      },
    },
    getLoginInfo: () => sessions.get(id) ?? { accessToken: '' },
    logout: () => {
      sessions.get(id)!.accessToken = '';
      sessions.delete(id);
    },
  }),
}));
vi.mock('@/composables/api', () => ({ useApi: () => ({ api }) }));
vi.mock('@/utils/alerts', () => ({ useAlertForBot: () => ({ showAlert: vi.fn() }) }));
vi.mock('@vueuse/core', async (importOriginal) => ({
  ...(await importOriginal<typeof VueUse>()),
  useWebSocket: (url: string, options: (typeof sockets)[number]['options']) => {
    const socket = { url, options, close: vi.fn(), send: vi.fn() };
    sockets.push(socket);
    return socket;
  },
}));

let stores: ReturnType<typeof createBotSubStore>[];
beforeEach(() => {
  setActivePinia(createPinia());
  sessions.clear();
  sockets.length = 0;
  stores = [];
  api.mockReset().mockResolvedValue({ api_version: 2.21, runmode: 'dry_run' });
});
afterEach(() => {
  stores.forEach((store) => store.$dispose());
});
async function addBot(id = 'bot') {
  sessions.set(id, reactive({ accessToken: `${id}-old` }));
  const store = createBotSubStore(id, id);
  stores.push(store);
  await store.getState();
  return store;
}

describe('WebSocket token renewal', () => {
  it('replaces the connection with the renewed token and resubscribes', async () => {
    const store = await addBot();
    sessions.get('bot')!.accessToken = 'renewed';
    await nextTick();
    expect(sockets).toHaveLength(2);
    expect(sockets[0]!.close).toHaveBeenCalledOnce();
    expect(sockets[1]!.url).toBe('wss://example.test/api/v1/message/ws?token=renewed');
    sockets[1]!.options.onConnected();
    expect(store.websocketStarted).toBe(true);
    expect(sockets[1]!.send).toHaveBeenCalledTimes(2);
    store.startWebSocket();
    expect(sockets).toHaveLength(2);
  });

  it('ignores late callbacks from a replaced connection', async () => {
    const store = await addBot();
    sessions.get('bot')!.accessToken = 'renewed';
    await nextTick();
    sockets[0]!.options.onConnected();
    sockets[0]!.options.onError();
    expect(store.websocketStarted).toBe(false);
    expect(sockets[1]!.close).not.toHaveBeenCalled();
    sockets[1]!.options.onConnected();
    expect(store.websocketStarted).toBe(true);
  });

  it('closes on token expiry without reconnecting', async () => {
    await addBot();
    sessions.get('bot')!.accessToken = '';
    await nextTick();
    expect(sockets[0]!.close).toHaveBeenCalledOnce();
    expect(sockets).toHaveLength(1);
  });

  it('handles removal of login info on logout without reconnecting', async () => {
    const store = await addBot();
    store.logout();
    await nextTick();
    expect(sockets[0]!.close).toHaveBeenCalledOnce();
    expect(sockets).toHaveLength(1);
  });

  it('disposes the socket and token watcher', async () => {
    const store = await addBot();
    store.$dispose();
    expect(sockets[0]!.close).toHaveBeenCalledOnce();
    sessions.get('bot')!.accessToken = 'renewed';
    await nextTick();
    expect(sockets).toHaveLength(1);
  });

  it('only reconnects the bot whose token changed', async () => {
    await addBot('one');
    await addBot('two');
    sessions.get('one')!.accessToken = 'renewed';
    await nextTick();
    expect(sockets).toHaveLength(3);
    expect(sockets[0]!.close).toHaveBeenCalledOnce();
    expect(sockets[1]!.close).not.toHaveBeenCalled();
  });

  it.each([
    { api_version: 2.1, runmode: 'dry_run' },
    { api_version: 2.21, runmode: 'webserver' },
  ])('preserves the WebSocket capability gate: %j', async (state) => {
    api.mockResolvedValue(state);
    await addBot();
    sessions.get('bot')!.accessToken = 'renewed';
    await nextTick();
    expect(sockets).toHaveLength(0);
  });
});
