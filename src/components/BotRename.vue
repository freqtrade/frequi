<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import { BotDescriptor } from '@/types';

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
  <form class="d-flex" @submit.prevent="save">
    <BFormInput
      v-model="newName"
      size="sm"
      class="w-100"
      placeholder="Bot name"
      style="border-style: solid; border-width: 1px"
      autofocus
    />

    <div class="d-flex ms-2 no-min-w">
      <BButton type="submit" size="sm" title="Save" class="no-min-w">
        <i-mdi-check />
      </BButton>

      <BButton class="ms-1 no-min-w" size="sm" title="Cancel" @click="$emit('cancelled')">
        <i-mdi-close />
      </BButton>
    </div>
  </form>
</template>
