<template>
  <div>
    <h2>{{ title }}</h2>
    <table v-if="trades" class="table table-sm table-hover">
      <thead>
        <tr>
          <th>id</th>
          <th>Pair</th>
          <th>Amount</th>
          <th>Stake amount</th>
          <th>Open rate</th>
          <th>Close rate</th>
          <th>Profit</th>
          <th>Open date</th>
          <th>Close date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(trade, index) in trades" :key="index">
          <td>{{ trade.trade_id }}</td>
          <td>{{ trade.pair }}</td>
          <td>{{ trade.amount }}</td>
          <td>{{ trade.stake_amount }}</td>
          <td>{{ trade.open_rate }}</td>
          <td>{{ trade.close_rate }}</td>
          <td>{{ trade.close_profit }}</td>
          <td>{{ trade.open_date }}</td>
          <td>{{ trade.close_date }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'TradeList',
  props: {
    trades: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: false,
      default: 'Trades',
    },
  },
};
</script>
