<script setup lang="ts">
import { renderMarkdown, toggleTask } from '@/widgets/markdown';

const props = defineProps<{ text: string }>();
const emit = defineEmits<{ update: [text: string] }>();

// renderMarkdown escapes all input and only emits a fixed set of safe tags.
const html = computed(() => renderMarkdown(props.text));

function onClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target instanceof HTMLInputElement && target.type === 'checkbox' && target.dataset.line) {
    emit('update', toggleTask(props.text, Number(target.dataset.line)));
  }
}
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-if="text.trim()" class="ft-note p-3 text-sm" @click="onClick" v-html="html" />
  <div v-else class="flex h-full items-center justify-center p-4 text-center text-sm text-muted">
    Empty note. Open the widget settings to write markdown: headings, lists, checklists and links.
  </div>
</template>

<style scoped>
.ft-note :deep(h2) {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0.4rem 0;
}
.ft-note :deep(h3) {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0.4rem 0;
}
.ft-note :deep(h4) {
  font-weight: 600;
  margin: 0.3rem 0;
}
.ft-note :deep(p) {
  margin: 0.3rem 0;
}
.ft-note :deep(ul) {
  list-style: disc;
  padding-inline-start: 1.25rem;
}
.ft-note :deep(ol) {
  list-style: decimal;
  padding-inline-start: 1.25rem;
}
.ft-note :deep(ul.md-tasks) {
  list-style: none;
  padding-inline-start: 0;
}
.ft-note :deep(.md-done) {
  text-decoration: line-through;
  opacity: 0.6;
}
.ft-note :deep(input[type='checkbox']) {
  accent-color: var(--color-brand-500);
  cursor: pointer;
}
.ft-note :deep(a) {
  color: var(--color-brand-400);
  text-decoration: underline;
}
.ft-note :deep(code) {
  font-family: var(--font-mono);
  background: rgb(127 127 127 / 0.15);
  padding: 0 0.25rem;
  border-radius: 0.25rem;
}
.ft-note :deep(blockquote) {
  border-inline-start: 3px solid var(--ft-glass-border);
  padding-inline-start: 0.6rem;
  opacity: 0.85;
}
.ft-note :deep(hr) {
  border-color: var(--ft-glass-border);
  margin: 0.6rem 0;
}
</style>
