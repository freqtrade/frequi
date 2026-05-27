import type {
  BalanceInterface,
  BotDescriptor,
  BotDescriptors,
  BotState,
  ClosedTrade,
  TimeSummaryPayload,
  TimeSummaryRecord,
  TimeSummaryReturnValue,
  MultiCancelOpenOrderPayload,
  MultiDeletePayload,
  MultiForceExitPayload,
  MultiReloadTradePayload,
  ProfitStats,
  Trade,
  WalletHistoryPerBot,
} from '@/types';
import type { ComputedRef, Ref } from 'vue';
import { TimeSummaryOptions } from '@/types';
import { createBotSubStore } from './ftbot';
const AUTH_SELECTED_BOT = 'ftSelectedBot';

// Import axios for type inference only
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios from 'axios';

export type BotSubStore = ReturnType<typeof createBotSubStore>;

export interface SubStores {
  [key: string]: BotSubStore;
}

interface BotStoreSetup {
  selectedBot: Ref<string>;
  availableBots: Ref<BotDescriptors>;
  globalAutoRefresh: Ref<boolean>;
  refreshing: Ref<boolean>;
  refreshInterval: Ref<number | null>;
  refreshIntervalSlow: Ref<number | null>;
  botStores: Ref<SubStores>;
  hasBots: ComputedRef<boolean>;
  botCount: ComputedRef<number>;
  availableBotsSorted: ComputedRef<BotDescriptor[]>;
  allBotStores: ComputedRef<BotSubStore[]>;
  allSelectedBotsSameStake: ComputedRef<boolean>;
  allSelectedBotsSameState: ComputedRef<boolean>;
  selectedBots: ComputedRef<BotSubStore[]>;
  selectedBotCount: ComputedRef<number>;
  activeBot: ComputedRef<BotSubStore>;
  activeBotorUndefined: ComputedRef<BotSubStore | undefined>;
  canRunBacktest: ComputedRef<boolean>;
  isWebserverMode: ComputedRef<boolean>;
  selectedBotObj: ComputedRef<BotDescriptor | undefined>;
  nextBotId: ComputedRef<string>;
  allProfit: ComputedRef<Record<string, ProfitStats | undefined>>;
  allOpenTradeCount: ComputedRef<Record<string, number>>;
  allOpenTrades: ComputedRef<Record<string, Trade[]>>;
  allBalance: ComputedRef<Record<string, BalanceInterface>>;
  allBotState: ComputedRef<Record<string, BotState>>;
  allOpenTradesSelectedBots: ComputedRef<Trade[]>;
  allClosedTradesSelectedBots: ComputedRef<Trade[]>;
  allTradesSelectedBots: ComputedRef<ClosedTrade[]>;
  allBalanceHistory: ComputedRef<WalletHistoryPerBot>;
  allDailyStatsSelectedBots: ComputedRef<TimeSummaryReturnValue>;
  allWeeklyStatsSelectedBots: ComputedRef<TimeSummaryReturnValue>;
  allMonthlyStatsSelectedBots: ComputedRef<TimeSummaryReturnValue>;
  selectBot: (botId: string) => void;
  addBot: (bot: BotDescriptor) => void;
  updateBot: (botId: string, bot: Partial<BotDescriptor>) => void;
  removeBot: (botId: string) => void;
  selectFirstBot: () => void;
  setGlobalAutoRefresh: (value: boolean) => void;
  allRefreshFrequent: (forceUpdate?: boolean) => Promise<void>;
  allRefreshSlow: (forceUpdate?: boolean) => Promise<void>;
  allRefreshFull: () => Promise<void>;
  startRefresh: () => void;
  stopRefresh: () => void;
  pingAll: () => Promise<void>;
  allGetState: () => void;
  allGetDaily: (payload: TimeSummaryPayload) => Promise<void>;
  forceSellMulti: (forcesellPayload: MultiForceExitPayload) => Promise<unknown>;
  deleteTradeMulti: (deletePayload: MultiDeletePayload) => Promise<unknown>;
  cancelOpenOrderMulti: (deletePayload: MultiCancelOpenOrderPayload) => Promise<unknown>;
  reloadTradeMulti: (deletePayload: MultiReloadTradePayload) => Promise<unknown>;
  allGetTimeSummary: (period: TimeSummaryOptions, payload?: TimeSummaryPayload) => Promise<void>;
  toggleBotsByState: (state: 'dry' | 'live' | 'all') => void;
}

