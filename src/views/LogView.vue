<template>
  <div class="p-4 h-100">
    <LogViewer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import LogViewer from '@/components/ftbot/LogViewer.vue';

export default defineComponent({
  name: 'LogView',
  components: { LogViewer },
});
</script>

<style scoped></style>
