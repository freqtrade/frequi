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

    <div class="d-flex ms-2">
      <b-button type="submit" size="sm" title="Save">
        <i-mdi-check />
      </b-button>

      <b-button class="ms-1" size="sm" title="Cancel" @click="$emit('cancelled')">
        <i-mdi-close />
      </b-button>
    </div>
  </form>
</template>

<script lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import { BotDescriptor } from '@/types';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'BotRename',
  props: {
    bot: { type: Object as () => BotDescriptor, required: true },
  },
  emits: ['cancelled', 'saved'],
  setup(props, { emit }) {
    const botStore = useBotStore();

    const newName = ref<string>(props.bot.botName);

    const save = () => {
      botStore.updateBot(props.bot.botId, {
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
