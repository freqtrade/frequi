<script setup lang="ts">
const { t } = useUiText();
</script>

<template>
  <div class="border max-w-xl mx-auto p-4">
    <DraggableContainer :header="t('botLoginHeader')">
      <BotLogin ref="loginForm" />
    </DraggableContainer>
  </div>
</template>
