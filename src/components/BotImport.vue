<script setup lang="ts">
defineProps<{
  loginInfo:
    | {
        botId: string;
        botName: string;
        apiUrl: string;
        username?: string | undefined;
        refreshToken: string;
        accessToken: string;
        autoRefresh: boolean;
        sortId?: number | undefined;
      }
    | undefined;
  handleLoginResult: (result: boolean) => void;
}>();
</script>

<template>
  <div class="flex flex-col gap-4">
    <label for="bot-json" class="font-semibold">Paste Bot Details JSON:</label>
    <textarea
      id="bot-json"
      class="w-full h-64 p-2 border rounded resize-none font-mono text-sm"
      placeholder="Paste your bot details JSON here..."
    ></textarea>
  </div>
</template>
