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

const show = (msg: MsgBoxObject) => {
  title.value = msg.title;
  message.value = msg.message;
  showRef.value = true;
  accept.value = msg.accept;
};

defineExpose({ show });
</script>

<template>
  <BModal
    id="MsgBoxModal"
    ref="removeTradeModal"
    v-model="showRef"
    :title="title"
    @ok="msgBoxOK"
    @cancel="showRef = false"
    @keyup.esc="showRef = false"
    @keyup.enter="msgBoxOK"
  >
    {{ message }}
  </BModal>
</template>
