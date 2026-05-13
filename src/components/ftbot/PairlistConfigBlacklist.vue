<script setup lang="ts">
const pairlistStore = usePairlistConfigStore();
const copyFromConfig = ref('');

const configNames = computed(() =>
  pairlistStore.savedConfigs.filter((c) => c.name !== pairlistStore.config.name).map((c) => c.name),
);
</script>
<template>
  <BaseCollapsible title="Blacklist">
    <div class="pb-1 p-2">
      <div class="flex mb-4 items-center gap-2">
        <span class="col-auto">Copy from:</span>
        <USelect v-model="copyFromConfig" size="sm" class="grow" :items="configNames" />
        <UButton
          title="Copy"
          size="sm"
          color="neutral"
          icon="mdi:content-copy"
          @click="pairlistStore.duplicateBlacklist(copyFromConfig)"
        />
      </div>
      <USeparator class="mb-2" />
      <div class="flex flex-col w-full items-center">
        <h3>Blacklisted Pairs</h3>
        <div
          v-for="(item, i) in pairlistStore.config.blacklist"
          :key="i"
          class="mb-2 flex flex-row max-w-md gap-2 my-auto items-center"
        >
          <UInput v-model="pairlistStore.config.blacklist[i]" class="w-full" />
          <span>
            <UButton
              size="sm"
              color="neutral"
              icon="mdi:close"
              @click="pairlistStore.removeFromBlacklist(i)"
            />
          </span>
        </div>
      </div>
      <UButton
        icon="mdi:plus"
        variant="solid"
        label="Add"
        @click="pairlistStore.addToBlacklist()"
      />
    </div>
  </BaseCollapsible>
</template>
