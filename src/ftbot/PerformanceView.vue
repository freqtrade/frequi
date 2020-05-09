<template>
  <div class="card">
    <div class="card-header">Performance</div>
    <div class="card-body">
      <table v-if="performanceStats" class="table table-sm table-hover ">
        <thead>
          <tr>
            <th>Pair</th>
            <th>Profit</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(pair, index) in performanceStats" :key="index">
            <td>{{ pair.pair }}</td>
            <td>{{ pair.profit }}</td>
            <td>{{ pair.count }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'PerformanceView',
  computed: {
    ...mapState('ftbot', ['performanceStats']),
  },
};
</script>
