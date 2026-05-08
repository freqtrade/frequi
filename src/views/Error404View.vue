<script setup lang="ts">
const { t } = useUiText();
</script>

<template>
  <div>
    <h1 class="mb-5">{{ t('error404Title') }}</h1>
    <p class="h4">{{ t('error404Body') }}</p>
    <p>
      {{ t('error404Back') }}
      <RouterLink to="/"> <span>{{ t('mainPage') }}</span> </RouterLink>.
    </p>
  </div>
</template>
