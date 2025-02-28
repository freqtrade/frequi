import ToastEventBus from 'primevue/toasteventbus';

/**
 * @typedef {import('primevue/toastservice').ToastServiceMethods} ToastServiceMethods
 */

/**
 * @returns {ToastServiceMethods}
 */
export function useToast() {
  return {
    add: (message) => {
      ToastEventBus.emit('add', message);
    },
    remove: (message) => {
      ToastEventBus.emit('remove', message);
    },
    removeGroup: (group) => {
      ToastEventBus.emit('remove-group', group);
    },
    removeAllGroups: () => {
      ToastEventBus.emit('remove-all-groups');
    },
  };
}
