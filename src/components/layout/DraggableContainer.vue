<template>
  <div class="card h-100 w-100">
    <div class="drag-header card-header">
      <slot name="header">
        {{ header }}
      </slot>
    </div>
    <div class="card-body h-100 w-100 overflow-auto">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  header: { required: false, type: String, default: '' },
});
</script>

<style scoped>
.card-header {
  padding: 0.25rem 0.5rem;
}
.card-body {
  /* Padding should be controled by the contained element */
  padding: 0;
}
</style>
