import { AlertType } from '@/types/alertTypes';

export const useAlertsStore = defineStore('alerts', {
  state: () => {
    return { activeMessages: [] as AlertType[] };
  },
  actions: {
    addAlert(message: AlertType) {
      this.activeMessages.push(message);
    },
    removeAlert(alert: AlertType) {
      this.activeMessages = this.activeMessages.filter((v) => v !== alert);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAlertsStore, import.meta.hot));
}
