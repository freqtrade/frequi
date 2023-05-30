<template>
  <b-card no-body class="mb-2">
    <template #header>
      <div
        class="d-flex flex-column align-items-center fw-bold fd-italic"
        role="button"
        @click="visible = !visible"
      >
        Blacklist
      </div>
    </template>
    <b-card-body :class="{ hidden: !visible }">
      <b-collapse v-model="visible">
        <b-input-group v-for="(item, i) in pairlistStore.blacklist" :key="i" class="mb-2">
          <b-form-input v-model="pairlistStore.blacklist[i]" />
          <b-input-group-append>
            <b-button size="sm" @click="pairlistStore.removeFromBlacklist(i)"
              ><i-mdi-close
            /></b-button>
          </b-input-group-append>
        </b-input-group>
        <b-button @click="pairlistStore.addToBlacklist()">Add</b-button>
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
<style lang="scss" scoped>
.hidden {
  padding: 0;
}

:deep(.collapsing) {
  -webkit-transition: none;
  transition: none;
  display: none;
}
</style>
