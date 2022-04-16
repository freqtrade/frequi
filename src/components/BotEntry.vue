<template>
  <div class="d-flex align-items-center justify-content-between w-100">
    <span class="mr-2">{{ bot.botName || bot.botId }}</span>

    <div class="align-items-center d-flex">
      <span class="ml-2 mr-1 align-middle">{{
        allIsBotOnline[bot.botId] ? '&#128994;' : '&#128308;'
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
import { MultiBotStoreGetters } from '@/store/modules/botStoreWrapper';
import EditIcon from 'vue-material-design-icons/Pencil.vue';
import DeleteIcon from 'vue-material-design-icons/Delete.vue';
import { BotDescriptor } from '@/types';
import StoreModules from '@/store/storeSubModules';
import { defineComponent, computed } from '@vue/composition-api';
import { useNamespacedActions, useNamespacedGetters, useStore } from 'vuex-composition-helpers';

export default defineComponent({
  name: 'BotEntry',
  components: {
    DeleteIcon,
    EditIcon,
  },
  props: {
    bot: { required: true, type: Object },
    noButtons: { default: false, type: Boolean },
  },
  emits: ['edit'],
  setup(props, { root }) {
    const store = useStore();
    const { allIsBotOnline, allAutoRefresh } = useNamespacedGetters(StoreModules.ftbot, [
      MultiBotStoreGetters.allIsBotOnline,
      MultiBotStoreGetters.allAutoRefresh,
    ]);
    const { removeBot } = useNamespacedActions(StoreModules.ftbot, ['removeBot']);

    const changeEvent = (v) => {
      store.dispatch(`ftbot/${props.bot.botId}/setAutoRefresh`, v);
    };

    const clickRemoveBot = (bot: BotDescriptor) => {
      //
      root.$bvModal
        .msgBoxConfirm(`Really remove (logout) from '${bot.botName}' (${bot.botId})?`)
        .then((value: boolean) => {
          if (value) {
            removeBot(bot.botId);
          }
        });
    };
    const autoRefreshLoc = computed({
      get() {
        return allAutoRefresh.value[props.bot.botId];
      },
      set(_) {
        // pass
      },
    });

    return {
      allIsBotOnline,
      allAutoRefresh,
      changeEvent,
      clickRemoveBot,
      autoRefreshLoc,
    };
  },
});
</script>
