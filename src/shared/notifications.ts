import { showAlert } from '@/shared/alerts';
import { useSettingsStore } from '@/stores/settings';
import { FTWsMessage, FtWsMessageTypes } from '@/types/wsMessageTypes';

export function showNotification(msg: FTWsMessage, botname: string) {
  const settingsStore = useSettingsStore();
  if (settingsStore.notifications && settingsStore.notifications[msg.type]) {
    switch (msg.type) {
      case FtWsMessageTypes.entryFill:
        console.log('entryFill', msg);
        showAlert(`${botname}: Entry fill for ${msg.pair} at ${msg.open_rate}`, 'success');
        break;
      case FtWsMessageTypes.exitFill:
        console.log('exitFill', msg);
        showAlert(`${botname}: Exit fill for ${msg.pair} at ${msg.open_rate}`, 'success');
        break;
      case FtWsMessageTypes.exitCancel:
        console.log('exitCancel', msg);
        showAlert(
          `${botname}: Exit order cancelled for ${msg.pair} due to ${msg.reason}`,
          'warning',
        );
        break;
      case FtWsMessageTypes.entryCancel:
        console.log('entryCancel', msg);
        showAlert(
          `${botname}: Entry order cancelled for ${msg.pair} due to ${msg.reason}`,
          'warning',
        );
        break;
    }
  } else {
    console.log(`${botname}: Message ${msg.type} not shown.`);
  }
}
