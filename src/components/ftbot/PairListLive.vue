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
          class="pair bg-white text-black align-middle border border-secondary"
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
        class="pair bg-white text-black align-middle border border-secondary"
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
            :class="botStore.activeBot.botFeatures.botBlacklistModify ? 'col-6' : ''"
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
        class="pair bg-black text-white text-ellipsis overflow-hidden"
        :title="pair"
        :class="blacklistSelect.indexOf(key) > -1 ? 'active' : ''"
        @click="blacklistSelectClick(key)"
      >
        <span class="check"><i-mdi-check-circle /></span>{{ pair }}
      </li>
    </ul>
    <p v-else>BlackList Unavailable. Please Login and make sure server is running.</p>
  </div>
</template>

<style scoped>
@reference '../../styles/tailwind.css';

.check {
  /* Hidden checkbox on blacklist selection */
  color: #41b883;
  opacity: 0;
  /* border-radius: 50%; */
  z-index: 5;
  width: 1.3em;
  height: 1.3em;
  top: -0.3em;
  left: -0.3em;
  position: absolute;
  transition: opacity 0.2s;
}

.pair.active .check {
  opacity: 1;
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  grid-gap: 0.5rem;
  padding-bottom: 1rem;
}
.wide {
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}

.pair {
  @apply p-2 border rounded cursor-pointer relative border-surface-500;
}
</style>
