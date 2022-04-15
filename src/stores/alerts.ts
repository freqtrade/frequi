import { defineStore } from 'pinia';
import { AlertType } from '@/types/alertTypes';

export const useAlertsStore = defineStore('alerts', {
  state: () => {
    return { activeMessages: [] as AlertType[] };
  },
  actions: {
    addAlert(message: AlertType) {
      this.activeMessages.push(message);
    },
    removeAlert() {
      this.activeMessages.shift();
    },
  },
});

export function showAlert(message: string, severity = '') {
  const alertsStore = useAlertsStore();
  alertsStore.addAlert({ message, severity });
}
