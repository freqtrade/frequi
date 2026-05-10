import type { ForceEntryFormProps } from '../components/ftbot/ForceEntryForm.vue';
import ForceEntryForm from '../components/ftbot/ForceEntryForm.vue';

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
  };
}
