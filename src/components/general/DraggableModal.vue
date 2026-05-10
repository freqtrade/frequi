<script setup lang="ts">
interface DraggableContainer {
  container: HTMLElement | null;
  handle: HTMLElement | null;
  uid: number | undefined;
}
const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    draggable?: boolean;
  }>(),
  {
    draggable: true,
  },
);

const modalOpen = defineModel<boolean>('open');

const instance = getCurrentInstance();
const modal = reactive<DraggableContainer>({
  container: null,
  uid: instance?.uid,
  handle: null,
});
const viewport = shallowRef<HTMLElement | null>(null);

const { x, y, style } = useDraggable(toRef(modal, 'container'), {
  containerElement: viewport,
  handle: toRef(modal, 'handle'),
  preventDefault: true,
});

const modalContent = computed(() => {
  if (!props.draggable) {
    return undefined;
  }

  return {
    style: style.value,
  } as Record<string, unknown>;
});

const centerModal = () => {
  if (!modal.container || !viewport.value) {
    return;
  }

  const { width, height } = modal.container.getBoundingClientRect();
  const { clientWidth, clientHeight } = viewport.value;

  x.value = Math.max(0, (clientWidth - width) / 2);
  y.value = Math.max(0, (clientHeight - height) / 2);
};

watch(
  modalOpen,
  async (isOpen) => {
    if (isOpen && props.draggable) {
      await nextTick();

      modal.container = document.querySelector(`.draggable-modal-${modal.uid}`) as HTMLElement;
      modal.handle = document.querySelector(`.draggable-modal-handle-${modal.uid}`) as HTMLElement;
      viewport.value = document.documentElement;
      centerModal();

      return;
    }

    modal.container = null;
    modal.handle = null;
    viewport.value = null;
  },
  { immediate: true },
);
</script>

<template>
  <UModal
    v-model:open="modalOpen"
    :title
    :description
    :content="modalContent"
    :ui="
      props.draggable
        ? {
            content: `fixed draggable-modal-${modal.uid} !translate-x-0 !translate-y-0`,
            header: `draggable-modal-handle-${modal.uid} cursor-grab select-none active:cursor-grabbing`,
          }
        : {}
    "
  >
    <template #body>
      <slot name="body" />
    </template>
  </UModal>
</template>
