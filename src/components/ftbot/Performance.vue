<template>
  <div>
    <div class="mb-2">
      <h3>Performance</h3>
    </div>
    <b-table class="table-sm" :items="performanceStats" :fields="tableFields"></b-table>
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
      tableFields: [
        { key: 'pair', label: 'Pair' },
        { key: 'profit', label: 'Profit' },
        { key: 'count', label: 'Count' },
      ],
    };
  },
};
</script>
