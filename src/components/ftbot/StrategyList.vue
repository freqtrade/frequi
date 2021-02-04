<template>
  <div>
    <div class="w-100 d-flex">
      <b-form-group
        label="Strategy"
        label-for="strategyName"
        invalid-feedback="Strategy is required"
        class="flex-grow-1"
      >
        <b-form-select v-model="locStrategy" :options="strategyList" @change="strategyChanged">
        </b-form-select>
      </b-form-group>
      <div class="ml-2 d-flex align-items-center">
        <b-button class="mt-2" @click="getStrategyList">&#x21bb;</b-button>
      </div>
    </div>

    <textarea v-if="showDetails && strategy" v-model="strategyCode" class="w-100 h-100"></textarea>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const ftbot = namespace('ftbot');

@Component({})
export default class StrategyList extends Vue {
  @Prop() value!: string;

  @Prop({ default: false, required: false }) showDetails!: boolean;

  @ftbot.Action getStrategyList;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action getStrategy!: (strategy: string) => void;

  @ftbot.State strategyList!: string[];

  @ftbot.State strategy;

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
