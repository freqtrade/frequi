import type { FTWsMessage } from '@/types/wsMessageTypes';
import { FtWsMessageTypes } from '@/types/wsMessageTypes';

export function showNotification(msg: FTWsMessage, botname: string) {
  const settingsStore = useSettingsStore();
  if (settingsStore.notifications && settingsStore.notifications[msg.type]) {
    switch (msg.type) {
      case FtWsMessageTypes.entryFill:
        console.log('entryFill', msg);
        showAlert(
          `Entry fill: ${msg.pair} ${msg.direction} at ${msg.open_rate}`,
          'success',
          botname,
        );
        break;
      case FtWsMessageTypes.exitFill:
        console.log('exitFill', msg);
        showAlert(`Exit fill: ${msg.pair} ${msg.direction} ${msg.open_rate}`, 'success', botname);
        break;
      case FtWsMessageTypes.exitCancel:
        console.log('exitCancel', msg);
        showAlert(`Exit order cancelled for ${msg.pair} due to ${msg.reason}`, 'warn', botname);
        break;
      case FtWsMessageTypes.entryCancel:
        console.log('entryCancel', msg);
        showAlert(`Entry order cancelled for ${msg.pair} due to ${msg.reason}`, 'warn', botname);
        break;
    }
  } else {
    console.log(`${botname}: Message ${msg.type} not shown.`);
  }
}
