<template>
  <div>
    <b-modal
      id="forceexit-modal"
      ref="modal"
      title="Force exiting a trade"
      @show="resetForm"
      @hidden="resetForm"
      @ok="handleEntry"
    >
      <form ref="form" @submit.stop.prevent="handleSubmit">
        <p>
          <span>Exiting Trade #{{ trade.trade_id }} {{ trade.pair }}.</span>
          <br />
          <span>Currently owning {{ trade.amount }} {{ trade.base_currency }}</span>
        </p>
        <b-form-group
          v-if="botStore.activeBot.botApiVersion > 1.12"
          :label="`*amount in ${trade.base_currency} [optional]`"
          label-for="stake-input"
          invalid-feedback="Amount must be empty or a positive number"
        >
          <b-form-input
            id="stake-input"
            v-model="amount"
            type="number"
            step="0.000001"
            @keydown.enter.native="handleEntry"
          ></b-form-input>
          <b-form-input
            id="stake-input"
            v-model="amount"
            type="range"
            step="0.000001"
            min="0"
            :max="trade.amount"
            @keydown.enter.native="handleEntry"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          v-if="botStore.activeBot.botApiVersion > 1.1"
          label="*OrderType"
          label-for="ordertype-input"
          invalid-feedback="OrderType"
        >
          <b-select
            v-model="ordertype"
            class="ml-2"
            :options="['market', 'limit']"
            style="min-width: 7em"
            size="sm"
          >
          </b-select>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import { ForceSellPayload, Trade } from '@/types';

import { defineComponent, ref, nextTick, getCurrentInstance } from 'vue';

export default defineComponent({
  name: 'ForceExitForm',
  props: {
    trade: {
      type: Object as () => Trade,
      required: true,
    },
  },
  setup(props) {
    const root = getCurrentInstance();
    const botStore = useBotStore();

    const form = ref<HTMLFormElement>();
    const amount = ref<number | null>(null);
    const ordertype = ref('limit');

    const checkFormValidity = () => {
      const valid = form.value?.checkValidity();

      return valid;
    };

    const handleSubmit = () => {
      // Exit when the form isn't valid
      if (!checkFormValidity()) {
        return;
      }
      // call forceentry
      const payload: ForceSellPayload = { tradeid: String(props.trade.trade_id) };

      if (ordertype.value) {
        payload.ordertype = ordertype.value;
      }
      if (amount.value) {
        payload.amount = amount.value;
      }
      botStore.activeBot.forceexit(payload);
      nextTick(() => {
        root?.proxy.$bvModal.hide('forceexit-modal');
      });
    };
    const resetForm = () => {
      amount.value = props.trade.amount;
      if (botStore.activeBot.botApiVersion > 1.1) {
        ordertype.value =
          botStore.activeBot.botState?.order_types?.force_exit ||
          botStore.activeBot.botState?.order_types?.exit ||
          'limit';
      }
    };

    const handleEntry = (bvModalEvt) => {
      // Prevent modal from closing
      bvModalEvt.preventDefault();
      // Trigger submit handler
      handleSubmit();
    };
    return {
      handleSubmit,
      botStore,
      form,
      handleEntry,
      resetForm,
      amount,
      ordertype,
    };
  },
});
</script>
