<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import type Popover from 'primevue/popover';

const newblacklistpair = ref('');
const blackListShow = ref(false);
const blacklistAddPopover = ref<InstanceType<typeof Popover>>();
const blacklistSelect = ref<number[]>([]);
const botStore = useBotStore();

const initBlacklist = () => {
  if (botStore.activeBot.whitelist.length === 0) {
    botStore.activeBot.getWhitelist();
  }
  if (botStore.activeBot.blacklist.length === 0) {
    botStore.activeBot.getBlacklist();
  }
};

const addBlacklistPair = () => {
  if (newblacklistpair.value) {
    blackListShow.value = false;
    blacklistAddPopover.value?.hide();

    botStore.activeBot.addBlacklist({ blacklist: [newblacklistpair.value] });
    newblacklistpair.value = '';
  }
};

function showPopover(event) {
  blacklistAddPopover.value?.show(event);
}

const blacklistSelectClick = (key) => {
  const index = blacklistSelect.value.indexOf(key);
  if (index > -1) {
    blacklistSelect.value.splice(index, 1);
  } else {
    blacklistSelect.value.push(key);
  }
};

const deletePairs = () => {
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
};
onMounted(() => {
  initBlacklist();
});
</script>

<template>
  <div>
    <div>
      <h3 class="text-3xl">Whitelist Methods</h3>

      <div v-if="botStore.activeBot.pairlistMethods.length" class="list wide">
        <div
          v-for="(method, key) in botStore.activeBot.pairlistMethods"
          :key="key"
          class="pair bg-white text-black align-middle border border-secondary"
        >
          {{ method }}
        </div>
      </div>
    </div>
    <!-- Show Whitelist -->
    <h3 class="text-3xl" :title="`${botStore.activeBot.whitelist.length} pairs`">Whitelist</h3>
    <div v-if="botStore.activeBot.whitelist.length" class="list">
      <div
        v-for="(pair, key) in botStore.activeBot.whitelist"
        :key="key"
        class="pair bg-white text-black align-middle border border-secondary"
      >
        {{ pair }}
      </div>
    </div>
    <p v-else>List Unavailable. Please Login and make sure server is running.</p>
    <Divider />

    <!-- Blacklsit -->
    <div>
      <div class="flex flex-row justify-center mb-1">
        <label
          class="text-3xl mb-2 w-full"
          title="Blacklist - Select (followed by a click on '-') to remove pairs"
        >
          Blacklist
        </label>
        <div class="flex flex-cols items-center gap-1 pe-1">
          <Button
            ref="blacklist-add-btn"
            severity="secondary"
            :class="botStore.activeBot.botApiVersion >= 1.12 ? 'col-6' : ''"
            size="small"
            @click="showPopover"
          >
            <template #icon>
              <i-mdi-plus-box-outline />
            </template>
          </Button>
          <Button
            v-if="botStore.activeBot.botApiVersion >= 1.12"
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
    <div v-if="botStore.activeBot.blacklist.length" class="list">
      <div
        v-for="(pair, key) in botStore.activeBot.blacklist"
        :key="key"
        class="pair bg-black text-white"
        :class="blacklistSelect.indexOf(key) > -1 ? 'active' : ''"
        @click="blacklistSelectClick(key)"
      >
        <span class="check"><i-mdi-check-circle /></span>{{ pair }}
      </div>
    </div>
    <p v-else>BlackList Unavailable. Please Login and make sure server is running.</p>
    <!-- Pagination -->
    <!-- TODO Add pagination support -->
  </div>
</template>

<style scoped lang="scss">
.check {
  // Hidden checkbox on blacklist selection
  // background: white;
  color: #41b883;
  opacity: 0;
  // border-radius: 50%;
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
