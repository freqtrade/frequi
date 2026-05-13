<script setup lang="ts">
const locFreqaiModel = defineModel<string>();
const botStore = useBotStore();

onMounted(() => {
  if (botStore.activeBot.freqaiModelList.length === 0) {
    botStore.activeBot.getFreqAIModelList();
  }
});
</script>

<template>
  <div>
    <div class="w-full flex">
      <USelectMenu
        v-model="locFreqaiModel"
        :items="botStore.activeBot.freqaiModelList"
        class="w-full"
      >
      </USelectMenu>
      <div class="ms-2">
        <UButton
          color="neutral"
          variant="outline"
          icon="mdi:refresh"
          @click="botStore.activeBot.getFreqAIModelList()"
        />
      </div>
    </div>
  </div>
</template>
