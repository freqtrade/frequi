<script setup lang="ts">
export interface MsgBoxObject {
  title: string;
  message: string;
  accept: () => void;
}
const showRef = ref<boolean>(false);
const title = ref<string>('');
const message = ref<string>('');
const accept = ref<() => void>(() => {
  console.warn('Accepted not set.');
});

function msgBoxOK() {
  accept.value();
  showRef.value = false;
}

function show(msg: MsgBoxObject) {
  title.value = msg.title;
  message.value = msg.message;
  showRef.value = true;
  accept.value = msg.accept;
}

defineExpose({ show });
</script>

<template>
  <UModal
    id="MsgBoxModal"
    ref="removeTradeModal"
    v-model:open="showRef"
    :title="title"
    description="Confirmation"
  >
    <template #body>
      {{ message }}
    </template>
    <template #footer>
      <UButton
        class="ms-auto min-w-30"
        label="Cancel"
        variant="outline"
        color="neutral"
        icon="mdi:close"
        @click="showRef = false"
      />
      <UButton class="min-w-30" label="Ok" icon="mdi:check" autofocus @click="msgBoxOK" />
    </template>
  </UModal>
</template>
