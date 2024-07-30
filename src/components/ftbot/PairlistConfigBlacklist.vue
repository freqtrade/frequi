<script setup lang="ts">
import { usePairlistConfigStore } from '@/stores/pairlistConfig';
const pairlistStore = usePairlistConfigStore();
const copyFromConfig = ref('');
const visible = ref(false);

const configNames = computed(() =>
  pairlistStore.savedConfigs.filter((c) => c.name !== pairlistStore.config.name).map((c) => c.name),
);
</script>
<template>
  <BCard no-body class="mb-2">
    <template #header>
      <div
        class="d-flex flex-row align-items-center justify-content-between"
        role="button"
        @click="visible = !visible"
      >
        <span class="fw-bold fd-italic">Blacklist</span>
        <i-mdi-chevron-down
          v-if="!visible"
          :class="!visible ? 'visible' : 'invisible'"
          role="button"
          class="fs-4"
        />
        <i-mdi-chevron-up
          v-if="visible"
          :class="visible ? 'visible' : 'invisible'"
          role="button"
          class="fs-4"
        />
      </div>
    </template>
    <BCollapse v-model="visible">
      <BCardBody>
        <div class="d-flex mb-4 align-items-center gap-2">
          <span class="col-auto">Copy from:</span
          ><BFormSelect v-model="copyFromConfig" size="sm" :options="configNames" />
          <BButton title="Copy" size="sm" @click="pairlistStore.duplicateBlacklist(copyFromConfig)"
            ><i-mdi-content-copy
          /></BButton>
        </div>
        <BInputGroup
          v-for="(item, i) in pairlistStore.config.blacklist"
          :key="i"
          class="mb-2"
          size="sm"
        >
          <BFormInput v-model="pairlistStore.config.blacklist[i]" />
          <template #append>
            <BButton size="sm" @click="pairlistStore.removeFromBlacklist(i)"
              ><i-mdi-close
            /></BButton>
          </template>
        </BInputGroup>
        <BButton size="sm" @click="pairlistStore.addToBlacklist()">Add</BButton>
      </BCardBody>
    </BCollapse>
  </BCard>
</template>
<style lang="scss" scoped></style>
