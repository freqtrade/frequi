<script setup lang="ts">
import PredictionMarkets from '@/views/PredictionMarkets.vue';
</script>

<template>
  <div class="workspace-page">
    <section class="workspace-header">
      <div>
        <div class="workspace-kicker">Prediction Markets</div>
        <h1>Polymarket Desk</h1>
      </div>
      <div class="workspace-note">Event contracts, model ensemble, Kelly sizing, and paper actions.</div>
    </section>

    <section class="workspace-body">
      <PredictionMarkets />
    </section>
  </div>
</template>

<style scoped>
@import './workspace.css';

.workspace-note {
  max-width: 34rem;
  color: var(--p-surface-400);
  font-size: 0.86rem;
  font-weight: 600;
  line-height: 1.45;
  text-align: right;
}

@media (max-width: 767px) {
  .workspace-note {
    text-align: left;
  }
}
</style>
