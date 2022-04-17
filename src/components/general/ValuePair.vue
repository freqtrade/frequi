<template>
  <div class="row">
    <label :class="classLabel">{{ description }}</label>
    <div :class="classValue">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'ValuePair',
  props: {
    description: {
      type: String,
      required: true,
    },
    classLabel: {
      type: String,
      default: 'col-4 font-weight-bold mb-0',
    },
    classValue: {
      type: String,
      default: 'col-8',
    },
  },
});
</script>

<style scoped></style>
