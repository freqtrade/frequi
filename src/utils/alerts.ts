import { AlertSeverity } from '@/types/alertTypes';

export function showAlert(message: string, severity: AlertSeverity = 'warning', bot: string = '') {
  const alertStore = useAlertsStore();

  alertStore.addAlert({
    message,
    title: `${bot ? 'Bot: ' + bot : 'Notification'}`,
    severity,
    timeout: 5000,
  });
}

export function useAlertForBot(botName: string) {
  return {
    showAlert: (message: string, severity: AlertSeverity = 'warning') => {
      showAlert(message, severity, botName);
    },
  };
}
