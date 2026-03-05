<script setup lang="ts">
const botStore = useBotStore();
</script>

<template>
  <footer class="md:hidden">
    <!-- Only visible on xs (phone) viewport! -->
    <hr class="my-0" />
    <div class="flex gap-2 justify-between px-2">
      <UButton
        v-if="!botStore.canRunBacktest"
        icon-pos="top"
        variant="link"
        as="router-link"
        class="flex flex-col gap-1"
        to="/open_trades"
        label="Trades"
        icon="mdi:folder-open"
      />
      <UButton
        v-if="!botStore.canRunBacktest"
        icon-pos="top"
        variant="link"
        as="router-link"
        class="flex flex-col gap-1"
        to="/trade_history"
        label="History"
        icon="mdi:folder-lock"
      />
      <UButton
        v-if="!botStore.canRunBacktest"
        icon-pos="top"
        variant="link"
        as="router-link"
        class="flex flex-col gap-1"
        to="/pairlist"
        label="Pairlist"
        icon="mdi:format-list-group"
      />
      <UButton
        v-if="!botStore.canRunBacktest"
        icon-pos="top"
        variant="link"
        as="router-link"
        class="flex flex-col gap-1"
        to="/balance"
        label="Balance"
        icon="mdi:bank"
      />
      <UButton
        v-if="!botStore.canRunBacktest"
        icon-pos="top"
        variant="link"
        as="router-link"
        class="flex flex-col gap-1"
        to="/dashboard"
        label="Dashboard"
        icon="mdi:view-dashboard-outline"
      />
    </div>
  </footer>
</template>
