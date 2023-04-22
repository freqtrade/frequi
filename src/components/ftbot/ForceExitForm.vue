<template>
  <div>
    <b-modal
      id="forceexit-modal"
      v-model="model"
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
          :label="`*Amount in ${trade.base_currency} [optional]`"
          label-for="stake-input"
          invalid-feedback="Amount must be empty or a positive number"
          :state="amount !== undefined && amount > 0"
        >
          <b-form-input
            id="stake-input"
            v-model="amount"
            type="number"
            step="0.000001"
            @keydown.enter="handleEntry"
          ></b-form-input>
          <b-form-input
            id="stake-input"
            v-model="amount"
            type="range"
            step="0.000001"
            min="0"
            :max="trade.amount"
            @keydown.enter="handleEntry"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          label="*OrderType"
          label-for="ordertype-input"
          invalid-feedback="OrderType"
          :state="ordertype !== undefined"
        >
          <b-form-select
            v-model="ordertype"
            class="ms-2"
            :options="['market', 'limit']"
            style="min-width: 7em"
            size="sm"
          >
          </b-form-select>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import { ForceSellPayload, Trade } from '@/types';

import { ref, computed } from 'vue';

const props = defineProps({
  trade: {
    type: Object as () => Trade,
    required: true,
  },
  modelValue: { required: true, default: false, type: Boolean },
});
const emit = defineEmits(['update:modelValue']);
const botStore = useBotStore();

const form = ref<HTMLFormElement>();
const amount = ref<number | undefined>(undefined);
const ordertype = ref('limit');

const checkFormValidity = () => {
  const valid = form.value?.checkValidity();

  return valid;
};

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit('update:modelValue', value);
  },
});

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
  model.value = false;
};
const resetForm = () => {
  amount.value = props.trade.amount;
  ordertype.value =
    botStore.activeBot.botState?.order_types?.force_exit ||
    botStore.activeBot.botState?.order_types?.exit ||
    'limit';
};

const handleEntry = () => {
  // Trigger submit handler
  handleSubmit();
};
</script>
