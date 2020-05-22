<template>
  <div>
    <div class="mb-2">
      <h3>Performance</h3>
    </div>
    <b-table class="table-sm" :items="performanceStats" :fields="table_fields"></b-table>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Performance',
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
