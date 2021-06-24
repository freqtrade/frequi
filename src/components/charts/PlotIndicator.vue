<template>
  <div>
    <div v-if="addNew">
      <b-form-group label="Add indicator" label-for="indicatorSelector">
        <b-form-select
          id="indicatorSelector"
          v-model="selAvailableIndicator"
          :options="columns"
          :select-size="4"
        >
        </b-form-select>
      </b-form-group>
    </div>

    <b-form-group label="Type" label-for="plotTypeSelector">
      <b-form-select
        id="plotTypeSelector"
        v-model="graphType"
        size="sm"
        :options="availableGraphTypes"
        @change="emitIndicator()"
      >
      </b-form-select>
    </b-form-group>
    <hr />
    <b-form-group label="Color" label-for="colsel" size="sm">
      <b-input-group>
        <b-input-group-prepend>
          <div :style="{ 'background-color': selColor }" class="colorbox mr-2"></div>
          <!-- <b-form-input
            id="colsel"
            v-model="selColor"
            size="sm"
            class="colorbox"
            type="color"
            :style="{ 'background-color': selColor }"
          >
          </b-form-input> -->
        </b-input-group-prepend>

        <b-form-input id="colsel" v-model="selColor" size="sm"> </b-form-input>
        <b-input-group-append>
          <b-button variant="primary" size="sm" @click="newColor">&#x21bb;</b-button>
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
    <div class="d-flex d-flex-columns d-flex">
      <b-button v-if="addNew" variant="primary" title="Add " size="sm" @click="emitIndicator">
        Add new indicator
      </b-button>
      <b-button
        v-if="addNew"
        class="ml-1"
        variant="primary"
        title="Add "
        size="sm"
        @click="clickCancel"
      >
        Cancel
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import { ChartType, IndicatorConfig } from '@/types';
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import randomColor from '@/shared/randomColor';

@Component({})
export default class PlotIndicator extends Vue {
  @Prop({ required: true }) value!: Record<string, IndicatorConfig>;

  @Prop({ required: true }) columns!: string[];

  @Prop({ required: true }) addNew!: boolean;

  @Emit('input')
  emitIndicator() {
    return this.combinedIndicator;
  }

  selColor = randomColor();

  graphType: ChartType = ChartType.line;

  availableGraphTypes = Object.keys(ChartType);

  selAvailableIndicator = '';

  cancelled = false;

  @Watch('value')
  watchValue() {
    [this.selAvailableIndicator] = Object.keys(this.value);
    this.cancelled = false;
    if (this.selAvailableIndicator && this.value) {
      this.selColor = this.value[this.selAvailableIndicator].color || randomColor();
      this.graphType = this.value[this.selAvailableIndicator].type || ChartType.line;
    }
  }

  @Watch('selColor')
  watchColor() {
    this.emitIndicator();
  }

  clickCancel() {
    this.cancelled = true;
    this.emitIndicator();
  }

  get combinedIndicator() {
    if (this.cancelled || !this.selAvailableIndicator) {
      return {};
    }
    return {
      [this.selAvailableIndicator]: {
        color: this.selColor,
        type: this.graphType,
      },
    };
  }

  newColor() {
    this.selColor = randomColor();
  }
}
</script>

<style scoped>
.colorbox {
  border-radius: 50%;
  margin-top: auto;
  margin-bottom: auto;
  height: 25px;
  width: 25px;
  vertical-align: center;
}
</style>
