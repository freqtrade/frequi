<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import type { BotDescriptor } from '@/types';

const props = defineProps({
  bot: { type: Object as () => BotDescriptor, required: true },
});
const emit = defineEmits<{ cancelled: []; saved: [] }>();

const botStore = useBotStore();
const newName = ref<string>('');

onMounted(() => {
  newName.value = props.bot.botName;
});

const save = () => {
  botStore.updateBot(props.bot.botId, {
    botName: newName.value,
  });

  emit('saved');
};
</script>

<template>
  <form class="flex" @submit.prevent="save">
    <BFormInput
      v-model="newName"
      size="sm"
      class="w-full"
      placeholder="Bot name"
      style="border-style: solid; border-width: 1px"
      autofocus
    />

    <div class="flex ms-2 no-min-w">
      <BButton type="submit" size="sm" title="Save" class="no-min-w">
        <i-mdi-check />
      </BButton>

      <BButton class="ms-1 no-min-w" size="sm" title="Cancel" @click="$emit('cancelled')">
        <i-mdi-close />
      </BButton>
    </div>
  </form>
</template>
