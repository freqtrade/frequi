<template>
  <b-card no-body class="mb-2">
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
          @click="visible = !visible"
        />
        <i-mdi-chevron-up
          v-if="visible"
          :class="visible ? 'visible' : 'invisible'"
          role="button"
          class="fs-4"
          @click="visible = !visible"
        />
      </div>
    </template>
    <b-card-body class="p-0">
      <b-collapse v-model="visible">
        <div class="p-3">
          <b-input-group v-for="(item, i) in pairlistStore.blacklist" :key="i" class="mb-2">
            <b-form-input v-model="pairlistStore.blacklist[i]" />
            <b-input-group-append>
              <b-button size="sm" @click="pairlistStore.removeFromBlacklist(i)"
                ><i-mdi-close
              /></b-button>
            </b-input-group-append>
          </b-input-group>
          <b-button @click="pairlistStore.addToBlacklist()">Add</b-button>
        </div>
      </b-collapse>
    </b-card-body>
  </b-card>
</template>
<script setup>
import { ref } from 'vue';
import { usePairlistConfigStore } from '@/stores/pairlistConfig';
const pairlistStore = usePairlistConfigStore();

const visible = ref(false);
</script>
<style lang="scss" scoped></style>
