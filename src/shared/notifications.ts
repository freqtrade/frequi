import { showAlert } from '@/stores/alerts';
import { useSettingsStore } from '@/stores/settings';
import { FTWsMessage, FtWsMessageTypes } from '@/types/wsMessageTypes';

export function showNotification(msg: FTWsMessage) {
  const settingsStore = useSettingsStore();
  if (settingsStore.notifications && settingsStore.notifications[msg.type]) {
    switch (msg.type) {
      case FtWsMessageTypes.entryFill:
        console.log('entryFill', msg);
        showAlert(`Entry fill for ${msg.pair} at ${msg.open_rate}`, 'success');
        break;
      case FtWsMessageTypes.exitFill:
        console.log('exitFill', msg);
        showAlert(`Exit fill for ${msg.pair} at ${msg.open_rate}`, 'success');
        break;
      case FtWsMessageTypes.exitCancel:
        console.log('exitCancel', msg);
        showAlert(`Exit order cancelled for ${msg.pair} due to ${msg.reason}`, 'warning');
        break;
      case FtWsMessageTypes.entryCancel:
        console.log('entryCancel', msg);
        showAlert(`Entry order cancelled for ${msg.pair} due to ${msg.reason}`, 'warning');
        break;
    }
  } else {
    console.log(`Message ${msg.type} not shown.`);
  }
}
