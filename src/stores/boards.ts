import type { Board, BoardExport, WidgetInstance, WidgetPreset } from '@/widgets/types';
import { BOARD_TEMPLATES, DEFAULT_BOARDS, newCustomBoard } from '@/widgets/defaultBoards';
import { SOURCES } from '@/widgets/sources';
import { defaultOptions } from '@/widgets/helpers';

const STORE_BOARDS = 'ftBoards';

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function nextWidgetId(board: Board): number {
  return board.widgets.reduce((max, w) => Math.max(max, w.id), 0) + 1;
}

/** Drops unknown sources and fixes layout entries, so a broken import cannot break a page. */
function sanitizeBoard(input: Board): Board {
  const widgets = (input.widgets ?? []).filter((w) => !!SOURCES[w.source]);
  const ids = new Set(widgets.map((w) => w.id));
  const layout = (input.layout ?? []).filter((l) => ids.has(l.i));
  widgets.forEach((w) => {
    w.options = { ...defaultOptions(), ...(w.options ?? {}) };
    w.options.filters = w.options.filters ?? {};
    if (!SOURCES[w.source]!.displays.includes(w.display)) {
      w.display = SOURCES[w.source]!.defaultDisplay;
    }
    if (!layout.find((l) => l.i === w.id)) {
      const y = layout.reduce((m, l) => Math.max(m, l.y + l.h), 0);
      layout.push({ i: w.id, x: 0, y, w: 6, h: 6 });
    }
  });
  return {
    id: String(input.id),
    name: String(input.name || 'Board'),
    icon: input.icon || 'i-mdi-view-grid-outline',
    builtIn: !!input.builtIn,
    widgets,
    layout,
  };
}

