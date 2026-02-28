<script setup lang="ts">
import type Popover from 'primevue/popover';

const newblacklistpair = ref('');
const blackListShow = ref(false);
const blacklistAddPopover = ref<InstanceType<typeof Popover>>();
const blacklistSelect = ref<number[]>([]);
const botStore = useBotStore();

function initBlacklist() {
  if (botStore.activeBot.whitelist.length === 0) {
    botStore.activeBot.getWhitelist();
  }
  if (botStore.activeBot.blacklist.length === 0) {
    botStore.activeBot.getBlacklist();
  }
}

function addBlacklistPair() {
  if (newblacklistpair.value) {
    blackListShow.value = false;
    blacklistAddPopover.value?.hide();

    botStore.activeBot.addBlacklist({ blacklist: [newblacklistpair.value] });
    newblacklistpair.value = '';
  }
}

function showPopover(event: MouseEvent) {
  blacklistAddPopover.value?.show(event);
}

function blacklistSelectClick(key: number) {
  const index = blacklistSelect.value.indexOf(key);
  if (index > -1) {
    blacklistSelect.value.splice(index, 1);
  } else {
    blacklistSelect.value.push(key);
  }
}

function deletePairs() {
  if (blacklistSelect.value.length === 0) {
    console.log('nothing to delete');
    return;
  }
  // const pairlist = blacklistSelect.value;
  const pairlist = botStore.activeBot.blacklist.filter(
    (value, index) => blacklistSelect.value.indexOf(index) > -1,
  );
  console.log('Deleting pairs: ', pairlist);
  botStore.activeBot.deleteBlacklist(pairlist);
  blacklistSelect.value = [];
}
onMounted(() => {
  initBlacklist();
});
</script>

<template>
  <div>
    <div>
      <h3 class="text-xl">Whitelist Methods</h3>

      <ul v-if="botStore.activeBot.pairlistMethods.length" class="list wide">
        <li
          v-for="(method, key) in botStore.activeBot.pairlistMethods"
          :key="key"
          class="pair bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white align-middle border border-surface-300 dark:border-surface-700 shadow-sm"
        >
          {{ method }}
        </li>
      </ul>
    </div>
    <!-- Show Whitelist -->
    <h3 class="text-lg font-bold" :title="`${botStore.activeBot.whitelist.length} pairs`">
      Whitelist
    </h3>
    <ul v-if="botStore.activeBot.whitelist.length" class="list">
      <li
        v-for="(pair, key) in botStore.activeBot.whitelist"
        :key="key"
        class="pair bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white align-middle border border-surface-300 dark:border-surface-700 shadow-sm"
      >
        {{ pair }}
      </li>
    </ul>
    <p v-else>List Unavailable. Please Login and make sure server is running.</p>
    <Divider />

    <!-- Blacklsit -->
    <div>
      <div class="flex flex-row justify-center mb-1">
        <label
          class="text-lg font-bold mb-2 w-full"
          title="Blacklist - Select (followed by a click on '-') to remove pairs"
        >
          Blacklist
        </label>
        <div class="flex flex-cols items-center gap-1 pe-1">
          <Button
            ref="blacklist-add-btn"
            severity="secondary"
            :class="[
              botStore.activeBot.botFeatures.botBlacklistModify ? 'col-6' : '',
              '!text-surface-800 dark:!text-surface-200',
            ]"
            size="small"
            @click="showPopover"
          >
            <template #icon>
              <i-mdi-plus-box-outline />
            </template>
          </Button>
          <Button
            v-if="botStore.activeBot.botFeatures.botBlacklistModify"
            size="small"
            severity="secondary"
            class="!text-surface-800 dark:!text-surface-200"
            title="Select pairs to delete pairs from your blacklist."
            :disabled="blacklistSelect.length === 0"
            @click="deletePairs"
          >
            <template #icon>
              <i-mdi-delete />
            </template>
          </Button>
        </div>
      </div>
      <Popover ref="blacklistAddPopover" class="p-1">
        <form ref="form" @submit.prevent="addBlacklistPair">
          <div class="space-y-1">
            <h4 class="font-bold mb-2">Add Pair to Blacklist</h4>
            <div class="space-x-2">
              <label for="pair-input">Pair</label>
              <InputText id="pair-input" v-model="newblacklistpair" required autofocus></InputText>
            </div>
            <Button
              id="blacklist-submit"
              class="float-end mb-2"
              size="small"
              severity="primary"
              type="submit"
            >
              Add
            </Button>
          </div>
        </form>
      </Popover>
    </div>
    <ul v-if="botStore.activeBot.blacklist.length" class="list">
      <li
        v-for="(pair, key) in botStore.activeBot.blacklist"
        :key="key"
        class="pair flex items-center justify-between gap-2 bg-surface-800 dark:bg-black text-white hover:bg-surface-200 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white transition-all duration-200 max-w-full"
        :title="pair"
        :class="
          blacklistSelect.indexOf(key) > -1
            ? 'active !border-primary-500 shadow-sm shadow-primary-500/20 px-4 scale-[1.02]'
            : ''
        "
        @click="blacklistSelectClick(key)"
      >
        <span class="truncate font-medium">{{ pair }}</span>
        <i-mdi-check-circle
          v-if="blacklistSelect.indexOf(key) > -1"
          class="text-primary-700 dark:text-primary-400 text-lg flex-shrink-0"
        />
      </li>
    </ul>
    <p v-else>BlackList Unavailable. Please Login and make sure server is running.</p>
  </div>
</template>

<style scoped>
@reference '../../styles/tailwind.css';

.list {
  @apply flex flex-wrap gap-2 pb-4;
}

.pair {
  @apply px-3 py-1.5 border rounded-lg cursor-pointer relative border-surface-500 text-sm transition-colors;
  max-width: 100%;
}
.pair.active {
  @apply border-primary-500 bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100;
  border-width: 2px !important;
  background-color: var(--p-primary-100) !important;
  color: var(--p-primary-900) !important;
}

@media (prefers-color-scheme: dark) {
  .pair.active {
    background-color: rgb(from var(--p-primary-900) r g b / 0.3) !important;
    color: var(--p-primary-100) !important;
  }
}
</style>
