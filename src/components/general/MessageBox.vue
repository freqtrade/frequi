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

const msgBoxOK = () => {
  accept.value();
  showRef.value = false;
};

function show(msg: MsgBoxObject) {
  title.value = msg.title;
  message.value = msg.message;
  showRef.value = true;
  accept.value = msg.accept;
}

defineExpose({ show });
</script>

<template>
  <Dialog id="MsgBoxModal" ref="removeTradeModal" v-model:visible="showRef" modal :header="title">
    {{ message }}
    <template #footer>
      <Button
        class="min-w-30"
        label="Cancel"
        variant="outlined"
        severity="secondary"
        @click="showRef = false"
      />
      <Button class="min-w-30" label="Ok" severity="primary" autofocus @click="msgBoxOK" />
    </template>
  </Dialog>
</template>
