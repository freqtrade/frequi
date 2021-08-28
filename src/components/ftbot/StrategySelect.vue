<template>
  <div>
    <div class="w-100 d-flex">
      <b-form-select v-model="locStrategy" :options="strategyList" @change="strategyChanged">
      </b-form-select>
      <div class="ml-2">
        <b-button @click="getStrategyList">&#x21bb;</b-button>
      </div>
    </div>

    <textarea v-if="showDetails && strategy" v-model="strategyCode" class="w-100 h-100"></textarea>
  </div>
</template>

<script lang="ts">
import { BotStoreGetters } from '@/store/modules/ftbot';
import { StrategyResult } from '@/types';
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const ftbot = namespace('ftbot');

@Component({})
export default class StrategySelect extends Vue {
  @Prop() value!: string;

  @Prop({ default: false, required: false }) showDetails!: boolean;

  @ftbot.Action getStrategyList;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action getStrategy!: (strategy: string) => void;

  @ftbot.Getter [BotStoreGetters.strategyList]!: string[];

  @ftbot.Getter [BotStoreGetters.strategy]: StrategyResult;

  @Emit('input')
  emitStrategy(strategy: string) {
    this.getStrategy(strategy);
    return strategy;
  }

  get strategyCode(): string {
    return this.strategy?.code;
  }

  get locStrategy() {
    return this.value;
  }

  set locStrategy(val) {
    this.emitStrategy(val);
  }

  strategyChanged(newVal) {
    this.value = newVal;
  }

  mounted() {
    if (this.strategyList.length === 0) {
      this.getStrategyList();
    }
  }
}
</script>

<style></style>
