<template>
  <form class="d-flex" @submit.prevent="save">
    <b-form-input
      v-model="newName"
      size="sm"
      class="w-100"
      placeholder="Bot name"
      style="border-style: solid; border-width: 1px"
      autofocus
    />

    <div class="d-flex ml-2">
      <b-button type="submit" size="sm" title="Save">
        <CheckIcon :size="16" />
      </b-button>

      <b-button class="ml-1" size="sm" title="Cancel" @click="$emit('cancelled')">
        <CloseIcon :size="16" />
      </b-button>
    </div>
  </form>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import CheckIcon from 'vue-material-design-icons/Check.vue';
import CloseIcon from 'vue-material-design-icons/Close.vue';
import { BotDescriptor, RenameBotPayload } from '@/types';
import StoreModules from '@/store/storeSubModules';

const ftbot = namespace(StoreModules.ftbot);

@Component({
  components: {
    CheckIcon,
    CloseIcon,
  },
})
export default class BotList extends Vue {
  @Prop({ required: true, type: Object }) bot!: BotDescriptor;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action renameBot!: (payload: RenameBotPayload) => Promise<void>;

  newName: string = this.bot.botName;

  save() {
    this.renameBot({
      botId: this.bot.botId,
      botName: this.newName,
    });

    this.$emit('saved');
  }
}
</script>
