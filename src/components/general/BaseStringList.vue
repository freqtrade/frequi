<script setup lang="ts">
const values = defineModel<string[]>({ required: true });
</script>

<template>
  <div class="d-flex flex-row gap-2">
    <div class="d-flex gap-1 flex-column w-100">
      <div v-for="(val, idx) in values" :key="idx" class="d-flex flex-row gap-1">
        <BFormInput v-model="values[idx]" size="sm"></BFormInput>
        <BButton
          size="sm"
          variant="outline-secondary"
          title="Delete this value."
          @click="values.splice(idx, 1)"
        >
          <i-mdi-delete />
        </BButton>
      </div>
    </div>
    <BButton
      size="sm"
      :title="`Add new value`"
      variant="secondary"
      class="ms-auto mt-auto"
      @click="values.push('')"
      ><i-mdi-plus-box-outline />
    </BButton>
  </div>
</template>
