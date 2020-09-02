<template>
  <div class="container-fluid h-100">
    <div class="row">
      <div class="row col-md-4">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12">
              <ReloadControl />
              <BotControls class="mt-3" />
            </div>
            <div class="col-md-12">
              <b-tabs content-class="mt-3" class="mt-3">
                <b-tab title="Status" active>
                  <BotStatus />
                </b-tab>
                <b-tab title="Performance">
                  <Performance class="performance-view" />
                </b-tab>
                <b-tab title="Balance" lazy>
                  <Balance />
                </b-tab>
                <b-tab title="Daily Stats" lazy>
                  <DailyStats />
                </b-tab>

                <b-tab title="Pairlist" lazy>
                  <FTBotAPIPairList />
                </b-tab>
              </b-tabs>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-12">
            <TradeList
              class="open-trades"
              :trades="openTrades"
              title="Open trades"
              :active-trades="true"
              empty-text="Currently no open trades."
            />
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <TradeList
              v-if="!detailTradeId"
              class="trade-history"
              :trades="closedTrades"
              title="Trade history"
              empty-text="No closed trades so far."
            />
            <TradeDetail v-if="detailTradeId" :trade="tradeDetail"></TradeDetail>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <LogViewer />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

import TradeList from '@/components/ftbot/TradeList.vue';
import Performance from '@/components/ftbot/Performance.vue';
import BotControls from '@/components/ftbot/BotControls.vue';
import BotStatus from '@/components/ftbot/BotStatus.vue';
import Balance from '@/components/ftbot/Balance.vue';
import DailyStats from '@/components/ftbot/DailyStats.vue';
import FTBotAPIPairList from '@/components/ftbot/FTBotAPIPairList.vue';
import TradeDetail from '@/components/ftbot/TradeDetail.vue';
import ReloadControl from '@/components/ftbot/ReloadControl.vue';
import LogViewer from '@/components/ftbot/LogViewer.vue';

import { Trade } from '@/types';
import { UserStoreGetters } from '@/store/modules/ftbot';

const ftbot = namespace('ftbot');

@Component({
  components: {
    TradeList,
    Performance,
    BotControls,
    BotStatus,
    Balance,
    DailyStats,
    FTBotAPIPairList,
    TradeDetail,
    ReloadControl,
    LogViewer,
  },
})
export default class Trading extends Vue {
  @ftbot.State detailTradeId!: number;

  @ftbot.Getter openTrades!: Trade[];

  @ftbot.Getter closedTrades!: Trade[];

  @ftbot.Getter [UserStoreGetters.tradeDetail]!: Trade;
}
</script>

<style scoped>
.open-trades {
  min-height: 250px;
  max-height: 300px;
}
.trade-history {
  min-height: 300px;
  max-height: 500px;
}
</style>
