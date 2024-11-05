<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import { ForceSellPayload, Trade } from '@/types';

const props = defineProps({
  trade: {
    type: Object as () => Trade,
    required: true,
  },
  stakeCurrencyDecimals: {
    type: Number,
    required: true,
  },
});

const model = defineModel<boolean>();

const botStore = useBotStore();

const form = ref<HTMLFormElement>();
const amount = ref<number | undefined>(undefined);
const ordertype = ref('limit');

const checkFormValidity = () => {
  const valid = form.value?.checkValidity();

  return valid;
};

function handleSubmit() {
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
}

function resetForm() {
  amount.value = props.trade.amount;
  ordertype.value =
    botStore.activeBot.botState?.order_types?.force_exit ||
    botStore.activeBot.botState?.order_types?.exit ||
    'limit';
}

function handleEntry() {
  // Trigger submit handler
  handleSubmit();
}

const amountDebounced = refDebounced(amount, 250, { maxWait: 500 });

const amountInBase = computed<string>(() => {
  return amountDebounced.value && props.trade.current_rate
    ? `~${formatPriceCurrency(amountDebounced.value * props.trade.current_rate, props.trade.quote_currency || '', props.stakeCurrencyDecimals)} (Estimated value) `
    : '';
});
const orderTypeOptions = [
  { value: 'market', text: 'Market' },
  { value: 'limit', text: 'Limit' },
];
</script>

<template>
  <div>
    <BModal
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
        <BFormGroup
          label-for="stake-input"
          invalid-feedback="Amount must be empty or a positive number"
          :state="amount !== undefined && amount > 0"
        >
          <template #label>
            <span class="fst-italic">*Amount in {{ trade.base_currency }} [optional]</span>
            <span class="ms-1 fst-italic">{{ amountInBase }}</span>
          </template>
          <BFormInput id="stake-input" v-model="amount" type="number" step="0.000001"></BFormInput>
          <BFormInput
            id="stake-input"
            v-model="amount"
            type="range"
            step="0.000001"
            min="0"
            :max="trade.amount"
          ></BFormInput>
        </BFormGroup>

        <BFormGroup
          label="*OrderType"
          label-for="ordertype-input"
          invalid-feedback="OrderType"
          :state="ordertype !== undefined"
        >
          <BFormRadioGroup
            id="ordertype-input"
            v-model="ordertype"
            :options="orderTypeOptions"
            name="radios-btn-orderType"
            buttons
            button-variant="outline-primary"
            style="min-width: 10em"
            size="sm"
          ></BFormRadioGroup>
        </BFormGroup>
      </form>
    </BModal>
  </div>
</template>
