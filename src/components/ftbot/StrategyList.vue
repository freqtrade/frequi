<template>
  <b-form-group label="Strategy" label-for="strategyName" invalid-feedback="Strategy is required">
    <b-form-select v-model="strategy" :options="strategyList" @change="strategyChanged">
    </b-form-select>
  </b-form-group>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const ftbot = namespace('ftbot');

@Component({})
export default class StrategyList extends Vue {
  @Prop() value!: string;

  @ftbot.Action getStrategyList;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action getStrategy!: (strategy: string) => void;

  @ftbot.State strategyList;

  @Emit('input')
  emitStrategy(strategy: string) {
    this.getStrategy(strategy);
    return strategy;
  }

  get strategy() {
    return this.value;
  }

  set strategy(val) {
    this.emitStrategy(val);
  }

  strategyChanged(newVal) {
    this.value = newVal;
  }

  mounted() {
    this.getStrategyList();
  }
}
</script>

<style></style>
