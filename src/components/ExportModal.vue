<script setup lang="ts">
interface Props {
  buttonText?: string;
  dialogTitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: 'Open Text Area',
  dialogTitle: 'Text Area Dialog',
});

const dialogOpen = ref(false);
const textContent = ref('');
const toast = useToast();

function openDialog() {
  // Get ftAuthLoginInfo from localStorage and convert to base64
  const authInfo = localStorage.getItem('ftAuthLoginInfo');
  if (authInfo) {
    try {
      // Parse the authInfo JSON
      const parsedAuthInfo = JSON.parse(authInfo);

      // Extract the required attributes from each bot entry
      const extractedBots = Object.values(parsedAuthInfo).map((bot: any) => ({
        botName: bot.botName,
        url: bot.apiUrl,
        username: bot.username,
        accessToken: bot.accessToken,
        refreshToken: bot.refreshToken,
      }));

      // Convert the array to JSON string and then to base64
      textContent.value = btoa(JSON.stringify(extractedBots));
    } catch (error) {
      console.error('Error parsing auth info:', error);
      textContent.value = '';
    }
  } else {
    textContent.value = '';
  }
  dialogOpen.value = true;
}

function closeDialog() {
  dialogOpen.value = false;
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(textContent.value);
    toast.add({
      summary: 'Success',
      detail: 'Content copied to clipboard',
      severity: 'success',
      life: 3000,
    });
  } catch (err) {
    console.error('Failed to copy text to clipboard:', err);
    toast.add({
      summary: 'Error',
      detail: 'Failed to copy content to clipboard',
      severity: 'error',
      life: 3000,
    });
  }
}

function selectAll(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  target.select();
}

defineExpose({
  openDialog,
});
</script>

<template>
  <div>
    <Button severity="secondary" @click="openDialog">
      <i-mdi-export-variant class="me-1" />{{ props.buttonText }}
    </Button>
    <Dialog
      v-model:visible="dialogOpen"
      :header="props.dialogTitle"
      :dismissable-mask="true"
      class="w-[600px]"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="textArea" class="font-medium">Exported JSON in Base64:</label>
          <Textarea
            id="textArea"
            v-model="textContent"
            rows="8"
            class="w-full"
            placeholder="No bot found..."
            readonly
            style="resize: none; overflow-y: auto"
            @focus="selectAll"
          />
        </div>
        <div class="flex justify-end gap-2">
          <Button severity="secondary" @click="copyToClipboard">
            <i-mdi-content-copy class="me-1" />Copy
          </Button>
          <Button severity="primary" @click="closeDialog">Close</Button>
        </div>
      </div>
    </Dialog>
  </div>
</template>
