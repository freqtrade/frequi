<template>
  <b-container fluid>
    <b-row v-if="whitelist.length > 0">
      <b-col cols="12" md="3"></b-col>
      <b-col></b-col>
      <b-col cols="12" md="3">
        <pre class="text-start"><code>{{ whitelist }}</code></pre>
      </b-col>
    </b-row>
    <b-row v-else>
      <b-col>
        <p>Evaluation returned 0 pairs</p>
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup lang="ts">
const props = defineProps<{
  whitelist: string[];
}>();
</script>
