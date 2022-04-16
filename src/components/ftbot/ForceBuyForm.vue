<template>
  <div>
    <b-modal
      id="forcebuy-modal"
      ref="modal"
      title="Force entering a trade"
      @show="resetForm"
      @hidden="resetForm"
      @ok="handleBuy"
    >
      <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group
          v-if="botApiVersion >= 2.13 && shortAllowed"
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
            @keydown.enter.native="handleBuy"
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
            @keydown.enter.native="handleBuy"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          v-if="botApiVersion > 1.12"
          :label="`*Stake-amount in ${stakeCurrency} [optional]`"
          label-for="stake-input"
          invalid-feedback="Stake-amount must be empty or a positive number"
        >
          <b-form-input
            id="stake-input"
            v-model="stakeAmount"
            type="number"
            step="0.000001"
            @keydown.enter.native="handleBuy"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          v-if="botApiVersion > 1.1"
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
import { BotStoreGetters } from '@/store/modules/ftbot';
import StoreModules from '@/store/storeSubModules';
import { ForceEnterPayload, OrderSides } from '@/types';

import { defineComponent, ref, nextTick } from '@vue/composition-api';
import { useNamespacedActions, useNamespacedGetters } from 'vuex-composition-helpers';

export default defineComponent({
  name: 'ForceBuyForm',
  setup(_, { root }) {
    const { botState, shortAllowed, botApiVersion, stakeCurrency } = useNamespacedGetters(
      StoreModules.ftbot,
      [
        BotStoreGetters.botState,
        BotStoreGetters.shortAllowed,
        BotStoreGetters.botApiVersion,
        BotStoreGetters.stakeCurrency,
      ],
    );
    const { forcebuy } = useNamespacedActions(StoreModules.ftbot, ['forcebuy']);
    const form = ref<HTMLFormElement>();
    const pair = ref('');
    const price = ref<number | null>(null);
    const stakeAmount = ref<number | null>(null);
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
      // call forcebuy
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
      if (botApiVersion.value >= 2.13) {
        payload.side = orderSide.value;
      }
      forcebuy(payload);
      nextTick(() => {
        root.$bvModal.hide('forcebuy-modal');
      });
    };
    const resetForm = () => {
      console.log('resetForm');
      pair.value = '';
      price.value = null;
      stakeAmount.value = null;
      if (botApiVersion.value > 1.1) {
        ordertype.value =
          botState.value?.order_types?.forcebuy ||
          botState.value?.order_types?.force_entry ||
          botState.value?.order_types?.buy ||
          botState.value?.order_types?.entry;
      }
    };

    const handleBuy = (bvModalEvt) => {
      // Prevent modal from closing
      bvModalEvt.preventDefault();
      // Trigger submit handler
      handleSubmit();
    };
    return {
      handleSubmit,
      botState,
      shortAllowed,
      botApiVersion,
      stakeCurrency,
      form,
      handleBuy,
      resetForm,
      pair,
      price,
      stakeAmount,
      ordertype,
      orderSide,
    };
  },
});
</script>
