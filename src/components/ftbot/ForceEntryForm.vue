<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import { ForceEnterPayload, OrderSides } from '@/types';

const props = defineProps({
  pair: { type: String, default: '' },
  positionIncrease: { type: Boolean, default: false },
});
const model = defineModel<boolean>();
const botStore = useBotStore();

const form = ref<HTMLFormElement>();
const selectedPair = ref('');
const price = ref<number | undefined>(undefined);
const stakeAmount = ref<number | undefined>(undefined);
const leverage = ref<number | undefined>(undefined);

const ordertype = ref('');
const orderSide = ref<OrderSides>(OrderSides.long);
const enterTag = ref('force_entry');

const orderTypeOptions = [
  { value: 'market', text: 'Market' },
  { value: 'limit', text: 'Limit' },
];
const orderSideOptions = [
  { value: 'long', text: 'Long' },
  { value: 'short', text: 'Short' },
];

const checkFormValidity = () => {
  const valid = form.value?.checkValidity();

  return valid;
};

const handleSubmit = async () => {
  // Exit when the form isn't valid
  if (!checkFormValidity()) {
    return;
  }

  // call forceentry
  const payload: ForceEnterPayload = { pair: selectedPair.value };
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
  if (botStore.activeBot.botApiVersion >= 2.16 && enterTag.value) {
    payload.entry_tag = enterTag.value;
  }

  if (leverage.value) {
    payload.leverage = leverage.value;
  }
  botStore.activeBot.forceentry(payload);
  await nextTick();
  model.value = false;
};
const resetForm = () => {
  console.log('resetForm');
  selectedPair.value = props.pair;
  price.value = undefined;
  stakeAmount.value = undefined;
  ordertype.value =
    botStore.activeBot.botState?.order_types?.forcebuy ||
    botStore.activeBot.botState?.order_types?.force_entry ||
    botStore.activeBot.botState?.order_types?.buy ||
    botStore.activeBot.botState?.order_types?.entry ||
    'limit';
};

const handleEntry = () => {
  // Trigger submit handler
  handleSubmit();
};
const inputSelect = (bvModalEvt) => {
  bvModalEvt.srcElement?.select();
};
</script>

<template>
  <BModal
    id="forceentry-modal"
    ref="modal"
    v-model="model"
    :title="positionIncrease ? `Increasing position for ${pair}` : 'Force entering a trade'"
    @show="resetForm"
    @hidden="resetForm"
    @ok="handleEntry"
  >
    <form ref="form" @submit.stop.prevent="handleSubmit">
      <BFormGroup
        v-if="botStore.activeBot.botApiVersion >= 2.13 && botStore.activeBot.shortAllowed"
        label="Order direction (Long or Short)"
        label-for="order-direction"
        invalid-feedback="Order direction must be set"
        :state="orderSide !== undefined"
        label-class="mb-1"
        class="mb-2"
      >
        <BFormRadioGroup
          id="order-direction"
          v-model="orderSide"
          :options="orderSideOptions"
          name="radios-btn-default"
          size="sm"
          buttons
          style="min-width: 10em"
          button-variant="outline-primary"
        ></BFormRadioGroup>
      </BFormGroup>
      <BFormGroup
        label="Pair"
        label-for="pair-input"
        invalid-feedback="Pair is required"
        :state="selectedPair !== undefined"
        label-class="mb-1"
        class="mb-2"
      >
        <BFormInput
          id="pair-input"
          v-model="selectedPair"
          required
          :disabled="positionIncrease"
          @keydown.enter="handleEntry"
          @focus="inputSelect"
        ></BFormInput>
      </BFormGroup>
      <BFormGroup
        label="*Price [optional]"
        label-for="price-input"
        invalid-feedback="Price must be empty or a positive number"
        :state="!price || price > 0"
        label-class="mb-1"
        class="mb-2"
      >
        <BFormInput
          id="price-input"
          v-model="price"
          type="number"
          step="0.00000001"
          @keydown.enter="handleEntry"
        ></BFormInput>
      </BFormGroup>
      <BFormGroup
        :label="`*Stake-amount in ${botStore.activeBot.stakeCurrency} [optional]`"
        label-for="stake-input"
        invalid-feedback="Stake-amount must be empty or a positive number"
        :state="!stakeAmount || stakeAmount > 0"
        label-class="mb-1"
        class="mb-2"
      >
        <BFormInput
          id="stake-input"
          v-model="stakeAmount"
          type="number"
          step="0.000001"
          @keydown.enter="handleEntry"
        ></BFormInput>
      </BFormGroup>
      <BFormGroup
        v-if="botStore.activeBot.botApiVersion > 2.16 && botStore.activeBot.shortAllowed"
        :label="`*Leverage to apply [optional]`"
        label-for="leverage-input"
        invalid-feedback="Leverage must be empty or a positive number"
        :state="!leverage || leverage > 0"
        label-class="mb-0"
        class="mb-2"
      >
        <BFormInput
          id="leverage-input"
          v-model="leverage"
          type="number"
          step="0.01"
          @keydown.enter="handleEntry"
        ></BFormInput>
      </BFormGroup>
      <BFormGroup
        label="OrderType"
        label-for="ordertype-input"
        invalid-feedback="OrderType"
        :state="true"
        label-class="mb-1"
        class="mb-2"
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
      <BFormGroup
        v-if="botStore.activeBot.botApiVersion > 1.16"
        label="*Custom entry tag Optional]"
        label-for="enterTag-input"
        label-class="mb-1"
        class="mb-2"
      >
        <BFormInput
          id="enterTag-input"
          v-model="enterTag"
          type="text"
          name="radios-btn-orderType"
        ></BFormInput>
      </BFormGroup>
    </form>
  </BModal>
</template>
