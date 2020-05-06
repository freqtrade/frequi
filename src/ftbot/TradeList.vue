<template>
  <div class="card">
    <div class="card-header">{{ title }}</div>
    <table v-if="trades" class="table table-sm table-hover">
      <thead>
        <tr>
          <th>id</th>
          <th>Pair</th>
          <th>Amount</th>
          <th>Stake amount</th>
          <th>Open rate</th>
          <th>{{ activeTrades ? 'Current rate' : 'Close rate' }}</th>
          <th>{{ activeTrades ? 'Current Profit' : 'Profit' }}</th>
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
          <td>{{ activeTrades ? trade.current_rate : trade.close_rate }}</td>
          <td>{{ activeTrades ? trade.current_profit : trade.close_profit.toFixed(3) }}%</td>
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
    activeTrades: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
};
</script>
