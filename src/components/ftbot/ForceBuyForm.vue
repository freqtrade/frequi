<template>
  <div>
    <b-modal
      id="forcebuy-modal"
      ref="modal"
      title="Force buying a pair"
      @show="resetForm"
      @hidden="resetForm"
      @ok="handleBuy"
    >
      <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group label="Pair" label-for="pair-input" invalid-feedback="Pair is required">
          <b-form-input
            id="pair-input"
            v-model="pair"
            @keydown.enter.native="handleBuy"
            required
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
            @keydown.enter.native="handleBuy"
            type="number"
            step="0.01"
          ></b-form-input>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { ForcebuyPayload } from '@/store/types';

const ftbot = namespace('ftbot');

@Component({})
export default class ForceBuyForm extends Vue {
  pair = '';

  price = null;

  $refs!: {
    form: HTMLFormElement;
  };

  @ftbot.Action forcebuy!: (payload: ForcebuyPayload) => Promise<string>;

  created() {
    this.$bvModal.show();
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
    this.pair = '';
    this.price = null;
  }

  handleSubmit() {
    // Exit when the form isn't valid
    if (!this.checkFormValidity()) {
      return;
    }
    // call forcebuy
    const payload: ForcebuyPayload = { pair: this.pair };
    if (this.price) {
      payload.price = Number(this.price);
    }
    this.forcebuy(payload);
    this.$nextTick(() => {
      this.$bvModal.hide('forcebuy-modal');
    });
  }
}
</script>
