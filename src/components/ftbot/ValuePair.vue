<template>
  <div class="row">
    <label class="col-4">{{ description }}</label>
    <div class="col-8">
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
  },
});
</script>

<style scoped>
label {
  font-weight: bold;
}
.row {
  max-width: 50em;
}
</style>
