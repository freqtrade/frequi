import ConfirmDialogBox, {
  type ConfirmDialogBoxProps,
} from '../components/general/ConfirmDialogBox.vue';

export function useConfirmBox() {
  const overlay = useOverlay();

  return {
    confirm: (options: ConfirmDialogBoxProps): Promise<boolean> => {
      const modal = overlay.create(ConfirmDialogBox, {
        destroyOnClose: true,
        props: options,
      });

      return modal.open();
    },
  };
}
