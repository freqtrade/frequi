<template>
  <div class="mb-2">
    <span>Strategy</span>
    <StrategySelect v-model="btStore.strategy"></StrategySelect>
  </div>
  <b-card :disabled="botStore.activeBot.backtestRunning">
    <!-- Backtesting parameters -->
    <b-form-group
      label-cols-lg="2"
      label="Backtest params"
      label-size="sm"
      label-class="fw-bold pt-0"
      class="mb-0"
    >
      <b-form-group
        label-cols-sm="5"
        label="Timeframe:"
        label-align-sm="right"
        label-for="timeframe-select"
      >
        <TimeframeSelect id="timeframe-select" v-model="btStore.selectedTimeframe" />
      </b-form-group>
      <b-form-group
        label-cols-sm="5"
        label="Detail Timeframe:"
        label-align-sm="right"
        label-for="timeframe-detail-select"
        title="Detail timeframe, to simulate intra-candle results. Not setting this will not use this functionality."
      >
        <TimeframeSelect
          id="timeframe-detail-select"
          v-model="btStore.selectedDetailTimeframe"
          :below-timeframe="btStore.selectedTimeframe"
        />
      </b-form-group>

      <b-form-group
        label-cols-sm="5"
        label="Max open trades:"
        label-align-sm="right"
        label-for="max-open-trades"
      >
        <b-form-input
          id="max-open-trades"
          v-model="btStore.maxOpenTrades"
          placeholder="Use strategy default"
          type="number"
        ></b-form-input>
      </b-form-group>
      <b-form-group
        label-cols-sm="5"
        label="Starting capital:"
        label-align-sm="right"
        label-for="starting-capital"
      >
        <b-form-input
          id="starting-capital"
          v-model="btStore.startingCapital"
          type="number"
          step="0.001"
        ></b-form-input>
      </b-form-group>
      <b-form-group
        label-cols-sm="5"
        label="Stake amount:"
        label-align-sm="right"
        label-for="stake-amount"
      >
        <div class="d-flex">
          <b-form-checkbox
            id="stake-amount-bool"
            v-model="btStore.stakeAmountUnlimited"
            class="col-md-6"
            >Unlimited stake</b-form-checkbox
          >

          <b-form-input
            id="stake-amount"
            v-model="btStore.stakeAmount"
            type="number"
            placeholder="Use strategy default"
            step="0.01"
            :disabled="btStore.stakeAmountUnlimited"
          ></b-form-input>
        </div>
      </b-form-group>

      <b-form-group
        label-cols-sm="5"
        label="Enable Protections:"
        label-align-sm="right"
        label-for="enable-protections"
      >
        <b-form-checkbox
          id="enable-protections"
          v-model="btStore.enableProtections"
        ></b-form-checkbox>
      </b-form-group>
      <b-form-group
        v-if="botStore.activeBot.botApiVersion >= 2.22"
        label-cols-sm="5"
        label="Cache Backtest results:"
        label-align-sm="right"
        label-for="enable-cache"
      >
        <b-form-checkbox id="enable-cache" v-model="btStore.allowCache"></b-form-checkbox>
      </b-form-group>
      <template v-if="botStore.activeBot.botApiVersion >= 2.22">
        <b-form-group
          label-cols-sm="5"
          label="Enable FreqAI:"
          label-align-sm="right"
          label-for="enable-freqai"
        >
          <template #label>
            <div class="d-flex justify-content-center">
              <span class="me-2">Enable FreqAI:</span>
              <InfoBox
                hint="Assumes freqAI configuration is setup in the configuration, and the strategy is a freqAI strategy. Will fail if that's not the case."
              />
            </div>
          </template>
          <b-form-checkbox id="enable-freqai" v-model="btStore.freqAI.enabled"></b-form-checkbox>
        </b-form-group>
        <b-form-group
          v-if="btStore.freqAI.enabled"
          label-cols-sm="5"
          label="FreqAI identifier:"
          label-align-sm="right"
          label-for="freqai-identifier"
        >
          <b-form-input
            id="freqai-identifier"
            v-model="btStore.freqAI.identifier"
            placeholder="Use config default"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          v-if="btStore.freqAI.enabled"
          label-cols-sm="5"
          label="FreqAI Model"
          label-align-sm="right"
          label-for="freqai-model"
        >
          <FreqaiModelSelect id="freqai-model" v-model="btStore.freqAI.model"></FreqaiModelSelect>
        </b-form-group>
      </template>

      <!-- <b-form-group label-cols-sm="5" label="Fee:" label-align-sm="right" label-for="fee">
              <b-form-input
                id="fee"
                type="number"
                placeholder="Use exchange default"
                step="0.01"
              ></b-form-input>
            </b-form-group> -->
      <hr />
      <TimeRangeSelect v-model="btStore.timerange" class="mt-2"></TimeRangeSelect>
    </b-form-group>
  </b-card>

  <h3 class="mt-3">Backtesting summary</h3>
  <div class="d-flex flex-wrap flex-md-nowrap justify-content-between justify-content-md-center">
    <b-button
      id="start-backtest"
      variant="primary"
      :disabled="botStore.activeBot.backtestRunning || !botStore.activeBot.canRunBacktest"
      class="mx-1"
      @click="clickBacktest"
    >
      Start backtest
    </b-button>
    <b-button
      variant="primary"
      :disabled="botStore.activeBot.backtestRunning || !botStore.activeBot.canRunBacktest"
      class="mx-1"
      @click="botStore.activeBot.pollBacktest"
    >
      Load backtest result
    </b-button>
    <b-button
      variant="primary"
      class="mx-1"
      :disabled="!botStore.activeBot.backtestRunning"
      @click="botStore.activeBot.stopBacktest"
      >Stop Backtest</b-button
    >
    <b-button
      variant="primary"
      class="mx-1"
      :disabled="botStore.activeBot.backtestRunning || !botStore.activeBot.canRunBacktest"
      @click="botStore.activeBot.removeBacktest"
      >Reset Backtest</b-button
    >
  </div>
