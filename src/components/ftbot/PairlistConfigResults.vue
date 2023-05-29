<template>
  <b-container fluid>
    <b-row v-if="whitelist.length > 0">
      <b-col cols="12" md="2">
        <b-list-group>
          <b-list-group-item
            v-for="(pair, i) in whitelist"
            :key="pair.pair"
            button
            class="d-flex justify-content-between align-items-center py-1"
            :active="pair.pair === botStore.activeBot.selectedPair"
            :title="pair.pair"
            @click="botStore.activeBot.selectedPair = pair.pair"
          >
            <b-form-checkbox v-model="whitelist[i].enabled"></b-form-checkbox>
            {{ pair.pair }}
          </b-list-group-item>
        </b-list-group>
      </b-col>
      <b-col>
        <!-- TODO: fix layout issues -->
        <ChartView />
      </b-col>
      <b-col cols="12" md="2">
        <CopyableTextfield
          :content="
            JSON.stringify(
              whitelist.filter((p) => p.enabled === true).map((p) => p.pair),
              null,
              2,
            )
          "
        />
      </b-col>
    </b-row>
    <b-row v-else>
      <b-col>
        <p>Evaluation returned 0 pairs</p>
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import { usePairlistConfigStore } from '@/stores/pairlistConfig';
import ChartView from '@/views/ChartsView.vue';
import CopyableTextfield from '@/components/general/CopyableTextfield.vue';

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
