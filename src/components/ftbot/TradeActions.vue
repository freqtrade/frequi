<template>
  <div class="d-flex flex-column">
    <b-button
      v-if="botApiVersion <= 1.1"
      class="btn-xs text-left"
      size="sm"
      title="Forcesell"
      @click="$emit('forceSell', trade)"
    >
      <ForceSellIcon :size="16" title="Forcesell" class="mr-1" />Forcesell
    </b-button>
    <b-button
      v-if="botApiVersion > 1.1"
      class="btn-xs text-left"
      size="sm"
      title="Forcesell limit"
      @click="$emit('forceSell', trade, 'limit')"
    >
      <ForceSellIcon :size="16" title="Forcesell" class="mr-1" />Forcesell limit
    </b-button>
    <b-button
      v-if="botApiVersion > 1.1"
      class="btn-xs text-left mt-1"
      size="sm"
      title="Forcesell market"
      @click="$emit('forceSell', trade, 'market')"
    >
      <ForceSellIcon :size="16" title="Forcesell" class="mr-1" />Forcesell market
    </b-button>

    <b-button
      class="btn-xs text-left mt-1"
      size="sm"
      title="Delete trade"
      @click="$emit('deleteTrade', trade)"
    >
      <DeleteIcon :size="16" title="Delete trade" class="mr-1" />
      Delete
    </b-button>
  </div>
</template>

<script lang="ts">
import { Trade } from '@/types';
import { defineComponent } from '@vue/composition-api';
import DeleteIcon from 'vue-material-design-icons/Delete.vue';
import ForceSellIcon from 'vue-material-design-icons/CloseBoxMultiple.vue';

export default defineComponent({
  name: 'TradeActions',
  components: { DeleteIcon, ForceSellIcon },
  props: {
    botApiVersion: {
      type: Number,
      default: 1.0,
    },
    trade: {
      type: Object as () => Trade,
      required: true,
    },
  },
  emits: ['forceSell', 'deleteTrade'],
  setup() {
    return {};
  },
});
</script>

<style scoped lang="scss"></style>
