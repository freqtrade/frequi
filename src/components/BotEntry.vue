<template>
  <div v-if="bot" class="d-flex align-items-center justify-content-between w-100">
    <span class="me-2">{{ bot.botName || bot.botId }}</span>

    <div class="align-items-center d-flex">
      <b-form-checkbox
        v-model="autoRefreshLoc"
        class="ms-auto float-end me-2 my-auto mt-1"
        title="AutoRefresh"
        variant="secondary"
        switch
        @change="changeEvent"
      >
        <OnlineIcon
          :size="18"
          class="ms-2 me-1 align-middle"
          :class="botStore.botStores[bot.botId].isBotOnline ? 'online' : 'offline'"
          :title="botStore.botStores[bot.botId].isBotOnline ? 'Online' : 'Offline'"
        ></OnlineIcon>
      </b-form-checkbox>
      <div v-if="!noButtons" class="float-end d-flex flex-align-center">
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
import OnlineIcon from 'vue-material-design-icons/Circle.vue';
import { BotDescriptor } from '@/types';
import { defineComponent, computed, ref } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';

export default defineComponent({
  name: 'BotEntry',
  components: {
    DeleteIcon,
    EditIcon,
    OnlineIcon,
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

<style scoped lang="scss">
.form-switch {
  padding-left: 0;
  display: flex;
  flex-wrap: nowrap;
}
.online {
  color: #1aa903;
}
.offline {
  color: #e01515;
}
</style>
