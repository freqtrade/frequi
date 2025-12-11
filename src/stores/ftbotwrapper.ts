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
} from '@/types';
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

export const useBotStore = defineStore('ftbot-wrapper', {
  state: () => {
    return {
      selectedBot: '',
      availableBots: {} as BotDescriptors,
      globalAutoRefresh: true,
      refreshing: false,
      refreshInterval: null as number | null,
      refreshIntervalSlow: null as number | null,
      botStores: {} as SubStores,
    };
  },
  getters: {
    hasBots: (state) => Object.keys(state.availableBots).length > 0,
    botCount: (state) => Object.keys(state.availableBots).length,
    availableBotsSorted: (state) => {
      return Object.values(state.availableBots).sort((a, b) => (a.sortId ?? 0) - (b.sortId ?? 0));
    },
    allBotStores: (state) => Object.values(state.botStores),
    allSelectedBotsSameStake() {
      const stakeCurrencies = Object.values(this.selectedBots).map((bot) => bot.stakeCurrency);
      return (
        stakeCurrencies.length > 0 &&
        stakeCurrencies.every((currency) => currency === stakeCurrencies[0])
      );
    },
    /** All selected bots have the same mode (dry or live) */
    allSelectedBotsSameState() {
      const modes = Object.values(this.selectedBots).map((bot) => bot.botState.dry_run);
      return modes.length > 0 && modes.every((mode) => mode === modes[0]);
    },
    /** Selected bots for dashboard view */
    selectedBots: (state) => {
      return Object.values(state.botStores).filter((store) => store.isSelected);
    },
    selectedBotCount: (state) =>
      Object.values(state.botStores).filter((store) => store.isSelected).length,
    activeBot: (state) => state.botStores[state.selectedBot] as BotSubStore,
    activeBotorUndefined: (state) => state.botStores[state.selectedBot] as BotSubStore | undefined,
    canRunBacktest: (state) => state.botStores[state.selectedBot]?.canRunBacktest ?? false,
    isWebserverMode: (state) => state.botStores[state.selectedBot]?.isWebserverMode ?? false,
    selectedBotObj: (state) => state.availableBots[state.selectedBot],
    nextBotId: (state) => {
      let botCount = Object.keys(state.availableBots).length;

      while (`ftbot.${botCount}` in state.availableBots) {
        botCount += 1;
      }
      return `ftbot.${botCount}`;
    },
    allProfit: (state): Record<string, ProfitStats | undefined> => {
      const result: Record<string, ProfitStats | undefined> = {};
      Object.entries(state.botStores).forEach(([k, botStore]) => {
        result[k] = botStore.profit;
      });
      return result;
    },
    allOpenTradeCount: (state): Record<string, number> => {
      const result: Record<string, number> = {};
      Object.entries(state.botStores).forEach(([k, botStore]) => {
        result[k] = botStore.openTradeCount;
      });
      return result;
    },
    allOpenTrades: (state): Record<string, Trade[]> => {
      const result: Record<string, Trade[]> = {};
      Object.entries(state.botStores).forEach(([k, botStore]) => {
        result[k] = botStore.openTrades;
      });
      return result;
    },
    allBalance: (state): Record<string, BalanceInterface> => {
      const result: Record<string, BalanceInterface> = {};
      Object.entries(state.botStores).forEach(([k, botStore]) => {
        result[k] = botStore.balance;
      });
      return result;
    },
    allBotState: (state): Record<string, BotState> => {
      const result: Record<string, BotState> = {};
      Object.entries(state.botStores).forEach(([k, botStore]) => {
        result[k] = botStore.botState;
      });
      return result;
    },

    allOpenTradesSelectedBots: (state): Trade[] => {
      const result: Trade[] = [];
      Object.entries(state.botStores).forEach(([, botStore]) => {
        if (botStore.isSelected) {
          result.push(...botStore.openTrades);
        }
      });
      return result;
    },
    allClosedTradesSelectedBots: (state): Trade[] => {
      const result: Trade[] = [];
      Object.entries(state.botStores).forEach(([, botStore]) => {
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
    },
    allTradesSelectedBots: (state): ClosedTrade[] => {
      const result: ClosedTrade[] = [];
      Object.entries(state.botStores).forEach(([, botStore]) => {
        if (botStore.isSelected) {
          result.push(...botStore.trades);
        }
      });
      return result;
    },
    allDailyStatsSelectedBots: (state): TimeSummaryReturnValue => {
      // Return aggregated daily stats for all bots - sorted ascending.
      const resp: Record<string, TimeSummaryRecord> = {};
      Object.entries(state.botStores).forEach(([, botStore]) => {
        if (botStore.isSelected) {
          botStore.dailyStats?.data?.forEach((d) => {
            const existing = resp[d.date];
            if (!existing) {
              resp[d.date] = { ...d };
            } else {
              existing.abs_profit += d.abs_profit;
              existing.fiat_value += d.fiat_value;
              existing.trade_count += d.trade_count;
            }
          });
        }
      });

      const dailyReturn: TimeSummaryReturnValue = {
        stake_currency: 'USDT',
        fiat_display_currency: 'USD',
        data: Object.values(resp).sort((a, b) => (a.date > b.date ? 1 : -1)),
      };
      return dailyReturn;
    },
    allWeeklyStatsSelectedBots: (state): TimeSummaryReturnValue => {
      const resp: Record<string, TimeSummaryRecord> = {};
      Object.entries(state.botStores).forEach(([, botStore]) => {
        if (botStore.isSelected) {
          botStore.weeklyStats?.data?.forEach((d) => {
            const existing = resp[d.date];
            if (!existing) {
              resp[d.date] = { ...d };
            } else {
              existing.abs_profit += d.abs_profit;
              existing.fiat_value += d.fiat_value;
              existing.trade_count += d.trade_count;
            }
          });
        }
      });

      return {
        stake_currency: 'USDT',
        fiat_display_currency: 'USD',
        data: Object.values(resp).sort((a, b) => (a.date > b.date ? 1 : -1)),
      };
    },
    allMonthlyStatsSelectedBots: (state): TimeSummaryReturnValue => {
      const resp: Record<string, TimeSummaryRecord> = {};
      Object.entries(state.botStores).forEach(([, botStore]) => {
        if (botStore.isSelected) {
          botStore.monthlyStats?.data?.forEach((d) => {
            const existing = resp[d.date];
            if (!existing) {
              resp[d.date] = { ...d };
            } else {
              existing.abs_profit += d.abs_profit;
              existing.fiat_value += d.fiat_value;
              existing.starting_balance += d.starting_balance;
              existing.rel_profit += d.rel_profit;
              existing.trade_count += d.trade_count;
            }
          });
        }
      });

      return {
        stake_currency: 'USDT',
        fiat_display_currency: 'USD',
        data: Object.values(resp).sort((a, b) => (a.date > b.date ? 1 : -1)),
      };
    },
  },
  actions: {
    selectBot(botId: string) {
      if (botId in this.availableBots) {
        localStorage.setItem(AUTH_SELECTED_BOT, botId);
        this.selectedBot = botId;
      } else {
        console.warn(`Botid ${botId} not available, but selected.`);
      }
    },
    addBot(bot: BotDescriptor) {
      if (Object.keys(this.availableBots).includes(bot.botId)) {
        // throw 'Bot already present';
        // TODO: handle error!
        console.log('Bot already present');
        return;
      }
      console.log('add bot', bot);
      const botStore = createBotSubStore(bot.botId, bot.botName);
      botStore.botAdded();
      this.botStores[bot.botId] = botStore;
      this.availableBots[bot.botId] = bot;
      this.botStores = { ...this.botStores };
      this.availableBots = { ...this.availableBots };
    },
    updateBot(botId: string, bot: Partial<BotDescriptor>) {
      const botInstance = this.botStores[botId];
      if (!botInstance) {
        // TODO: handle error!
        console.error('Bot not found');
        return;
      }
      botInstance.updateBot(bot);
      const availableBots = this.availableBots[botId];
      if (!availableBots) return;
      Object.assign(availableBots, bot);
    },
    removeBot(botId: string) {
      if (Object.keys(this.availableBots).includes(botId)) {
        const bot = this.botStores[botId];
        if (!bot) return;
        bot.logout();
        bot.$dispose();

        delete this.botStores[botId];
        delete this.availableBots[botId];
        if (this.selectedBot === botId) {
          this.selectFirstBot();
        }
        this.botStores = { ...this.botStores };
        this.availableBots = { ...this.availableBots };
      } else {
        console.warn(`bot ${botId} not found! could not remove`);
      }
    },
    selectFirstBot() {
      if (this.hasBots) {
        const selBotId = localStorage.getItem(AUTH_SELECTED_BOT);
        const firstBot = Object.keys(this.availableBots)[0];
        let selBot: string | undefined = firstBot;
        if (selBotId) {
          selBot = Object.keys(this.availableBots).find((x) => x === selBotId);
        }
        if (!selBot) return;
        const bot = this.availableBots[selBot];
        if (!bot) return;
        this.selectBot(bot.botId);
      }
    },
    setGlobalAutoRefresh(value: boolean) {
      // TODO: could be removed.
      this.globalAutoRefresh = value;
    },
    async allRefreshFrequent(forceUpdate = false) {
      const updates: Promise<unknown>[] = [];
      this.allBotStores.forEach(async (e) => {
        if (e.refreshNow && e.botStatusAvailable && (this.globalAutoRefresh || forceUpdate)) {
          updates.push(e.refreshFrequent());
        }
      });
      await Promise.all(updates);
      return Promise.resolve();
    },
    async allRefreshSlow(forceUpdate = false) {
      this.allBotStores.forEach(async (e) => {
        if (e.refreshNow && (this.globalAutoRefresh || forceUpdate)) {
          await e.refreshSlow(forceUpdate);
        }
      });
    },
    async allRefreshFull() {
      if (this.refreshing) {
        return;
      }
      this.refreshing = true;
      try {
        // Ensure all bots status is correct.
        await this.pingAll();

        const botStoreUpdates: Promise<BotState>[] = [];
        this.allBotStores.forEach((bot) => {
          if (bot.isBotLoggedIn && bot.isBotOnline && !bot.botStatusAvailable) {
            botStoreUpdates.push(bot.getState());
          }
        });
        await Promise.all(botStoreUpdates);

        const updates: Promise<void>[] = [];
        updates.push(this.allRefreshFrequent(false));
        updates.push(this.allRefreshSlow(true));
        // updates.push(this.getTimeSummary());
        // updates.push(this.getBalance());
        await Promise.all(updates);
        console.log('refreshing_end');
      } finally {
        this.refreshing = false;
      }
    },
    startRefresh() {
      console.log('Starting automatic refresh.');
      this.allRefreshFull();
      if (!this.refreshInterval) {
        // Set interval for refresh
        const refreshInterval = window.setInterval(() => {
          this.allRefreshFrequent();
        }, 5000);
        this.refreshInterval = refreshInterval;
      }
      if (!this.refreshIntervalSlow) {
        const refreshIntervalSlow = window.setInterval(() => {
          this.allRefreshSlow(false);
        }, 60000);
        this.refreshIntervalSlow = refreshIntervalSlow;
      }
    },
    stopRefresh() {
      console.log('Stopping automatic refresh.');
      if (this.refreshInterval) {
        window.clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
      if (this.refreshIntervalSlow) {
        window.clearInterval(this.refreshIntervalSlow);
        this.refreshIntervalSlow = null;
      }
    },
    async pingAll() {
      await Promise.all(
        Object.values(this.botStores).map(async (v) => {
          try {
            await v.fetchPing();
          } catch {
            // pass
          }
        }),
      );
    },
    allGetState() {
      Object.values(this.botStores).map(async (v) => {
        try {
          await v.getState();
        } catch {
          // pass
        }
      });
    },
    async allGetDaily(payload: TimeSummaryPayload) {
      const updates: Promise<TimeSummaryReturnValue>[] = [];

      this.allBotStores.forEach((bot) => {
        if (bot.isBotOnline) {
          updates.push(bot.getTimeSummary(TimeSummaryOptions.daily, payload));
        }
      });
      await Promise.all(updates);
    },
    async forceSellMulti(forcesellPayload: MultiForceExitPayload) {
      const bot = this.botStores[forcesellPayload.botId];
      if (!bot) return;
      return bot.forceexit(forcesellPayload);
    },
    async deleteTradeMulti(deletePayload: MultiDeletePayload) {
      const bot = this.botStores[deletePayload.botId];
      if (!bot) return;
      return bot.deleteTrade(deletePayload.tradeid);
    },
    async cancelOpenOrderMulti(deletePayload: MultiCancelOpenOrderPayload) {
      const bot = this.botStores[deletePayload.botId];
      if (!bot) return;
      return bot.cancelOpenOrder(deletePayload.tradeid);
    },
    async reloadTradeMulti(deletePayload: MultiReloadTradePayload) {
      const bot = this.botStores[deletePayload.botId];
      if (!bot) return;
      return bot.reloadTrade(deletePayload.tradeid);
    },
    async allGetTimeSummary(period: TimeSummaryOptions, payload?: TimeSummaryPayload) {
      const updates: Promise<TimeSummaryReturnValue>[] = [];

      this.allBotStores.forEach((bot) => {
        if (bot.isBotOnline && bot.isSelected) {
          updates.push(bot.getTimeSummary(period, payload));
        }
      });
      await Promise.all(updates);
    },
    toggleBotsByState(state: 'dry' | 'live' | 'all') {
      for (const bot of Object.values(this.botStores)) {
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
    },
  },
});

export function initBots() {
  const botStore = useBotStore();
  Object.entries(availableBots.value).forEach(([, v]) => {
    botStore.addBot(v);
  });
  botStore.selectFirstBot();
  botStore.startRefresh();
  botStore.allRefreshFull();
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBotStore, import.meta.hot));
}
