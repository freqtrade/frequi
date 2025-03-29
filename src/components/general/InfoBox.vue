<script setup lang="ts">
defineProps({
  hint: { type: String, required: true },
});
</script>

<template>
  <div :title="hint">
    <i-mdi-information-outline />
  </div>
</template>
