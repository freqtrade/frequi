<script setup lang="ts">
import type { ForceExitPayload, Trade } from '@/types';
import { ref, computed } from 'vue';
import { refDebounced } from '@vueuse/core';

const props = defineProps<{
  trade: Trade;
  stakeCurrencyDecimals: number;
}>();

const model = defineModel<boolean>();

const botStore = useBotStore();

const form = ref<HTMLFormElement>();
const amount = ref<number | undefined>(undefined);
const price = ref<number | undefined>(undefined);
const ordertype = ref('limit');

const checkFormValidity = () => {
  const valid = form.value?.checkValidity();

  return valid;
};

async function handleSubmit() {
  // Exit when the form isn't valid
  if (!checkFormValidity()) {
    return;
  }
  // call forceentry
  const payload: ForceExitPayload = { tradeid: String(props.trade.trade_id) };

  if (ordertype.value) {
    payload.ordertype = ordertype.value;
  }
  if (amount.value) {
    payload.amount = amount.value;
  }
  if (price.value && botStore.activeBot.botFeatures.forceExitWithPrice) {
    payload.price = price.value;
  }
  await nextTick();
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

function handleExit() {
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
  <Dialog
    v-model:visible="model"
    :header="`Force exiting a trade`"
    modal
    @show="resetForm"
    @hide="resetForm"
  >
    <form ref="form" class="space-y-4 md:min-w-[32rem]" @submit.prevent="handleSubmit">
      <div class="mb-4">
        <p class="mb-2">
          <span>Exiting Trade #{{ trade.trade_id }} {{ trade.pair }}.</span>
          <br />
          <span>Currently owning {{ trade.amount }} {{ trade.base_currency }}</span>
        </p>
      </div>

      <div>
        <label for="stake-input" class="block font-medium mb-1">
          Amount in {{ trade.base_currency }} [optional]
          <span class="text-sm italic ml-1">{{ amountInBase }}</span>
        </label>
        <div class="space-y-2">
          <InputNumber
            id="stake-input"
            v-model="amount"
            :min="0"
            :max="trade.amount"
            :use-grouping="false"
            :step="trade.amount_precision ?? 0.000001"
            :max-fraction-digits="8"
            class="w-full"
            show-buttons
          />
          <Slider
            v-model="amount"
            :min="0"
            :max="trade.amount"
            :step="trade.amount_precision ?? 0.000001"
            class="w-full"
          />
        </div>
      </div>
      <div v-if="botStore.activeBot.botFeatures.forceExitWithPrice">
        <label for="price-input" class="block font-medium mb-1">
          Price
          <span class="text-sm italic ml-1">Only available with limit orders</span>
        </label>
        <div class="space-y-2">
          <InputNumber
            id="price-input"
            v-model="price"
            :disabled="ordertype !== 'limit'"
            :min="0"
            :use-grouping="false"
            :step="trade.price_precision ?? 0.000001"
            :max-fraction-digits="8"
            class="w-full"
            show-buttons
          />
        </div>
      </div>

      <div>
        <label class="block font-medium mb-1">*OrderType</label>
        <SelectButton
          v-model="ordertype"
          :options="orderTypeOptions"
          :allow-empty="false"
          option-label="text"
          option-value="value"
          size="small"
          class="w-full"
        />
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button severity="secondary" size="small" @click="model = false">Cancel</Button>
        <Button severity="primary" size="small" @click="handleExit">Exit Position</Button>
      </div>
    </template>
  </Dialog>
</template>
