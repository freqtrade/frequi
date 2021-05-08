<template>
  <div>
    <div class="mb-2">
      <label class="mr-auto h3">Balance</label>
      <b-button class="float-right" size="sm" @click="getBalance">&#x21bb;</b-button>
      <b-form-checkbox
        v-model="hideSmallBalances"
        class="float-right"
        size="sm"
        title="Hide small balances"
        button
      >
        <HideIcon v-if="hideSmallBalances" :size="16" />
        <ShowIcon v-else :size="16" />
      </b-form-checkbox>
    </div>
    <div>
      <p v-if="balance.note">
        <strong>{{ balance.note }}</strong>
      </p>
      <b-table class="table-sm" :items="balanceCurrencies" :fields="tableFields">
        <template slot="bottom-row">
          <td><strong>Total</strong></td>
          <td></td>
          <!-- this is a computed prop that adds up all the expenses in the visible rows -->
          <td>
            <strong>{{ formatCurrency(balance.total) }}</strong>
          </td>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { BalanceInterface } from '@/types';
import HideIcon from 'vue-material-design-icons/EyeOff.vue';
import ShowIcon from 'vue-material-design-icons/Eye.vue';

const ftbot = namespace('ftbot');

@Component({
  components: { HideIcon, ShowIcon },
})
export default class Balance extends Vue {
  @ftbot.Action getBalance;

  @ftbot.State balance!: BalanceInterface;

  hideSmallBalances = true;

  smallBalance = 0.00001;

  get balanceCurrencies() {
    if (!this.hideSmallBalances) {
      return this.balance.currencies;
    }

    return this.balance.currencies.filter((v) => v.est_stake >= this.smallBalance);
  }

  get tableFields() {
    return [
      { key: 'currency', label: 'Currency' },
      { key: 'free', label: 'Available', formatter: 'formatCurrency' },
      { key: 'est_stake', label: `in ${this.balance.stake}`, formatter: 'formatCurrency' },
    ];
  }

  mounted() {
    this.getBalance();
  }

  formatCurrency(value) {
    return value ? value.toFixed(5) : '';
  }
}
</script>
