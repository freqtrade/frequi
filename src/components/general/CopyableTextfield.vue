<script setup lang="ts">
import { useClipboard } from '@vueuse/core';

withDefaults(
  defineProps<{
    content: string | string[];
    isValid?: boolean;
  }>(),
  {
    isValid: true,
  },
);

const { copy, isSupported, copied } = useClipboard();
</script>

<template>
  <div class="relative group copy-container">
    <div
      class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity hover:cursor-pointer flex dark:bg-surface-700 bg-surface-200 p-1 rounded-sm items-center justify-center flex-row"
      @click="copy(typeof content === 'string' ? content : JSON.stringify(content))"
    >
      <span v-if="copied" class="text-sm">Copied!</span>
      <i-mdi-check-circle v-if="isSupported && copied" />
      <i-mdi-content-copy v-if="!copied && isSupported && isValid" />
    </div>
    <pre
      class="text-start border rounded-sm border-surface-500 p-2 m-0 bg-surface-50 dark:bg-surface-900 overflow-auto"
    ><code>{{ content }}</code></pre>
  </div>
</template>
