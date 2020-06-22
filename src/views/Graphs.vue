<template>
  <div class="container-fluid">
    <div class="row mb-2">
      <div class="col-mb-2">
        <b-form-select :options="whitelist" v-model="pair" @change="refresh"> </b-form-select>
      </div>
      <div class="col-mb-2"></div>
    </div>
    <div class="row">
      <CandleChart :pair="pair" :timeframe="timeframe" :dataset="dataset"> </CandleChart>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapActions } from 'vuex';
import { namespace } from 'vuex-class';

import CandleChart from '@/components/ftbot/CandleChart.vue';

const ftbot = namespace('ftbot');

@Component({
  components: { CandleChart },
  methods: {
    ...mapActions('ftbot', ['getPairHistory', 'getWhitelist']),
  },
})
export default class Graphs extends Vue {
  pair = 'XRP/USDT';

  timeframe = '5m';

  @ftbot.State history;

  @ftbot.State whitelist;

  @ftbot.Action
  public getPairHistory;

  @ftbot.Action
  public getWhitelist;

  mounted() {
    this.getWhitelist();
    this.refresh();
  }

  get dataset() {
    return this.history[`${this.pair}__${this.timeframe}`];
  }

  refresh() {
    this.getPairHistory({ pair: this.pair, timeframe: this.timeframe, limit: 500 });
  }
}
</script>

<style scoped></style>
