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
      class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity hover:cursor-pointer flex dark:bg-neutral-700 bg-neutral-200 p-1 rounded-sm items-center justify-center flex-row gap-1"
      @click="copy(typeof content === 'string' ? content : JSON.stringify(content))"
    >
      <span v-if="copied" class="text-sm">Copied!</span>
      <UIcon
        :name="isSupported && copied ? 'mdi-check-circle' : 'mdi-content-copy'"
        v-if="isSupported && isValid"
      />
    </div>
    <pre
      class="text-start glass rounded-xl p-2 m-0 overflow-auto"
    ><code>{{ content }}</code></pre>
  </div>
</template>
