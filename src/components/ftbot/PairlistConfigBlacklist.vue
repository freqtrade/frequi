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
        class="flex flex-row align-items-center justify-content-between"
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
        <div class="flex mb-4 items-center gap-2">
          <span class="col-auto">Copy from:</span>
          <Select v-model="copyFromConfig" size="small" class="flex-grow" :options="configNames" />
          <Button
            title="Copy"
            size="small"
            severity="secondary"
            @click="pairlistStore.duplicateBlacklist(copyFromConfig)"
          >
            <template #icon>
              <i-mdi-content-copy />
            </template>
          </Button>
        </div>
        <InputGroup
          v-for="(item, i) in pairlistStore.config.blacklist"
          :key="i"
          class="mb-2"
          size="sm"
        >
          <InputText v-model="pairlistStore.config.blacklist[i]" size="small" />
          <InputGroupAddon>
            <Button size="small" severity="secondary" @click="pairlistStore.removeFromBlacklist(i)">
              <template #icon>
                <i-mdi-close />
              </template>
            </Button>
          </InputGroupAddon>
        </InputGroup>
        <Button size="small" @click="pairlistStore.addToBlacklist()">Add</Button>
      </BCardBody>
    </BCollapse>
  </BCard>
</template>
<style lang="scss" scoped></style>
