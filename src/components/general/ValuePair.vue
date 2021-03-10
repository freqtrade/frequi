<template>
  <div class="row">
    <label :class="classLabel">{{ description }}</label>
    <div :class="classValue">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ValuePair',
  props: {
    description: {
      type: String,
      required: true,
    },
    classLabel: {
      type: String,
      default: 'col-4 font-weight-bold',
    },
    classValue: {
      type: String,
      default: 'col-8',
    },
  },
});
</script>

<style scoped></style>
