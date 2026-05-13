<script setup lang="ts">
import type { BotDescriptor } from '@/types';
const props = defineProps<{
  bot: BotDescriptor;
}>();
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
  <form class="flex w-full gap-2" @submit.prevent="save">
    <UInput v-model="newName" class="w-full" placeholder="Bot name" autofocus />

    <div class="flex gap-1">
      <UButton type="submit" color="neutral" title="Save" icon="mdi:check" />

      <UButton color="neutral" title="Cancel" @click="$emit('cancelled')" icon="mdi:close">
      </UButton>
    </div>
  </form>
</template>
