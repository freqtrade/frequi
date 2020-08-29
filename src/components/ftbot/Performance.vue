<template>
  <div>
    <div class="mb-2">
      <h3>Performance</h3>
    </div>
    <b-table class="table-sm" :items="performanceStats" :fields="tableFields"></b-table>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { PerformanceEntry } from '@/types';

const ftbot = namespace('ftbot');

@Component({})
export default class Performance extends Vue {
  @ftbot.State performanceStats!: Array<PerformanceEntry>;

  private tableFields = [
    { key: 'pair', label: 'Pair' },
    { key: 'profit', label: 'Profit' },
    { key: 'count', label: 'Count' },
  ];
}
</script>