export const useBotStore = defineStore('ftbot-wrapper', (): BotStoreSetup => {
  // TODO: BotstoreSetup typing should not be necessary - and is caused by BotSubStore computed properties
  const selectedBot = ref<string>('');
  const availableBots = ref<BotDescriptors>({});
  const globalAutoRefresh = ref<boolean>(true);
  const refreshing = ref<boolean>(false);
  const refreshInterval = ref<number | null>(null);
  const refreshIntervalSlow = ref<number | null>(null);

  const botStores = ref<SubStores>({});

  const hasBots = computed<boolean>(() => Object.keys(availableBots.value).length > 0);
  const botCount = computed<number>(() => Object.keys(availableBots.value).length);
  const availableBotsSorted = computed<BotDescriptor[]>(() => {
    return Object.values(availableBots.value).sort((a, b) => (a.sortId ?? 0) - (b.sortId ?? 0));
  });
  const allBotStores = computed<BotSubStore[]>(() => Object.values(botStores.value));
  const selectedBots = computed<BotSubStore[]>(() => {
    return Object.values(botStores.value).filter((store) => store.isSelected);
  });
  const allSelectedBotsSameStake = computed<boolean>(() => {
    const stakeCurrencies = Object.values(selectedBots.value).map((bot) => bot.stakeCurrency);
    return (
      stakeCurrencies.length > 0 &&
      stakeCurrencies.every((currency) => currency === stakeCurrencies[0])
    );
  });
  const allSelectedBotsSameState = computed<boolean>(() => {
    const modes = Object.values(selectedBots.value).map((bot) => bot.botState.dry_run);
    return modes.length > 0 && modes.every((mode) => mode === modes[0]);
  });
  const selectedBotCount = computed<number>(
    () => Object.values(botStores.value).filter((store) => store.isSelected).length,
  );
  const activeBot = computed<BotSubStore>(() => botStores.value[selectedBot.value]);
  const activeBotorUndefined = computed<BotSubStore | undefined>(
    () => botStores.value[selectedBot.value],
  );
  const canRunBacktest = computed<boolean>(
    () => botStores.value[selectedBot.value]?.canRunBacktest ?? false,
  );
  const isWebserverMode = computed<boolean>(
    () => botStores.value[selectedBot.value]?.isWebserverMode ?? false,
  );
  const selectedBotObj = computed(() => availableBots.value[selectedBot.value]);
  const nextBotId = computed(() => {
    let nextBotCount = Object.keys(availableBots.value).length;

    while (`ftbot.${nextBotCount}` in availableBots.value) {
      nextBotCount += 1;
    }
    return `ftbot.${nextBotCount}`;
  });
  const allProfit = computed<Record<string, ProfitStats | undefined>>(() => {
    const result: Record<string, ProfitStats | undefined> = {};
    Object.entries(botStores.value).forEach(([key, botStore]) => {
      result[key] = botStore.profit;
    });
    return result;
  });
  const allOpenTradeCount = computed<Record<string, number>>(() => {
    const result: Record<string, number> = {};
    Object.entries(botStores.value).forEach(([key, botStore]) => {
      result[key] = botStore.openTradeCount;
    });
    return result;
  });
  const allOpenTrades = computed<Record<string, Trade[]>>(() => {
    const result: Record<string, Trade[]> = {};
    Object.entries(botStores.value).forEach(([key, botStore]) => {
      result[key] = botStore.openTrades;
    });
    return result;
  });
  const allBalance = computed<Record<string, BalanceInterface>>(() => {
    const result: Record<string, BalanceInterface> = {};
    Object.entries(botStores.value).forEach(([key, botStore]) => {
      result[key] = botStore.balance;
    });
    return result;
  });
  const allBotState = computed<Record<string, BotState>>(() => {
    const result: Record<string, BotState> = {};
    Object.entries(botStores.value).forEach(([key, botStore]) => {
      result[key] = botStore.botState;
    });
    return result;
  });
  const allOpenTradesSelectedBots = computed<Trade[]>(() => {
    const result: Trade[] = [];
    Object.entries(botStores.value).forEach(([, botStore]) => {
      if (botStore.isSelected) {
        result.push(...botStore.openTrades);
      }
    });
    return result;
  });
  const allClosedTradesSelectedBots = computed<Trade[]>(() => {
    const result: Trade[] = [];
    Object.entries(botStores.value).forEach(([, botStore]) => {
      if (botStore.isSelected) {
        result.push(...botStore.trades);
      }
    });
    return result.sort((a, b) =>
      // Sort by close timestamp, then by tradeid
      b.close_timestamp && a.close_timestamp
        ? b.close_timestamp - a.close_timestamp
        : b.trade_id - a.trade_id,
    );
  });
  const allTradesSelectedBots = computed<ClosedTrade[]>(() => {
    const result: ClosedTrade[] = [];
    Object.entries(botStores.value).forEach(([, botStore]) => {
      if (botStore.isSelected) {
        result.push(...botStore.trades);
      }
    });
    return result;
  });
  const allBalanceHistory = computed<WalletHistoryPerBot>(() => {
    const result: WalletHistoryPerBot = {};
    Object.entries(botStores.value).forEach(([key, botStore]) => {
      if (botStore.balanceHistory) {
        result[key] = botStore.balanceHistory;
      }
    });
    return result;
  });
  const allDailyStatsSelectedBots = computed<TimeSummaryReturnValue>(() => {
    const resp: Record<string, TimeSummaryRecord> = {};
    Object.entries(botStores.value).forEach(([, botStore]) => {
      if (botStore.isSelected) {
        botStore.dailyStats?.data?.forEach((daily) => {
          const existing = resp[daily.date];
          if (!existing) {
            resp[daily.date] = { ...daily };
          } else {
            existing.abs_profit += daily.abs_profit;
            existing.fiat_value += daily.fiat_value;
            existing.trade_count += daily.trade_count;
          }
        });
      }
    });

    return {
      stake_currency: 'USDT',
      fiat_display_currency: 'USD',
      data: Object.values(resp).sort((a, b) => (a.date > b.date ? 1 : -1)),
    };
  });
  const allWeeklyStatsSelectedBots = computed<TimeSummaryReturnValue>(() => {
    const resp: Record<string, TimeSummaryRecord> = {};
    Object.entries(botStores.value).forEach(([, botStore]) => {
      if (botStore.isSelected) {
        botStore.weeklyStats?.data?.forEach((weekly) => {
          const existing = resp[weekly.date];
          if (!existing) {
            resp[weekly.date] = { ...weekly };
          } else {
            existing.abs_profit += weekly.abs_profit;
            existing.fiat_value += weekly.fiat_value;
            existing.trade_count += weekly.trade_count;
          }
        });
      }
    });

    return {
      stake_currency: 'USDT',
      fiat_display_currency: 'USD',
      data: Object.values(resp).sort((a, b) => (a.date > b.date ? 1 : -1)),
    };
  });
  const allMonthlyStatsSelectedBots = computed<TimeSummaryReturnValue>(() => {
    const resp: Record<string, TimeSummaryRecord> = {};
    Object.entries(botStores.value).forEach(([, botStore]) => {
      if (botStore.isSelected) {
        botStore.monthlyStats?.data?.forEach((monthly) => {
          const existing = resp[monthly.date];
          if (!existing) {
            resp[monthly.date] = { ...monthly };
          } else {
            existing.abs_profit += monthly.abs_profit;
            existing.fiat_value += monthly.fiat_value;
            existing.starting_balance += monthly.starting_balance;
            existing.rel_profit += monthly.rel_profit;
            existing.trade_count += monthly.trade_count;
          }
        });
      }
    });

    return {
      stake_currency: 'USDT',
      fiat_display_currency: 'USD',
      data: Object.values(resp).sort((a, b) => (a.date > b.date ? 1 : -1)),
    };
  });

  function selectBot(botId: string) {
    if (botId in availableBots.value) {
      localStorage.setItem(AUTH_SELECTED_BOT, botId);
      selectedBot.value = botId;
    } else {
      console.warn(`Botid ${botId} not available, but selected.`);
    }
  }

  function addBot(bot: BotDescriptor) {
    if (Object.keys(availableBots.value).includes(bot.botId)) {
      // throw 'Bot already present';
      // TODO: handle error!
      console.log('Bot already present');
      return;
    }
    console.log('add bot', bot);
    const botStore = createBotSubStore(bot.botId, bot.botName);
    botStore.botAdded();
    botStores.value[bot.botId] = botStore;
    availableBots.value[bot.botId] = bot;
    botStores.value = { ...botStores.value };
    availableBots.value = { ...availableBots.value };
  }

  function updateBot(botId: string, bot: Partial<BotDescriptor>) {
    const botInstance = botStores.value[botId];
    if (!botInstance) {
      // TODO: handle error!
      console.error('Bot not found');
      return;
    }
    botInstance.updateBot(bot);
    const availableBot = availableBots.value[botId];
    if (!availableBot) return;
    Object.assign(availableBot, bot);
  }

  function removeBot(botId: string) {
    if (Object.keys(availableBots.value).includes(botId)) {
      const bot = botStores.value[botId];
      if (!bot) return;
      bot.logout();
      bot.$dispose();

      delete botStores.value[botId];
      delete availableBots.value[botId];
      if (selectedBot.value === botId) {
        selectFirstBot();
      }
      botStores.value = { ...botStores.value };
      availableBots.value = { ...availableBots.value };
    } else {
      console.warn(`bot ${botId} not found! could not remove`);
    }
  }

  function selectFirstBot() {
    if (hasBots.value) {
      const selBotId = localStorage.getItem(AUTH_SELECTED_BOT);
      const firstBot = Object.keys(availableBots.value)[0];
      let resolvedBotId: string | undefined = firstBot;
      if (selBotId) {
        resolvedBotId = Object.keys(availableBots.value).find((botId) => botId === selBotId);
      }
      if (!resolvedBotId) return;
      const bot = availableBots.value[resolvedBotId];
      if (!bot) return;
      selectBot(bot.botId);
    }
  }

  function setGlobalAutoRefresh(value: boolean) {
    // TODO: could be removed.
    globalAutoRefresh.value = value;
  }

  async function allRefreshFrequent(forceUpdate = false) {
    const updates: Promise<unknown>[] = [];
    allBotStores.value.forEach((store) => {
      if (
        store.refreshNow &&
        store.botStatusAvailable &&
        (globalAutoRefresh.value || forceUpdate)
      ) {
        updates.push(store.refreshFrequent());
      }
    });
    await Promise.all(updates);
    return Promise.resolve();
  }

  async function allRefreshSlow(forceUpdate = false) {
    const updates: Promise<unknown>[] = [];
    allBotStores.value.forEach((store) => {
      if (store.refreshNow && (globalAutoRefresh.value || forceUpdate)) {
        updates.push(store.refreshSlow(forceUpdate));
      }
    });
    await Promise.all(updates);
  }

  async function pingAll() {
    await Promise.all(
      Object.values(botStores.value).map(async (store) => {
        try {
          await store.fetchPing();
        } catch {
          // pass
        }
      }),
    );
  }

  async function allRefreshFull() {
    if (refreshing.value) {
      return;
    }
    refreshing.value = true;
    try {
      await pingAll();

      const botStoreUpdates: Promise<BotState>[] = [];
      allBotStores.value.forEach((bot) => {
        if (bot.isBotLoggedIn && bot.isBotOnline && !bot.botStatusAvailable) {
          botStoreUpdates.push(bot.getState());
        }
      });
      await Promise.all(botStoreUpdates);

      const updates: Promise<void>[] = [];
      updates.push(allRefreshFrequent(false));
      updates.push(allRefreshSlow(true));
      // updates.push(this.getTimeSummary());
      // updates.push(this.getBalance());
      await Promise.all(updates);
      console.log('refreshing_end');
    } finally {
      refreshing.value = false;
    }
  }

  function startRefresh() {
    console.log('Starting automatic refresh.');
    allRefreshFull();
    if (!refreshInterval.value) {
      refreshInterval.value = window.setInterval(() => {
        allRefreshFrequent();
      }, 5000);
    }
    if (!refreshIntervalSlow.value) {
      refreshIntervalSlow.value = window.setInterval(() => {
        allRefreshSlow(false);
      }, 60000);
    }
  }

  function stopRefresh() {
    console.log('Stopping automatic refresh.');
    if (refreshInterval.value) {
      window.clearInterval(refreshInterval.value);
      refreshInterval.value = null;
    }
    if (refreshIntervalSlow.value) {
      window.clearInterval(refreshIntervalSlow.value);
      refreshIntervalSlow.value = null;
    }
  }

  function allGetState() {
    Object.values(botStores.value).map(async (store) => {
      try {
        await store.getState();
      } catch {
        // pass
      }
    });
  }

  async function allGetDaily(payload: TimeSummaryPayload) {
    const updates: Promise<TimeSummaryReturnValue>[] = [];

    allBotStores.value.forEach((bot) => {
      if (bot.isBotOnline) {
        updates.push(bot.getTimeSummary(TimeSummaryOptions.daily, payload));
      }
    });
    await Promise.all(updates);
  }

  async function forceSellMulti(forcesellPayload: MultiForceExitPayload) {
    const bot = botStores.value[forcesellPayload.botId];
    if (!bot) return;
    return bot.forceexit(forcesellPayload);
  }

  async function deleteTradeMulti(deletePayload: MultiDeletePayload) {
    const bot = botStores.value[deletePayload.botId];
    if (!bot) return;
    return bot.deleteTrade(deletePayload.tradeid);
  }

  async function cancelOpenOrderMulti(deletePayload: MultiCancelOpenOrderPayload) {
    const bot = botStores.value[deletePayload.botId];
    if (!bot) return;
    return bot.cancelOpenOrder(deletePayload.tradeid);
  }

  async function reloadTradeMulti(deletePayload: MultiReloadTradePayload) {
    const bot = botStores.value[deletePayload.botId];
    if (!bot) return;
    return bot.reloadTrade(deletePayload.tradeid);
  }

  async function allGetTimeSummary(period: TimeSummaryOptions, payload?: TimeSummaryPayload) {
    const updates: Promise<TimeSummaryReturnValue>[] = [];

    allBotStores.value.forEach((bot) => {
      if (bot.isBotOnline && bot.isSelected) {
        updates.push(bot.getTimeSummary(period, payload));
      }
    });
    await Promise.all(updates);
  }

  function toggleBotsByState(state: 'dry' | 'live' | 'all') {
    for (const bot of Object.values(botStores.value)) {
      if (state === 'all') {
        bot.isSelected = true;
      } else if (
        bot.isBotOnline &&
        ((bot.botState.dry_run && state === 'dry') || (!bot.botState.dry_run && state === 'live'))
      ) {
        bot.isSelected = true;
      } else {
        bot.isSelected = false;
      }
    }
  }

  return {
    selectedBot,
    availableBots,
    globalAutoRefresh,
    refreshing,
    refreshInterval,
    refreshIntervalSlow,
    botStores,
    hasBots,
    botCount,
    availableBotsSorted,
    allBotStores,
    allSelectedBotsSameStake,
    allSelectedBotsSameState,
    selectedBots,
    selectedBotCount,
    activeBot,
    activeBotorUndefined,
    canRunBacktest,
    isWebserverMode,
    selectedBotObj,
    nextBotId,
    allProfit,
    allOpenTradeCount,
    allOpenTrades,
    allBalance,
    allBotState,
    allOpenTradesSelectedBots,
    allClosedTradesSelectedBots,
    allTradesSelectedBots,
    allBalanceHistory,
    allDailyStatsSelectedBots,
    allWeeklyStatsSelectedBots,
    allMonthlyStatsSelectedBots,
    selectBot,
    addBot,
    updateBot,
    removeBot,
    selectFirstBot,
    setGlobalAutoRefresh,
    allRefreshFrequent,
    allRefreshSlow,
    allRefreshFull,
    startRefresh,
    stopRefresh,
    pingAll,
    allGetState,
    allGetDaily,
    forceSellMulti,
    deleteTradeMulti,
    cancelOpenOrderMulti,
    reloadTradeMulti,
    allGetTimeSummary,
    toggleBotsByState,
  };
});

export function initBots() {
  const botStore = useBotStore();
  Object.entries(loggedInBots.value).forEach(([, v]) => {
    botStore.addBot(v);
  });
  botStore.selectFirstBot();
  botStore.startRefresh();
  botStore.allRefreshFull();
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBotStore, import.meta.hot));
}
