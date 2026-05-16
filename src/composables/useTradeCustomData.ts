import TradeCustomDataModal from '@/components/ftbot/TradeCustomDataModal.vue';

export function useTradeCustomData() {
  const overlay = useOverlay();

  type TradeCustomDataProps = InstanceType<typeof TradeCustomDataModal>['$props'];

  return {
    showTradeCustomData: (options: TradeCustomDataProps): Promise<boolean> => {
      const modal = overlay.create(TradeCustomDataModal, {
        destroyOnClose: true,
        props: options,
      });

      return modal.open();
    },
  };
}
