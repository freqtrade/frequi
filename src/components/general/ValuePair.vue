<template>
  <div class="row">
    <label :class="classLabel">{{ description }}</label>
    <div :class="classValue">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ValuePair',
  props: {
    description: {
      type: String,
      required: true,
    },
    classLabel: {
      type: String,
      default: 'col-4 fw-bold mb-0',
    },
    classValue: {
      type: String,
      default: 'col-8',
    },
  },
});
</script>

<style scoped></style>
