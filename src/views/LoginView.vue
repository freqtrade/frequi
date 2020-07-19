<template>
  <div class="container">
    <b-card header="Freqtrade bot Login">
      <Login id="loginForm" ref="loginForm" />
    </b-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import Login from '@/components/Login.vue';

@Component({
  components: { Login },
})
export default class LoginView extends Vue {}
</script>

<style scoped>
.container {
  max-width: 520px;
}
</style>
