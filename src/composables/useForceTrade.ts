import ForceEntryForm, { type ForceEntryFormProps } from '../components/ftbot/ForceEntryForm.vue';
import ForceExitForm, { type ForceExitFormProps } from '../components/ftbot/ForceExitForm.vue';

export function useForceTrade() {
  const overlay = useOverlay();

  return {
    forceEntryDialog: (options: ForceEntryFormProps): Promise<boolean> => {
      const modal = overlay.create(ForceEntryForm, {
        destroyOnClose: true,
        props: options,
      });

      return modal.open();
    },
    forceExitDialog: (options: ForceExitFormProps): Promise<boolean> => {
      const modal = overlay.create(ForceExitForm, {
        destroyOnClose: true,
        props: options,
      });

      return modal.open();
    },
  };
}
