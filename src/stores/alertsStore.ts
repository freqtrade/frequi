import type { AlertType } from '@/types/alertTypes';

export const useAlertsStore = defineStore('alerts', () => {
  const activeMessages = ref<AlertType[]>([]);

  const toast = useToast();

  function addAlert(message: AlertType) {
    // activeMessages.value.push(message);
    toast.add({
      summary: message.title,
      detail: message.message,
      severity: message.severity,
      life: message.timeout,
    });
  }

  function removeAlert(alert: AlertType) {
    activeMessages.value = activeMessages.value.filter((v) => v !== alert);
  }

  return {
    activeMessages,
    addAlert,
    removeAlert,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAlertsStore, import.meta.hot));
}
