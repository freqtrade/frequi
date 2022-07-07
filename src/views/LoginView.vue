<template>
  <div class="container">
    <b-card header="Freqtrade bot Login">
      <Login id="loginForm" ref="loginForm" />
    </b-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Login from '@/components/Login.vue';

export default defineComponent({
  name: 'LoginView',
  components: { Login },
});
</script>

<style scoped>
.container {
  max-width: 520px;
}
</style>
