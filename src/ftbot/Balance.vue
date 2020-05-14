<template>
  <div class="card">
    <div class="card-header">Balance</div>
    <div class="card-body">
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
import { mapState } from 'vuex';

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
    formatCurrency(value) {
      return value.toFixed(5);
    },
  },
};
</script>