</template>

<script setup lang="ts">
import TimeRangeSelect from '@/components/ftbot/TimeRangeSelect.vue';

import FreqaiModelSelect from '@/components/ftbot/FreqaiModelSelect.vue';
import StrategySelect from '@/components/ftbot/StrategySelect.vue';
import TimeframeSelect from '@/components/ftbot/TimeframeSelect.vue';

import InfoBox from '@/components/general/InfoBox.vue';

import { useBotStore } from '@/stores/ftbotwrapper';
import { BacktestPayload } from '@/types';

import { useBtStore } from '@/stores/btStore';
const botStore = useBotStore();
const btStore = useBtStore();

function clickBacktest() {
  const btPayload: BacktestPayload = {
    strategy: btStore.strategy,
    timerange: btStore.timerange,
    enable_protections: btStore.enableProtections,
  };
  const openTradesInt = parseInt(btStore.maxOpenTrades, 10);
  if (openTradesInt) {
    btPayload.max_open_trades = openTradesInt;
  }
  if (btStore.stakeAmountUnlimited) {
    btPayload.stake_amount = 'unlimited';
  } else {
    const stakeAmountLoc = Number(btStore.stakeAmount);
    if (stakeAmountLoc) {
      btPayload.stake_amount = stakeAmountLoc.toString();
    }
  }

  const startingCapitalLoc = Number(btStore.startingCapital);
  if (startingCapitalLoc) {
    btPayload.dry_run_wallet = startingCapitalLoc;
  }

  if (btStore.selectedTimeframe) {
    btPayload.timeframe = btStore.selectedTimeframe;
  }
  if (btStore.selectedDetailTimeframe) {
    btPayload.timeframe_detail = btStore.selectedDetailTimeframe;
  }
  if (!btStore.allowCache) {
    btPayload.backtest_cache = 'none';
  }
  if (btStore.freqAI.enabled) {
    btPayload.freqaimodel = btStore.freqAI.model;
    if (btStore.freqAI.identifier !== '') {
      btPayload.freqai = { identifier: btStore.freqAI.identifier };
    }
  }

  botStore.activeBot.startBacktest(btPayload);
}
</script>

<style scoped></style>
