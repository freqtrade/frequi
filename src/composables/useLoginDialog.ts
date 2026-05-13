import LoginDialog from '@/components/LoginModal.vue';
import type { LoginModalProps } from '@/components/LoginModal.vue';

export function useLoginDialog() {
  const overlay = useOverlay();

  return (options: LoginModalProps): Promise<boolean> => {
    const modal = overlay.create(LoginDialog, {
      destroyOnClose: true,
      props: options,
    });
    return modal.open();
  };
}
