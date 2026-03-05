<script setup lang="ts">
const newblacklistpair = ref('');
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
    botStore.activeBot.addBlacklist({ blacklist: [newblacklistpair.value] });
    newblacklistpair.value = '';
  }
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
    <USeparator />

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
          <UPopover>
            <UButton color="neutral" icon="mdi:plus-box-outline" size="md" />
            <template #content>
              <form ref="form" @submit.prevent="addBlacklistPair" class="py-2 px-3">
                <div class="space-y-1">
                  <h4 class="font-bold mb-2">Add Pair to Blacklist</h4>
                  <UFormField label="Pair" class="space-x-2" required>
                    <UInput v-model="newblacklistpair" required autofocus></UInput>
                  </UFormField>
                  <UButton id="blacklist-submit" class="ms-auto mb-2" type="submit"> Add </UButton>
                </div>
              </form>
            </template>
          </UPopover>
          <UButton
            v-if="botStore.activeBot.botFeatures.botBlacklistModify"
            color="neutral"
            title="Select pairs to delete pairs from your blacklist."
            :disabled="blacklistSelect.length === 0"
            icon="mdi:delete"
            @click="deletePairs"
          />
        </div>
      </div>
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
  @apply p-2 border rounded cursor-pointer relative border-neutral-500;
}
</style>
