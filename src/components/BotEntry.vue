<template>
  <div v-if="bot" class="d-flex align-items-center justify-content-between w-100">
    <span class="me-2">{{ bot.botName || bot.botId }}</span>

    <div class="align-items-center d-flex">
      <span class="ms-2 me-1 align-middle">{{
        botStore.botStores[bot.botId].isBotOnline ? '&#128994;' : '&#128308;'
      }}</span>
      <b-form-checkbox
        v-model="autoRefreshLoc"
        class="ms-auto float-end me-2 my-auto"
        title="AutoRefresh"
        variant="secondary"
        @change="changeEvent"
      >
        R
      </b-form-checkbox>
      <div v-if="!noButtons" class="d-flex flex-align-cent">
        <b-button class="ms-1" size="sm" title="Delete bot" @click="$emit('edit')">
          <EditIcon :size="16" />
        </b-button>

        <b-button class="ms-1" size="sm" title="Delete bot" @click="botRemoveModalVisible = true">
          <DeleteIcon :size="16" title="Delete Bot" />
        </b-button>
      </div>
    </div>
    <b-modal
      v-if="!noButtons"
      id="removeBotModal"
      v-model="botRemoveModalVisible"
      title="Logout confirmation"
      @ok="confirmRemoveBot"
    >
      Really remove (logout) from {{ bot.botName }} ({{ bot.botId }})?
    </b-modal>
  </div>
</template>

<script lang="ts">
import EditIcon from 'vue-material-design-icons/Pencil.vue';
import DeleteIcon from 'vue-material-design-icons/Delete.vue';
import { BotDescriptor } from '@/types';
import { defineComponent, computed, ref } from 'vue';
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
  setup(props) {
    const botStore = useBotStore();

    const changeEvent = (v) => {
      botStore.botStores[props.bot.botId].setAutoRefresh(v);
    };
    const botRemoveModalVisible = ref(false);

    const confirmRemoveBot = () => {
      botRemoveModalVisible.value = false;
      botStore.removeBot(props.bot.botId);
      console.log('removing bot.');
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
      autoRefreshLoc,
      confirmRemoveBot,
      botRemoveModalVisible,
    };
  },
});
</script>
