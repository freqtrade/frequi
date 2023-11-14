<template>
  <b-modal
    id="forceentry-modal"
    ref="modal"
    v-model="model"
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
        invalid-feedback="Order direction must be set"
        :state="orderSide !== undefined"
      >
        <b-form-radio-group
          id="order-direction"
          v-model="orderSide"
          :options="orderSideOptions"
          name="radios-btn-default"
          size="sm"
          buttons
          style="min-width: 10em"
          button-variant="outline-primary"
        ></b-form-radio-group>
      </b-form-group>
      <b-form-group
        label="Pair"
        label-for="pair-input"
        invalid-feedback="Pair is required"
        :state="selectedPair !== undefined"
      >
        <b-form-input
          id="pair-input"
          v-model="selectedPair"
          required
          @keydown.enter="handleEntry"
          @focus="inputSelect"
        ></b-form-input>
      </b-form-group>
      <b-form-group
        label="*Price [optional]"
        label-for="price-input"
        invalid-feedback="Price must be empty or a positive number"
        :state="!price || price > 0"
      >
        <b-form-input
          id="price-input"
          v-model="price"
          type="number"
          step="0.00000001"
          @keydown.enter="handleEntry"
        ></b-form-input>
      </b-form-group>
      <b-form-group
        :label="`*Stake-amount in ${botStore.activeBot.stakeCurrency} [optional]`"
        label-for="stake-input"
        invalid-feedback="Stake-amount must be empty or a positive number"
        :state="!stakeAmount || stakeAmount > 0"
      >
        <b-form-input
          id="stake-input"
          v-model="stakeAmount"
          type="number"
          step="0.000001"
          @keydown.enter="handleEntry"
        ></b-form-input>
      </b-form-group>
      <b-form-group
        v-if="botStore.activeBot.botApiVersion > 2.16 && botStore.activeBot.shortAllowed"
        :label="`*Leverage to apply [optional]`"
        label-for="leverage-input"
        invalid-feedback="Leverage must be empty or a positive number"
        :state="!leverage || leverage > 0"
      >
        <b-form-input
          id="leverage-input"
          v-model="leverage"
          type="number"
          step="0.01"
          @keydown.enter="handleEntry"
        ></b-form-input>
      </b-form-group>
      <b-form-group
        label="OrderType"
        label-for="ordertype-input"
        invalid-feedback="OrderType"
        :state="true"
      >
        <b-form-radio-group
          id="ordertype-input"
          v-model="ordertype"
          :options="orderTypeOptions"
          name="radios-btn-orderType"
          buttons
          button-variant="outline-primary"
          style="min-width: 10em"
          size="sm"
        ></b-form-radio-group>
      </b-form-group>
      <b-form-group
        v-if="botStore.activeBot.botApiVersion > 1.16"
        label="*Custom entry tag Optional]"
        label-for="enterTag-input"
      >
        <b-form-input
          id="enterTag-input"
          v-model="enterTag"
          type="text"
          name="radios-btn-orderType"
        ></b-form-input>
      </b-form-group>
    </form>
  </b-modal>
</template>

<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import { ForceEnterPayload, OrderSides } from '@/types';

const props = defineProps({
  modelValue: { required: true, default: false, type: Boolean },
  pair: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue']);
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

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit('update:modelValue', value);
  },
});

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
  emit('update:modelValue', false);
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
