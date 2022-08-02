<template>
  <div>
    <b-modal
      id="forceentry-modal"
      ref="modal"
      title="Force entering a trade"
      @show="resetForm"
      @hidden="resetForm"
      @ok="handleEntry"
    >
      <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group
          v-if="botStore.activeBot.botApiVersion >= 2.13 && botStore.activeBot.shortAllowed"
          label="Order direction (Long or Short)"
          label-for="order-direction"
          invalid-feedback="Stake-amount must be empty or a positive number"
        >
          <b-select
            v-model="orderSide"
            class="ml-2"
            :options="['long', 'short']"
            style="min-width: 7em"
          >
          </b-select>
        </b-form-group>
        <b-form-group label="Pair" label-for="pair-input" invalid-feedback="Pair is required">
          <b-form-input
            id="pair-input"
            v-model="pair"
            required
            @keydown.enter.native="handleEntry"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="*Price [optional]"
          label-for="price-input"
          invalid-feedback="Price must be empty or a positive number"
        >
          <b-form-input
            id="price-input"
            v-model="price"
            type="number"
            step="0.00000001"
            @keydown.enter.native="handleEntry"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          v-if="botStore.activeBot.botApiVersion > 1.12"
          :label="`*Stake-amount in ${botStore.activeBot.stakeCurrency} [optional]`"
          label-for="stake-input"
          invalid-feedback="Stake-amount must be empty or a positive number"
        >
          <b-form-input
            id="stake-input"
            v-model="stakeAmount"
            type="number"
            step="0.000001"
            @keydown.enter.native="handleEntry"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          v-if="botStore.activeBot.botApiVersion > 2.16 && botStore.activeBot.shortAllowed"
          :label="`*Leverage to apply [optional]`"
          label-for="leverage-input"
          invalid-feedback="Leverage must be empty or a positive number"
        >
          <b-form-input
            id="leverage-input"
            v-model="leverage"
            type="number"
            step="1"
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
import { ForceEnterPayload, OrderSides } from '@/types';

import { defineComponent, ref, nextTick, getCurrentInstance } from 'vue';

export default defineComponent({
  name: 'ForceEntryForm',
  setup() {
    const root = getCurrentInstance();
    const botStore = useBotStore();

    const form = ref<HTMLFormElement>();
    const pair = ref('');
    const price = ref<number | null>(null);
    const stakeAmount = ref<number | null>(null);
    const leverage = ref<number | null>(null);

    const ordertype = ref('');
    const orderSide = ref<OrderSides>(OrderSides.long);

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
      const payload: ForceEnterPayload = { pair: pair.value };
      if (price.value) {
        payload.price = Number(price.value);
      }
      if (ordertype.value) {
        payload.ordertype = ordertype.value;
      }
      if (stakeAmount.value) {
        payload.stakeamount = stakeAmount.value;
      }
      if (botStore.activeBot.botApiVersion >= 2.13 && botStore.activeBot.shortAllowed) {
        payload.side = orderSide.value;
      }
      if (leverage.value) {
        payload.leverage = leverage.value;
      }
      botStore.activeBot.forceentry(payload);
      nextTick(() => {
        root?.proxy.$bvModal.hide('forceentry-modal');
      });
    };
    const resetForm = () => {
      console.log('resetForm');
      pair.value = '';
      price.value = null;
      stakeAmount.value = null;
      if (botStore.activeBot.botApiVersion > 1.1) {
        ordertype.value =
          botStore.activeBot.botState?.order_types?.forcebuy ||
          botStore.activeBot.botState?.order_types?.force_entry ||
          botStore.activeBot.botState?.order_types?.buy ||
          botStore.activeBot.botState?.order_types?.entry ||
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
      pair,
      price,
      stakeAmount,
      ordertype,
      orderSide,
      leverage,
    };
  },
});
</script>
