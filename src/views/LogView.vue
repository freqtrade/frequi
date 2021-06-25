<template>
  <div class="p-4 h-100">
    <LogViewer />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LogViewer from '@/components/ftbot/LogViewer.vue';

@Component({
  components: { LogViewer },
})
export default class LogView extends Vue {}
</script>

<style scoped></style>
