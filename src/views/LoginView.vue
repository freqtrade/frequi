<template>
  <div class="container">
    <b-card header="Freqtrade bot Login">
      <Login ref="loginForm" />
    </b-card>
  </div>
</template>

<script setup lang="ts">
import Login from '@/components/BotLogin.vue';
</script>

<style scoped>
.container {
  max-width: 520px;
}
</style>
