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
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { BotState, ForceEnterPayload, OrderSides } from '@/types';
import { BotStoreGetters } from '@/store/modules/ftbot';
import StoreModules from '@/store/storeSubModules';

const ftbot = namespace(StoreModules.ftbot);

@Component({})
export default class ForceBuyForm extends Vue {
  pair = '';

  price = null;

  stakeAmount = null;

  ordertype?: string = '';

  orderSide: OrderSides = OrderSides.long;

  $refs!: {
    form: HTMLFormElement;
  };

  @ftbot.Getter [BotStoreGetters.botState]?: BotState;

  @ftbot.Getter [BotStoreGetters.shortAllowed]?: boolean;

  @ftbot.Getter [BotStoreGetters.botApiVersion]: number;

  @ftbot.Getter [BotStoreGetters.stakeCurrency]!: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action forcebuy!: (payload: ForceEnterPayload) => Promise<string>;

  created() {
    this.$bvModal.show('forcebuy-modal');
  }

  close() {
    this.$emit('close');
  }

  checkFormValidity() {
    const valid = this.$refs.form.checkValidity();

    return valid;
  }

  handleBuy(bvModalEvt) {
    // Prevent modal from closing
    bvModalEvt.preventDefault();
    // Trigger submit handler
    this.handleSubmit();
  }

  resetForm() {
    console.log('resetForm');
    this.pair = '';
    this.price = null;
    this.stakeAmount = null;
    if (this.botApiVersion > 1.1) {
      this.ordertype =
        this.botState?.order_types?.forcebuy ||
        this.botState?.order_types?.forceentry ||
        this.botState?.order_types?.buy ||
        this.botState?.order_types?.entry;
    }
  }

  handleSubmit() {
    // Exit when the form isn't valid
    if (!this.checkFormValidity()) {
      return;
    }
    // call forcebuy
    const payload: ForceEnterPayload = { pair: this.pair };
    if (this.price) {
      payload.price = Number(this.price);
    }
    if (this.ordertype) {
      payload.ordertype = this.ordertype;
    }
    if (this.stakeAmount) {
      payload.stakeamount = this.stakeAmount;
    }
    if (this.botApiVersion >= 2.13) {
      payload.side = this.orderSide;
    }
    this.forcebuy(payload);
    this.$nextTick(() => {
      this.$bvModal.hide('forcebuy-modal');
    });
  }
}
</script>