export const useBoardsStore = defineStore(
  'boards',
  () => {
    /** Saved boards: customized built-in boards and custom boards. */
    const boards = ref<Record<string, Board>>({});
    /** Order of custom boards in the sidebar. */
    const customOrder = ref<string[]>([]);

    // UI state (not persisted): the board shown on the current page and what is being edited.
    const activeBoardId = ref<string | null>(null);
    const editing = ref(false);
    const galleryOpen = ref(false);
    const settingsWidgetId = ref<number | null>(null);

    function openSettings(widgetId: number) {
      settingsWidgetId.value = widgetId;
    }

    const customBoards = computed(() =>
      customOrder.value.map((id) => boards.value[id]).filter((b): b is Board => !!b),
    );

    /** Returns the board, creating it from its default the first time. */
    function getBoard(id: string): Board | undefined {
      if (!boards.value[id]) {
        const def = DEFAULT_BOARDS[id];
        if (!def) return undefined;
        boards.value[id] = clone(def);
      }
      return boards.value[id];
    }

    function resetBoard(id: string) {
      const def = DEFAULT_BOARDS[id];
      if (def) boards.value[id] = clone(def);
    }

    function resetAllBoards() {
      Object.keys(DEFAULT_BOARDS).forEach((id) => delete boards.value[id]);
    }

    function createBoard(name: string): Board {
      const id = `custom-${Date.now().toString(36)}`;
      boards.value[id] = newCustomBoard(id, name || 'New board');
      customOrder.value.push(id);
      return boards.value[id]!;
    }

    function duplicateBoard(id: string): Board | undefined {
      const src = getBoard(id);
      if (!src) return undefined;
      const copy = createBoard(`${src.name} (copy)`);
      copy.widgets = clone(src.widgets);
      copy.layout = clone(src.layout);
      copy.icon = src.icon;
      return copy;
    }

    function deleteBoard(id: string) {
      if (boards.value[id]?.builtIn) return;
      delete boards.value[id];
      customOrder.value = customOrder.value.filter((b) => b !== id);
    }

    function renameBoard(id: string, name: string) {
      const b = getBoard(id);
      if (b && name.trim()) b.name = name.trim();
    }

    /** Adds a widget for a source, or from a gallery preset. */
    function addWidget(
      boardId: string,
      sourceOrPreset: string | WidgetPreset,
    ): WidgetInstance | undefined {
      const board = getBoard(boardId);
      const preset = typeof sourceOrPreset === 'string' ? undefined : sourceOrPreset;
      const source = preset?.source ?? (sourceOrPreset as string);
      const def = SOURCES[source];
      if (!board || !def) return undefined;
      const id = nextWidgetId(board);
      const widget: WidgetInstance = {
        id,
        source,
        display: preset?.display ?? def.defaultDisplay,
        title: preset?.label,
        options: defaultOptions(clone(preset?.options ?? {})),
      };
      const size = preset?.size ?? def.defaultSize ?? { w: 6, h: 6 };
      const y = board.layout.reduce((m, l) => Math.max(m, l.y + l.h), 0);
      board.widgets.push(widget);
      board.layout.push({ i: id, x: 0, y, w: size.w, h: size.h });
      return widget;
    }

    function duplicateWidget(boardId: string, widgetId: number) {
      const board = getBoard(boardId);
      const src = board?.widgets.find((w) => w.id === widgetId);
      const pos = board?.layout.find((l) => l.i === widgetId);
      if (!board || !src || !pos) return;
      const id = nextWidgetId(board);
      board.widgets.push({ ...clone(src), id, collapsed: false });
      const y = board.layout.reduce((m, l) => Math.max(m, l.y + l.h), 0);
      board.layout.push({ i: id, x: pos.x, y, w: pos.w, h: src.expandedH ?? pos.h });
    }

    function removeWidget(boardId: string, widgetId: number) {
      const board = getBoard(boardId);
      if (!board) return;
      board.widgets = board.widgets.filter((w) => w.id !== widgetId);
      board.layout = board.layout.filter((l) => l.i !== widgetId);
    }

    function toggleCollapsed(boardId: string, widgetId: number) {
      const board = getBoard(boardId);
      const widget = board?.widgets.find((w) => w.id === widgetId);
      const pos = board?.layout.find((l) => l.i === widgetId);
      if (!widget || !pos) return;
      if (widget.collapsed) {
        pos.h = widget.expandedH ?? 6;
        widget.collapsed = false;
      } else {
        widget.expandedH = pos.h;
        pos.h = 1;
        widget.collapsed = true;
      }
    }

    function applyTemplate(boardId: string, templateKey: string) {
      const board = getBoard(boardId);
      const tpl = BOARD_TEMPLATES.find((t) => t.key === templateKey);
      if (!board || !tpl) return;
      board.widgets = clone(tpl.board.widgets);
      board.layout = clone(tpl.board.layout);
    }

    function exportBoard(id: string): BoardExport | undefined {
      const b = getBoard(id);
      return b ? { freqUIBoard: 1, board: clone(b) } : undefined;
    }

    /**
     * Imports a board. A built-in board id replaces that board's layout,
     * anything else becomes a new custom board.
     * @returns id of the imported board
     */
    function importBoard(data: unknown): string {
      const payload = data as Partial<BoardExport>;
      if (!payload || payload.freqUIBoard !== 1 || !payload.board) {
        throw new Error('Not a freqUI board file.');
      }
      const board = sanitizeBoard(payload.board);
      if (DEFAULT_BOARDS[board.id]) {
        boards.value[board.id] = { ...board, builtIn: true };
        return board.id;
      }
      const created = createBoard(board.name);
      created.widgets = board.widgets;
      created.layout = board.layout;
      created.icon = board.icon;
      return created.id;
    }

    return {
      boards,
      customOrder,
      activeBoardId,
      editing,
      galleryOpen,
      settingsWidgetId,
      openSettings,
      customBoards,
      getBoard,
      resetBoard,
      resetAllBoards,
      createBoard,
      duplicateBoard,
      deleteBoard,
      renameBoard,
      addWidget,
      duplicateWidget,
      removeWidget,
      toggleCollapsed,
      applyTemplate,
      exportBoard,
      importBoard,
    };
  },
  {
    persist: {
      key: STORE_BOARDS,
      pick: ['boards', 'customOrder'],
      afterHydrate: (context) => {
        // Drop widgets whose source no longer exists (e.g. after an update).
        const boards = context.store.boards as Record<string, Board>;
        Object.keys(boards).forEach((id) => {
          boards[id] = sanitizeBoard(boards[id]!);
        });
      },
    },
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBoardsStore, import.meta.hot));
}
