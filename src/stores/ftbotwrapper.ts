import { UserService } from '@/shared/userService';
import {
  BalanceInterface,
  BotDescriptor,
  BotDescriptors,
  BotState,
  ClosedTrade,
  DailyPayload,
  DailyRecord,
  DailyReturnValue,
  MultiDeletePayload,
  MultiForcesellPayload,
  ProfitInterface,
  Trade,
} from '@/types';
import { defineStore } from 'pinia';
import { createBotSubStore } from './ftbot';
const AUTH_SELECTED_BOT = 'ftSelectedBot';

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
    allBotStores: (state) => Object.values(state.botStores),
    activeBot: (state) => state.botStores[state.selectedBot] as BotSubStore,
    activeBotorUndefined: (state) => state.botStores[state.selectedBot] as BotSubStore | undefined,
    canRunBacktest: (state) => state.botStores[state.selectedBot]?.canRunBacktest ?? false,
    selectedBotObj: (state) => state.availableBots[state.selectedBot],
    nextBotId: (state) => {
      let botCount = Object.keys(state.availableBots).length;

      while (`ftbot.${botCount}` in state.availableBots) {
        botCount += 1;
      }
      return `ftbot.${botCount}`;
    },
    allProfit: (state): Record<string, ProfitInterface> => {
      const result: Record<string, ProfitInterface> = {};
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
    allDailyStatsSelectedBots: (state): DailyReturnValue => {
      // Return aggregated daily stats for all bots - sorted ascending.
      const resp: Record<string, DailyRecord> = {};
      Object.entries(state.botStores).forEach(([, botStore]) => {
        if (botStore.isSelected) {
          botStore.dailyStats?.data?.forEach((d) => {
            if (!resp[d.date]) {
              resp[d.date] = { ...d };
            } else {
              resp[d.date].abs_profit += d.abs_profit;
              resp[d.date].fiat_value += d.fiat_value;
              resp[d.date].trade_count += d.trade_count;
            }
          });
        }
      });

      const dailyReturn: DailyReturnValue = {
        stake_currency: 'USDT',
        fiat_display_currency: 'USD',
        data: Object.values(resp).sort((a, b) => (a.date > b.date ? 1 : -1)),
      };
      return dailyReturn;
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
      if (!Object.keys(this.availableBots).includes(botId)) {
        // TODO: handle error!
        console.error('Bot not found');
        return;
      }
      this.botStores[botId].updateBot(bot);
      Object.assign(this.availableBots[botId], bot);
    },
    removeBot(botId: string) {
      if (Object.keys(this.availableBots).includes(botId)) {
        this.botStores[botId].logout();
        this.botStores[botId].$dispose();

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
        this.selectBot(this.availableBots[selBot || firstBot].botId);
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

        const botStoreUpdates: Promise<any>[] = [];
        this.allBotStores.forEach((bot) => {
          if (bot.isBotOnline && !bot.botStatusAvailable) {
            botStoreUpdates.push(bot.getState());
          }
        });
        await Promise.all(botStoreUpdates);

        const updates: Promise<void>[] = [];
        updates.push(this.allRefreshFrequent(false));
        updates.push(this.allRefreshSlow(true));
        // updates.push(this.getDaily());
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
    async allGetDaily(payload: DailyPayload) {
      const updates: Promise<DailyReturnValue>[] = [];

      this.allBotStores.forEach((bot) => {
        if (bot.isBotOnline) {
          updates.push(bot.getDaily(payload));
        }
      });
      await Promise.all(updates);
    },
    async forceSellMulti(forcesellPayload: MultiForcesellPayload) {
      return this.botStores[forcesellPayload.botId].forceexit(forcesellPayload);
    },
    async deleteTradeMulti(deletePayload: MultiDeletePayload) {
      return this.botStores[deletePayload.botId].deleteTrade(deletePayload.tradeid);
    },
    async cancelOpenOrderMulti(deletePayload: MultiDeletePayload) {
      return this.botStores[deletePayload.botId].cancelOpenOrder(deletePayload.tradeid);
    },
  },
});

export function initBots() {
  UserService.migrateLogin();

  const botStore = useBotStore();
  // This might need to be moved to the parent (?)
  Object.entries(UserService.getAvailableBots()).forEach(([, v]) => {
    botStore.addBot(v);
  });
  botStore.selectFirstBot();
  botStore.startRefresh();
  botStore.allRefreshFull();
}
