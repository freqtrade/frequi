<template>
  <div class="card h-100 w-100">
    <div class="drag-header card-header">
      {{ header }}
    </div>
    <div class="card-body h-100 w-100">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({})
export default class DraggableContainer extends Vue {
  @Prop({ required: true, type: String }) header!: string;
}
</script>

<style scoped>
.card-header {
  padding: 0.25rem 0.5rem;
}
.card-body {
  padding: 0.25rem 0 0 0.25rem;
}
</style>
