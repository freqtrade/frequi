<template>
  <div :title="hint">
    <InfoIcon :size="18" />
  </div>
</template>

<script setup>
import InfoIcon from 'vue-material-design-icons/InformationOutline.vue';
defineProps({
  hint: { type: String, required: true },
});
</script>

<style lang="scss" scoped></style>
