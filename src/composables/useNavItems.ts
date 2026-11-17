export interface NavEntry {
  label: string;
  to: string;
  icon: string;
}

export interface NavGroup {
  label: string;
  items: NavEntry[];
}

/**
 * Navigation structure shared by the sidebar (desktop) and the slide-over menu (mobile).
 * Entries are filtered by what the selected bot supports.
 */
export function useNavItems() {
  const botStore = useBotStore();

  const groups = computed<NavGroup[]>(() => {
    const webserver = botStore.activeBot?.isWebserverMode ?? false;
    const features = botStore.activeBot?.botFeatures;
    const candidates: { label: string; items: (NavEntry & { visible: boolean })[] }[] = [
      {
        label: 'Trade',
        items: [
          {
            label: 'Trade',
            to: '/trade',
            icon: 'i-mdi-swap-vertical-circle-outline',
            visible: !botStore.canRunBacktest,
          },
          {
            label: 'Dashboard',
            to: '/dashboard',
            icon: 'i-mdi-view-dashboard-outline',
            visible: !botStore.canRunBacktest,
          },
          {
            label: 'Backtest',
            to: '/backtest',
            icon: 'i-mdi-flask-outline',
            visible: botStore.canRunBacktest,
          },
        ],
      },
      {
        label: 'Analyze',
        items: [
          { label: 'Chart', to: '/graph', icon: 'i-mdi-chart-line', visible: true },
          { label: 'Logs', to: '/logs', icon: 'i-mdi-format-list-bulleted', visible: true },
          {
            label: 'Recursive Analysis',
            to: '/recursive_analysis',
            icon: 'i-mdi-magnify-scan',
            visible: webserver && !!features?.recursiveAnalysis && botStore.canRunBacktest,
          },
          {
            label: 'Lookahead Analysis',
            to: '/lookahead_analysis',
            icon: 'i-mdi-chart-timeline-variant-shimmer',
            visible: webserver && !!features?.lookaheadAnalysis && botStore.canRunBacktest,
          },
        ],
      },
      {
        label: 'Tools',
        items: [
          {
            label: 'Download Data',
            to: '/download_data',
            icon: 'i-mdi-download',
            visible: botStore.isWebserverMode && !!features?.downloadDataView,
          },
          {
            label: 'Pairlist Config',
            to: '/pairlist_config',
            icon: 'i-mdi-format-list-numbered-rtl',
            visible: webserver && !!features?.pairlistConfig,
          },
        ],
      },
    ];

    return candidates
      .map((g) => ({
        label: g.label,
        items: g.items.filter((i) => i.visible).map(({ visible: _v, ...rest }) => rest),
      }))
      .filter((g) => g.items.length > 0);
  });

  const flatItems = computed<NavEntry[]>(() => groups.value.flatMap((g) => g.items));

  return { groups, flatItems };
}
