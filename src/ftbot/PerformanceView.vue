<template>
  <div class="card">
    <div class="card-header">Performance</div>
    <div class="card-body">
      <b-table class="table-sm" :items="performanceStats" :fields="table_fields"></b-table>
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
  data() {
    return {
      table_fields: [
        { key: 'pair', label: 'Pair' },
        { key: 'profit', label: 'Profit' },
        { key: 'count', label: 'Count' },
      ],
    };
  },
};
</script>
