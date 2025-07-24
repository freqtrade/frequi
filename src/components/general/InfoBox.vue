<script setup lang="ts">
defineProps<{ hint: string }>();
</script>

<template>
  <div :title="hint">
    <i-mdi-information-outline />
  </div>
</template>
