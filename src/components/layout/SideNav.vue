<script setup lang="ts">
const settingsStore = useSettingsStore();
const boardsStore = useBoardsStore();
const router = useRouter();

async function newBoard() {
  const board = boardsStore.createBoard(`My board ${boardsStore.customBoards.length + 1}`);
  await router.push(`/board/${board.id}`);
  boardsStore.editing = true;
}
const { groups } = useNavItems();

const collapsed = computed(() => settingsStore.sidebarCollapsed);
</script>

<template>
  <aside
    class="hidden shrink-0 flex-col py-2 ps-2 transition-[width] duration-200 md:flex"
    :class="collapsed ? 'w-[4.5rem]' : 'w-56'"
  >
    <nav
      class="glass-strong flex h-full flex-col gap-1 overflow-y-auto rounded-2xl p-2"
      aria-label="Main navigation"
    >
      <RouterLink
        to="/"
        exact
        class="mb-2 flex items-center gap-2 px-2 py-1"
        :class="collapsed ? 'justify-center' : ''"
        title="Home"
      >
        <AppIcon class="h-8 w-8 shrink-0 drop-shadow-[0_0_8px_var(--ft-accent-glow)]" />
        <AppText v-if="!collapsed" />
      </RouterLink>

      <template v-for="group in groups" :key="group.label">
        <div
          v-if="!collapsed"
          class="mt-3 mb-1 px-3 text-[11px] font-semibold tracking-wider text-muted uppercase"
        >
          {{ group.label }}
        </div>
        <USeparator v-else class="my-2" />
        <RouterLink
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          custom
          v-slot="{ href, navigate, isActive }"
        >
          <a
            :href="href"
            class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
            :class="[
              collapsed ? 'justify-center' : '',
              isActive
                ? 'bg-primary/15 text-primary accent-glow'
                : 'text-muted hover:bg-white/5 hover:text-default',
            ]"
            :title="collapsed ? item.label : undefined"
            :aria-label="item.label"
            :aria-current="isActive ? 'page' : undefined"
            @click="navigate"
          >
            <UIcon :name="item.icon" class="size-5 shrink-0" />
            <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
          </a>
        </RouterLink>
      </template>

      <!-- Custom boards -->
      <div
        v-if="!collapsed"
        class="mt-3 mb-1 flex items-center justify-between px-3 text-[11px] font-semibold tracking-wider text-muted uppercase"
      >
        <span>My boards</span>
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          icon="i-mdi-plus"
          title="New board"
          aria-label="New board"
          @click="newBoard"
        />
      </div>
      <USeparator v-else class="my-2" />
      <RouterLink
        v-for="b in boardsStore.customBoards"
        :key="b.id"
        :to="`/board/${b.id}`"
        custom
        v-slot="{ href, navigate, isActive }"
      >
        <a
          :href="href"
          class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
          :class="[
            collapsed ? 'justify-center' : '',
            isActive
              ? 'bg-primary/15 text-primary accent-glow'
              : 'text-muted hover:bg-white/5 hover:text-default',
          ]"
          :title="collapsed ? b.name : undefined"
          :aria-label="b.name"
          :aria-current="isActive ? 'page' : undefined"
          @click="navigate"
        >
          <UIcon :name="b.icon" class="size-5 shrink-0" />
          <span v-if="!collapsed" class="truncate">{{ b.name }}</span>
        </a>
      </RouterLink>
      <button
        v-if="collapsed"
        type="button"
        class="flex justify-center rounded-xl px-3 py-2 text-muted hover:bg-white/5 hover:text-default"
        title="New board"
        aria-label="New board"
        @click="newBoard"
      >
        <UIcon name="i-mdi-plus" class="size-5" />
      </button>

      <div class="mt-auto flex flex-col gap-1 pt-3">
        <USeparator class="mb-2" />
        <RouterLink to="/settings" custom v-slot="{ href, navigate, isActive }">
          <a
            :href="href"
            class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
            :class="[
              collapsed ? 'justify-center' : '',
              isActive
                ? 'bg-primary/15 text-primary accent-glow'
                : 'text-muted hover:bg-white/5 hover:text-default',
            ]"
            :title="collapsed ? 'Settings' : undefined"
            aria-label="Settings"
            @click="navigate"
          >
            <UIcon name="i-mdi-cog-outline" class="size-5 shrink-0" />
            <span v-if="!collapsed">Settings</span>
          </a>
        </RouterLink>

        <div
          class="flex items-center gap-1"
          :class="collapsed ? 'flex-col' : 'justify-between px-1'"
        >
          <ThemeSelect />
          <UPopover :content="{ side: 'right', align: 'end' }">
            <UButton
              variant="ghost"
              color="neutral"
              icon="mdi:palette-outline"
              title="Accent colour"
              aria-label="Accent colour"
            />
            <template #content>
              <div class="p-3"><AccentSelect show-text /></div>
            </template>
          </UPopover>
          <UButton
            variant="ghost"
            color="neutral"
            :icon="collapsed ? 'mdi:chevron-double-right' : 'mdi:chevron-double-left'"
            :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
            :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
            @click="settingsStore.sidebarCollapsed = !settingsStore.sidebarCollapsed"
          />
        </div>
      </div>
    </nav>
  </aside>
</template>
