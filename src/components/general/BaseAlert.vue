<script setup lang="ts">
const alertStore = useAlertsStore();
</script>
<template>
  <teleport to="body">
    <div class="toast-container position-fixed p-3 top-0 mt-5 end-0">
      <BToast
        v-for="(alert, idx) in alertStore.activeMessages"
        :key="idx"
        v-model="alert.timeout"
        :variant="alert.severity"
        :title="alert.title"
        @hide.prevent="alertStore.removeAlert(alert)"
      >
        {{ alert.message }}
      </BToast>
    </div>
  </teleport>
</template>

<style lang="scss" scoped></style>
