import { UserService } from '@/shared/userService';
import {
  BotDescriptor,
  BotDescriptors,
  DailyPayload,
  MultiDeletePayload,
  MultiForcesellPayload,
  RenameBotPayload,
} from '@/types';
import { AxiosInstance } from 'axios';
import { defineStore } from 'pinia';
import { createBotSubStore } from './ftbot';
const AUTH_SELECTED_BOT = 'ftSelectedBot';

export interface SubStores {
  [key: string]: ReturnType<typeof createBotSubStore>;
}

export const useBotStore = defineStore('wrapper', {
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
    activeBot: (state) =>
      state.botStores[state.selectedBot] as ReturnType<typeof createBotSubStore>,
    selectedBotObj: (state) => state.availableBots[state.selectedBot],
    nextBotId: (state) => {
      let botCount = Object.keys(state.availableBots).length;

      while (`ftbot.${botCount}` in state.availableBots) {
        botCount += 1;
      }
      return `ftbot.${botCount}`;
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
    },
    renameBot(bot: RenameBotPayload) {
      if (!Object.keys(this.availableBots).includes(bot.botId)) {
        // TODO: handle error!
        console.error('Bot not found');
        return;
      }
      this.botStores[bot.botId].rename(bot.botName);
      this.availableBots[bot.botId].botName = bot.botName;
    },
    removeBot(botId: string) {
      if (Object.keys(this.availableBots).includes(botId)) {
        this.botStores[botId].logout();
        this.botStores[botId].$dispose();

        delete this.botStores[botId];
        delete this.availableBots[botId];
        // commit('removeBot', botId);
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
      const updates: Promise<any>[] = [];
      this.allBotStores.forEach(async (e) => {
        if (e.refreshNow && (this.globalAutoRefresh || forceUpdate)) {
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
        this.allBotStores.forEach(async (e) => {
          if (e.isBotOnline && !e.botStatusAvailable) {
            await this.allGetState();
          }
        });
        const updates: Promise<any>[] = [];
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
        Object.entries(this.botStores).map(async ([_, v]) => {
          try {
            await v.ping();
          } catch {
            // pass
          }
        }),
      );
    },
    allGetState() {
      Object.entries(this.botStores).map(async ([_, v]) => {
        try {
          await v.getState();
        } catch {
          // pass
        }
      });
    },
    allGetDaily(payload: DailyPayload) {
      this.allBotStores.forEach((e) => {
        e.getDaily(payload);
      });
    },
    async forceSellMulti(forcesellPayload: MultiForcesellPayload) {
      //   return dispatch(`${forcesellPayload.botId}/${[BotStoreActions.forcesell]}`, forcesellPayload);
    },
    async deleteTradeMulti(deletePayload: MultiDeletePayload) {
      //   return dispatch(
      //     `${deletePayload.botId}/${[BotStoreActions.deleteTrade]}`,
      //     deletePayload.tradeid,
      //   );
    },
  },
});
