<template>
  <div class="container">
    <b-card header="Freqtrade bot Login">
      <BotLogin ref="loginForm" />
    </b-card>
  </div>
</template>

<script setup lang="ts">
import BotLogin from '@/components/BotLogin.vue';
</script>

<style scoped>
.container {
  max-width: 520px;
}
</style>
