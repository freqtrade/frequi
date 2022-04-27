<template>
  <div class="d-flex align-items-center justify-content-between w-100">
    <span class="mr-2">{{ bot.botName || bot.botId }}</span>

    <div class="align-items-center d-flex">
      <span class="ml-2 mr-1 align-middle">{{
        botStore.botStores[bot.botId].isBotOnline ? '&#128994;' : '&#128308;'
      }}</span>
      <b-form-checkbox
        v-model="autoRefreshLoc"
        class="ml-auto float-right mr-2 my-auto"
        title="AutoRefresh"
        variant="secondary"
        @change="changeEvent"
      >
        R
      </b-form-checkbox>
      <div v-if="!noButtons" class="d-flex flex-align-cent">
        <b-button class="ml-1" size="sm" title="Delete bot" @click="$emit('edit')">
          <EditIcon :size="16" />
        </b-button>

        <b-button class="ml-1" size="sm" title="Delete bot" @click.prevent="clickRemoveBot(bot)">
          <DeleteIcon :size="16" title="Delete Bot" />
        </b-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import EditIcon from 'vue-material-design-icons/Pencil.vue';
import DeleteIcon from 'vue-material-design-icons/Delete.vue';
import { BotDescriptor } from '@/types';
import { defineComponent, computed } from '@vue/composition-api';
import { useBotStore } from '@/stores/ftbotwrapper';

export default defineComponent({
  name: 'BotEntry',
  components: {
    DeleteIcon,
    EditIcon,
  },
  props: {
    bot: { required: true, type: Object as () => BotDescriptor },
    noButtons: { default: false, type: Boolean },
  },
  emits: ['edit'],
  setup(props, { root }) {
    const botStore = useBotStore();

    const changeEvent = (v) => {
      botStore.botStores[props.bot.botId].setAutoRefresh(v);
    };

    const clickRemoveBot = (bot: BotDescriptor) => {
      //
      root.$bvModal
        .msgBoxConfirm(`Really remove (logout) from '${bot.botName}' (${bot.botId})?`)
        .then((value: boolean) => {
          if (value) {
            botStore.removeBot(bot.botId);
          }
        });
    };
    const autoRefreshLoc = computed({
      get() {
        return botStore.botStores[props.bot.botId].autoRefresh;
      },
      set() {
        // pass
      },
    });

    return {
      botStore,
      changeEvent,
      clickRemoveBot,
      autoRefreshLoc,
    };
  },
});
</script>
