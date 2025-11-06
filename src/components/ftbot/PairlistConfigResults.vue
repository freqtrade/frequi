<script setup lang="ts">
import ChartView from '@/views/ChartsView.vue';

const botStore = useBotStore();
const pairlistStore = usePairlistConfigStore();

const whitelist = ref<{ enabled: boolean; pair: string }[]>([]);

watch(
  () => pairlistStore.whitelist,
  () => {
    whitelist.value = pairlistStore.whitelist.map((p) => {
      return {
        enabled: true,
        pair: p,
      };
    });
  },
);
</script>

<template>
  <div>
    <div v-if="whitelist.length > 0" class="flex flex-col flex-lg-row px-2">
      <!-- TODO: look into flexbox solution to have overflow scroll? -->
      <BListGroup class="overflow-auto" style="height: calc(100vh - 135px)">
        <BListGroupItem
          v-for="pair in whitelist"
          :key="pair.pair"
          button
          class="flex py-2"
          :active="pair.pair === botStore.activeBot.selectedPair"
          :title="pair.pair"
          @click="botStore.activeBot.selectedPair = pair.pair"
        >
          <BaseCheckbox v-model="pair.enabled">{{ pair.pair }}</BaseCheckbox>
        </BListGroupItem>
      </BListGroup>
      <div class="flex-fill">
        <ChartView />
      </div>
      <div>
        <CopyableTextfield
          style="height: calc(100vh - 135px)"
          class="overflow-auto"
          :content="
            JSON.stringify(
              whitelist.filter((p) => p.enabled === true).map((p) => p.pair),
              null,
              2,
            )
          "
        />
      </div>
    </div>
    <div v-else>
      <p>Evaluation returned 0 pairs</p>
    </div>
  </div>
</template>
