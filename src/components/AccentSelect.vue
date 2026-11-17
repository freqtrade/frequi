<script setup lang="ts">
withDefaults(defineProps<{ showText?: boolean }>(), { showText: false });

const settingsStore = useSettingsStore();
</script>

<template>
  <div class="flex items-center gap-1.5" role="radiogroup" aria-label="Accent colour">
    <span v-if="showText" class="text-sm me-1">Accent</span>
    <button
      v-for="preset in ACCENT_PRESETS"
      :key="preset.name"
      type="button"
      role="radio"
      :aria-checked="settingsStore.accent === preset.name"
      :aria-label="`${preset.label} accent`"
      :title="preset.label"
      class="size-5 rounded-full border border-white/30 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2"
      :class="
        settingsStore.accent === preset.name ? 'ring-2 ring-offset-2 ring-offset-transparent' : ''
      "
      :style="{
        backgroundColor: preset.swatch,
        '--tw-ring-color': preset.swatch,
        outlineColor: preset.swatch,
      }"
      @click="settingsStore.accent = preset.name"
    />
  </div>
</template>
