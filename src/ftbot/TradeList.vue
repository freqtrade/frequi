<template>
  <table v-if="trades" class="table table-sm table-hover">
    <thead>
      <tr>
        <th>Pair</th>
        <th>Amount</th>
        <th>Open rate</th>
        <th>Current rate</th>
        <th>Stake amount</th>
        <th>Profit</th>
        <th>Open date</th>
        <th>Close date</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(trade, index) in trades" :key="index">
        <td>{{ trade.pair }}</td>
        <td>{{ trade.amount }}</td>
        <td>{{ trade.open_rate }}</td>
        <td>{{ trade.current_rate }}</td>
        <td>{{ trade.stake_amount }}</td>
        <td>{{ trade.close_profit }}</td>
        <td>{{ trade.open_date }}</td>
        <td>{{ trade.close_date }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'TradeList',
  props: {
    trades: {
      type: Array,
      required: true,
    },
  },
};
</script>
