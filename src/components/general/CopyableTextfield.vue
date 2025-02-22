<script setup lang="ts">
import { useClipboard } from '@vueuse/core';

defineProps({
  content: { type: [String, Array<string>], required: true },
  isValid: { type: Boolean, default: true },
});

const { copy, isSupported } = useClipboard();
</script>

<template>
  <div class="relative group">
    <i-mdi-content-copy
      v-if="isSupported && isValid"
      class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity hover:cursor-pointer"
      @click="copy(typeof content === 'string' ? content : JSON.stringify(content))"
    />
    <pre
      class="text-start border rounded border-surface-500 p-2 m-0 bg-surface-50 dark:bg-surface-900 overflow-auto"
    ><code>{{ content }}</code></pre>
  </div>
</template>
