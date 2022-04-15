<template>
  <form class="d-flex" @submit.prevent="save">
    <b-form-input
      v-model="newName"
      size="sm"
      class="w-100"
      placeholder="Bot name"
      style="border-style: solid; border-width: 1px"
      autofocus
    />

    <div class="d-flex ml-2">
      <b-button type="submit" size="sm" title="Save">
        <CheckIcon :size="16" />
      </b-button>

      <b-button class="ml-1" size="sm" title="Cancel" @click="$emit('cancelled')">
        <CloseIcon :size="16" />
      </b-button>
    </div>
  </form>
</template>

<script lang="ts">
import CheckIcon from 'vue-material-design-icons/Check.vue';
import CloseIcon from 'vue-material-design-icons/Close.vue';
import { BotDescriptor } from '@/types';
import StoreModules from '@/store/storeSubModules';
import { defineComponent, ref } from '@vue/composition-api';
import { useNamespacedActions } from 'vuex-composition-helpers';

export default defineComponent({
  name: 'BotRename',
  components: {
    CheckIcon,
    CloseIcon,
  },
  props: {
    bot: { type: Object as () => BotDescriptor, required: true },
  },
  emits: ['saved'],
  setup(props, { emit }) {
    const { renameBot } = useNamespacedActions(StoreModules.ftbot, ['renameBot']);
    const newName = ref<string>(props.bot.botName);

    const save = () => {
      renameBot({
        botId: props.bot.botId,
        botName: newName.value,
      });

      emit('saved');
    };
    return {
      newName,
      save,
    };
  },
});
</script>
