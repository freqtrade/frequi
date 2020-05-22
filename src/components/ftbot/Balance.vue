<template>
  <div>
    <div class="mb-2">
      <label class="mr-auto h3">Balance</label>
      <b-button class="float-right" size="sm" @click="getBalance">R</b-button>
    </div>
    <div>
      <p v-if="balance.note">
        <strong>{{ balance.note }}</strong>
      </p>
      <b-table class="table-sm" :items="balance.currencies" :fields="table_fields">
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

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'Balance',
  computed: {
    ...mapState('ftbot', ['balance']),
    table_fields() {
      return [
        { key: 'currency', label: 'Currency' },
        { key: 'free', label: 'Available', formatter: 'formatCurrency' },
        { key: 'est_stake', label: `in ${this.balance.stake}`, formatter: 'formatCurrency' },
      ];
    },
  },
  methods: {
    ...mapActions('ftbot', ['getBalance']),
    formatCurrency(value) {
      return value ? value.toFixed(5) : '';
    },
  },
  mounted() {
    this.getBalance();
  },
};
</script>
