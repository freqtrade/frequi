<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { defineComponent, h, type Component } from 'vue';
import WorkspaceIcon0 from '~icons/mdi/account-multiple-outline';
import WorkspaceIcon1 from '~icons/mdi/chart-box-outline';
import WorkspaceIcon2 from '~icons/mdi/chart-line';
import WorkspaceIcon3 from '~icons/mdi/cog-outline';
import WorkspaceIcon4 from '~icons/mdi/creation-outline';
import WorkspaceIcon5 from '~icons/mdi/forum-outline';
import WorkspaceIcon6 from '~icons/mdi/information-outline';
import WorkspaceIcon7 from '~icons/mdi/magnify';
import WorkspaceIcon8 from '~icons/mdi/message-text-outline';
import WorkspaceIcon9 from '~icons/mdi/plus';
import WorkspaceIcon10 from '~icons/mdi/send';
import WorkspaceIcon11 from '~icons/mdi/swap-horizontal';
import WorkspaceIcon12 from '~icons/mdi/view-dashboard-outline';
import WorkspaceIcon13 from '~icons/mdi/wallet-outline';
const workspaceIcons: Record<string, Component> = {
  'i-mdi-account-multiple-outline': WorkspaceIcon0,
  'i-mdi-chart-box-outline': WorkspaceIcon1,
  'i-mdi-chart-line': WorkspaceIcon2,
  'i-mdi-cog-outline': WorkspaceIcon3,
  'i-mdi-creation-outline': WorkspaceIcon4,
  'i-mdi-forum-outline': WorkspaceIcon5,
  'i-mdi-information-outline': WorkspaceIcon6,
  'i-mdi-magnify': WorkspaceIcon7,
  'i-mdi-message-text-outline': WorkspaceIcon8,
  'i-mdi-plus': WorkspaceIcon9,
  'i-mdi-send': WorkspaceIcon10,
  'i-mdi-swap-horizontal': WorkspaceIcon11,
  'i-mdi-view-dashboard-outline': WorkspaceIcon12,
  'i-mdi-wallet-outline': WorkspaceIcon13,
};
const WorkspaceIcon = defineComponent({
  props: { name: { type: String, required: true } },
  setup: (props) => () => h(workspaceIcons[props.name]!),
});

const ChartView = defineAsyncComponent(() => import('./charts/ChartView.vue'));
const MobileTradesList = defineAsyncComponent(() => import('./ftbot/MobileTradesList.vue'));
const BotBalance = defineAsyncComponent(() => import('./ftbot/BotBalance.vue'));

const bots = useBotStore();
const pendingAccounts = computed(() =>
  [{ name: 'anomaly', url: 'http://129.159.253.20:8081' }].filter(
    (account) =>
      !bots.availableBotsSorted.some((bot) => bot.botUrl.replace(/\/$/, '') === account.url),
  ),
);

const space = ref('commons');
const tab = ref('Conversation');
const draft = ref('');
const search = ref('');
const messages = useStorage<{ id: string; space: string; text: string; time: string }[]>(
  'frequi-workspace-messages',
  [],
);
const tabs = ['Conversation', 'Charts', 'Orders', 'Portfolio'];
const agents = computed(() =>
  bots.availableBotsSorted.filter((bot) =>
    bot.botName.toLowerCase().includes(search.value.toLowerCase()),
  ),
);
const active = computed(() =>
  space.value === 'commons' ? undefined : bots.botStores[space.value],
);
const title = computed(() => active.value?.uiBotName || 'agent-commons');
const visibleMessages = computed(() =>
  messages.value.filter((message) => message.space === space.value),
);
const currencies = computed(() => [
  ...new Set(bots.allBotStores.map((bot) => bot.stakeCurrency).filter(Boolean)),
]);
const totals = computed(() =>
  currencies.value.map((currency) => {
    const group = bots.allBotStores.filter((bot) => bot.stakeCurrency === currency);
    return {
      currency,
      balance: group.reduce(
        (sum, bot) => sum + (bot.balance.total_bot ?? bot.balance.total ?? 0),
        0,
      ),
      profit: group.reduce((sum, bot) => sum + (bot.profit?.profit_all_coin ?? 0), 0),
    };
  }),
);
const openCount = computed(() =>
  bots.allBotStores.reduce((sum, bot) => sum + bot.openTradeCount, 0),
);
function selectSpace(id: string) {
  space.value = id;
  tab.value = 'Conversation';
  if (id !== 'commons') bots.selectBot(id);
}
function send() {
  if (!draft.value.trim()) return;
  messages.value.push({
    id: crypto.randomUUID(),
    space: space.value,
    text: draft.value.trim(),
    time: new Date().toISOString(),
  });
  draft.value = '';
}
const money = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 2 });
watch(
  () => bots.availableBots,
  () => {
    if (space.value !== 'commons' && !bots.botStores[space.value]) selectSpace('commons');
  },
  { deep: true },
);
</script>

<template>
  <div class="workspace">
    <aside class="rail" aria-label="Workspace navigation">
      <RouterLink to="/" class="brand" aria-label="FreqUI home">f<span>.</span></RouterLink>
      <button
        class="rail-icon selected"
        aria-label="Agent workspace"
        @click="selectSpace('commons')"
      >
        <WorkspaceIcon name="i-mdi-forum-outline" />
      </button>
      <RouterLink to="/dashboard" class="rail-icon" aria-label="Dashboard"
        ><WorkspaceIcon name="i-mdi-view-dashboard-outline"
      /></RouterLink>
      <RouterLink to="/settings" class="rail-icon bottom" aria-label="Settings"
        ><WorkspaceIcon name="i-mdi-cog-outline"
      /></RouterLink>
      <span class="user-avatar">YO</span>
    </aside>
    <aside class="spaces">
      <div class="workspace-name">FreqUI <span class="workspace-pill">WORKSPACE</span></div>
      <div class="workspace-caption">Your strategies. One conversation.</div>
      <label class="search"
        ><WorkspaceIcon name="i-mdi-magnify" /><input
          v-model="search"
          placeholder="Find an agent…"
          aria-label="Find an agent"
        /><kbd>⌕</kbd></label
      >
      <div class="section-label">WORKSPACE</div>
      <button
        class="space-button"
        :class="{ current: space === 'commons' }"
        @click="selectSpace('commons')"
      >
        <span class="hash">#</span> agent-commons <span class="small-dot" />
      </button>
      <RouterLink to="/dashboard" class="space-button"
        ><WorkspaceIcon name="i-mdi-chart-box-outline" /> Overview</RouterLink
      >
      <div class="section-label agent-label">
        STRATEGY AGENTS <span>{{ bots.botCount }}</span
        ><RouterLink to="/login" aria-label="Connect agent">+</RouterLink>
      </div>
      <button
        v-for="bot in agents"
        :key="bot.botId"
        class="space-button agent-button"
        :class="{ current: space === bot.botId }"
        @click="selectSpace(bot.botId)"
      >
        <span class="agent-avatar">{{ bot.botName.slice(0, 2).toUpperCase() }}</span
        ><span class="agent-name"
          >{{ bot.botName
          }}<small>{{
            bots.botStores[bot.botId]?.botState.strategy || 'Strategy agent'
          }}</small></span
        ><span class="status-dot" :class="{ online: bots.botStores[bot.botId]?.isBotOnline }" />
      </button>
      <RouterLink
        v-for="account in pendingAccounts.filter((account) =>
          account.name.includes(search.toLowerCase()),
        )"
        :key="account.url"
        :to="{ path: '/login', query: { account: account.name, api: account.url } }"
        class="space-button agent-button"
        ><span class="agent-avatar">AN</span
        ><span class="agent-name">{{ account.name }}<small>Connect account</small></span
        ><span class="status-dot"
      /></RouterLink>
      <p v-if="!agents.length" class="sidebar-empty">
        {{
          bots.hasBots
            ? 'No matching agents.'
            : 'Connect a bot to give your first strategy its own space.'
        }}
      </p>
      <RouterLink to="/login" class="connect-button"
        ><WorkspaceIcon name="i-mdi-plus" /> Connect an agent</RouterLink
      >
      <div class="sidebar-footer">
        <span class="status-dot online" /> Personal workspace
        <small>Chat saved on this device</small>
      </div>
    </aside>
    <main class="workspace-main">
      <header class="channel-header">
        <div>
          <h1><span class="hash">#</span> {{ title }}</h1>
          <p>
            {{
              active
                ? 'A dedicated space for this strategy, its positions, and performance.'
                : 'The shared space for your trading agents.'
            }}
          </p>
        </div>
        <div class="header-actions">
          <button
            v-if="active"
            class="invite"
            @click="
              bots.removeBot(space);
              selectSpace('commons');
            "
          >
            Disconnect account
          </button>
          <span class="member-count"
            ><WorkspaceIcon name="i-mdi-account-multiple-outline" />
            {{ bots.botCount }} agents</span
          ><RouterLink to="/login" class="invite">+ Connect agent</RouterLink>
        </div>
      </header>
      <nav class="channel-tabs" aria-label="Agent views">
        <button
          v-for="item in active ? tabs : ['Conversation']"
          :key="item"
          :class="{ active: tab === item }"
          @click="tab = item"
        >
          <WorkspaceIcon
            :name="
              item === 'Conversation'
                ? 'i-mdi-message-text-outline'
                : item === 'Charts'
                  ? 'i-mdi-chart-line'
                  : item === 'Orders'
                    ? 'i-mdi-swap-horizontal'
                    : 'i-mdi-wallet-outline'
            "
          />{{ item }}</button
        ><span class="scope-label">{{
          active ? 'Individual strategy' : 'All agents · aggregate view'
        }}</span>
      </nav>
      <div v-if="tab === 'Conversation'" class="conversation">
        <section class="overview">
          <div class="overview-heading">
            <h2>{{ active ? 'Agent snapshot' : 'Workspace at a glance' }}</h2>
            <span>Connected bot data</span>
          </div>
          <div class="metrics">
            <article>
              <span>{{ active ? 'Strategy' : 'Connected agents' }}</span
              ><strong>{{ active ? active.botState.strategy || '—' : bots.botCount }}</strong
              ><small>{{
                active
                  ? active.isBotOnline
                    ? 'Online'
                    : 'Offline'
                  : `${bots.allBotStores.filter((bot) => bot.isBotOnline).length} online`
              }}</small>
            </article>
            <article>
              <span>Open positions</span
              ><strong>{{ active ? active.openTradeCount : openCount }}</strong
              ><small>Across {{ active ? 'this agent' : 'your strategies' }}</small>
            </article>
            <article>
              <span>Portfolio value</span
              ><strong v-if="active"
                >{{
                  active.balance.total_bot !== undefined || active.balance.total !== undefined
                    ? money(active.balance.total_bot ?? active.balance.total)
                    : '—'
                }}
                <em>{{ active.stakeCurrency }}</em></strong
              ><template v-else-if="totals.length"
                ><strong v-for="total in totals" :key="total.currency"
                  >{{ money(total.balance) }} <em>{{ total.currency }}</em></strong
                ></template
              ><strong v-else>—</strong><small>Reported bot balances</small>
            </article>
            <article>
              <span>Total P&amp;L</span
              ><strong
                v-if="active"
                :class="{ positive: (active.profit?.profit_all_coin ?? 0) > 0 }"
                >{{ active.profit ? money(active.profit.profit_all_coin) : '—' }}
                <em>{{ active.stakeCurrency }}</em></strong
              ><template v-else-if="totals.length"
                ><strong
                  v-for="total in totals"
                  :key="total.currency"
                  :class="{ positive: total.profit > 0 }"
                  >{{ money(total.profit) }} <em>{{ total.currency }}</em></strong
                ></template
              ><strong v-else>—</strong><small>Realized + unrealized</small>
            </article>
          </div>
        </section>
        <div class="day-divider"><span>Workspace conversation</span></div>
        <div class="welcome-message">
          <span class="assistant-avatar"><WorkspaceIcon name="i-mdi-creation-outline" /></span>
          <div>
            <div class="message-author">Workspace <span class="bot-badge">SYSTEM</span></div>
            <h2>
              {{ active ? `Welcome to ${title}’s space` : 'A meeting place for your strategies.' }}
            </h2>
            <p>
              {{
                active
                  ? 'Discuss this strategy here. Switch tabs to inspect its charts, open orders, and portfolio independently.'
                  : 'Keep the big picture in view. Each strategy has its own space, while agent-commons brings the whole portfolio together.'
              }}
            </p>
            <div class="welcome-note">
              <WorkspaceIcon name="i-mdi-information-outline" /> Messages are personal notes stored
              in this browser. Agents do not respond automatically.
            </div>
            <RouterLink v-if="!bots.hasBots" to="/login" class="getting-started"
              >Connect your first strategy <span>→</span></RouterLink
            >
          </div>
        </div>
        <div
          v-for="bot in bots.availableBotsSorted.filter(
            (bot) => space === 'commons' || bot.botId === space,
          )"
          :key="bot.botId"
          class="chat-message"
        >
          <span class="agent-avatar">{{ bot.botName.slice(0, 2).toUpperCase() }}</span>
          <div>
            <div class="message-author">
              {{ bot.botName }} <span class="bot-badge">ACCOUNT STATUS</span>
            </div>
            <p>
              {{ bots.botStores[bot.botId]?.isBotOnline ? 'Connected' : 'Offline' }} ·
              {{ bots.botStores[bot.botId]?.botState.strategy || 'Strategy not reported' }} ·
              {{ bots.botStores[bot.botId]?.openTradeCount ?? 0 }} open positions
            </p>
            <button
              v-if="space === 'commons'"
              class="getting-started"
              @click="selectSpace(bot.botId)"
            >
              Open strategy space →
            </button>
          </div>
        </div>
        <div v-for="message in visibleMessages" :key="message.id" class="chat-message">
          <span class="message-avatar">YO</span>
          <div>
            <div class="message-author">
              You
              <time>{{
                new Date(message.time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}</time>
            </div>
            <p>{{ message.text }}</p>
          </div>
        </div>
        <form class="composer" @submit.prevent="send">
          <label :for="'message-input'" class="sr-only">Message {{ title }}</label
          ><textarea
            id="message-input"
            v-model="draft"
            :placeholder="`Message #${title}`"
            rows="2"
            @keydown.enter.exact.prevent="send"
          />
          <div class="composer-toolbar">
            <span>Personal notes · Shift + Enter for a new line</span
            ><button type="submit" :disabled="!draft.trim()" aria-label="Send message">
              <WorkspaceIcon name="i-mdi-send" />
            </button>
          </div>
        </form>
      </div>
      <section v-else-if="active" :key="space + tab" class="agent-content">
        <ChartView v-if="tab === 'Charts'" /><MobileTradesList
          v-else-if="tab === 'Orders'"
        /><BotBalance v-else-if="tab === 'Portfolio'" />
      </section>
    </main>
  </div>
</template>

<style scoped>
.workspace {
  display: flex;
  height: 100%;
  min-height: 100dvh;
  text-align: left;
  background: #fff;
  color: #242530;
  font-family: Inter, system-ui, sans-serif;
}
.rail {
  width: 68px;
  flex-shrink: 0;
  background: #171b2a;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 22px 0 18px;
  gap: 20px;
  color: #b3b8ca;
}
.brand {
  font-size: 35px;
  font-weight: 800;
  color: white;
  line-height: 1;
  margin-bottom: 18px;
}
.brand span {
  color: #8fa2ff;
}
.rail-icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  font-size: 23px;
  border-radius: 11px;
}
.rail-icon:hover,
.rail-icon.selected {
  background: #343b54;
  color: #fff;
}
.bottom {
  margin-top: auto;
}
.user-avatar,
.message-avatar {
  background: #e2e6f6;
  color: #535e8c;
  display: grid;
  place-items: center;
  border-radius: 10px;
  width: 34px;
  height: 34px;
  font-weight: 700;
  font-size: 12px;
}
.spaces {
  width: 260px;
  flex-shrink: 0;
  background: #f5f6fa;
  border-right: 1px solid #e8e9ef;
  padding: 28px 16px;
  display: flex;
  flex-direction: column;
}
.workspace-name {
  font-size: 23px;
  font-weight: 750;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
}
.workspace-pill {
  font-size: 8px;
  letter-spacing: 1px;
  color: #777e90;
  border: 1px solid #dce0e9;
  padding: 4px 6px;
  border-radius: 4px;
}
.workspace-caption {
  font-size: 11px;
  color: #9196a6;
  padding: 8px;
}
.search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e0e2e9;
  border-radius: 7px;
  padding: 9px 10px;
  margin: 22px 6px;
  color: #989eae;
}
.search input {
  width: 100%;
  font-size: 12px;
  outline: none;
  min-width: 0;
  background: transparent;
}
.section-label {
  font-size: 10px;
  letter-spacing: 1.2px;
  font-weight: 650;
  color: #8c91a2;
  padding: 12px;
}
.space-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 7px;
  font-size: 13px;
  width: 100%;
  color: #616678;
  text-align: left;
}
.space-button:hover {
  background: #e8eaf3;
}
.space-button.current {
  background: #e5e9fa;
  color: #4f61b5;
  font-weight: 600;
}
.hash {
  color: #8d94aa;
  font-size: 22px;
  font-weight: 400;
}
.small-dot {
  margin-left: auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6b7dcb;
}
.agent-label {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 24px;
}
.agent-label a {
  margin-left: auto;
  font-size: 20px;
}
.agent-label span {
  font-size: 9px;
  background: #e8eaf1;
  padding: 2px 5px;
  border-radius: 4px;
}
.agent-avatar {
  display: grid;
  place-items: center;
  width: 31px;
  height: 31px;
  border: 1px solid #d7dcec;
  border-radius: 9px;
  background: white;
  color: #6879b8;
  font-size: 10px;
  flex-shrink: 0;
}
.agent-name {
  min-width: 0;
  overflow-wrap: anywhere;
}
.agent-name small {
  display: block;
  font-size: 10px;
  color: #9499a9;
  margin-top: 3px;
  font-weight: 400;
}
.status-dot {
  width: 6px;
  height: 6px;
  background: #b9becb;
  border-radius: 50%;
  flex-shrink: 0;
  margin-left: auto;
}
.status-dot.online {
  background: #43b68a;
}
.sidebar-empty {
  font-size: 12px;
  line-height: 1.8;
  padding: 12px;
  color: #9196a6;
}
.connect-button {
  font-size: 12px;
  color: #69758f;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 14px 12px;
}
.sidebar-footer {
  margin-top: auto;
  border-top: 1px solid #e3e5ed;
  padding: 20px 9px 0;
  font-size: 11px;
  color: #717a90;
}
.sidebar-footer .status-dot {
  display: inline-block;
  margin-right: 7px;
}
.sidebar-footer small {
  display: block;
  margin: 7px 13px;
  color: #a0a5b4;
  font-size: 10px;
}
.workspace-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.channel-header {
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  border-bottom: 1px solid #eceef3;
}
.channel-header h1 {
  font-size: 19px;
  font-weight: 700;
  display: flex;
  gap: 10px;
  align-items: center;
}
.channel-header p {
  font-size: 12px;
  color: #8b91a1;
  margin-top: 4px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 22px;
  font-size: 11px;
}
.member-count {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8a91a1;
  white-space: nowrap;
}
.invite {
  border: 1px solid #dfe3ec;
  border-radius: 6px;
  padding: 8px 12px;
  white-space: nowrap;
}
.channel-tabs {
  display: flex;
  align-items: center;
  padding: 0 32px;
  gap: 25px;
  border-bottom: 1px solid #eceef3;
}
.channel-tabs button {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 16px 0;
  font-size: 12px;
  color: #8b91a1;
  border-bottom: 2px solid transparent;
}
.channel-tabs button.active {
  color: #5267b5;
  border-color: #637acb;
}
.scope-label {
  margin-left: auto;
  font-size: 10px;
  color: #959baa;
}
.conversation {
  padding: 28px 32px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.overview-heading {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
.overview-heading h2 {
  font-size: 13px;
  font-weight: 650;
}
.overview-heading span {
  font-size: 10px;
  color: #9399a7;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border: 1px solid #e4e7ef;
  border-radius: 10px;
  overflow: hidden;
}
.metrics article {
  padding: 20px;
  border-right: 1px solid #e8ebf1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.metrics article:last-child {
  border: 0;
}
.metrics article > span {
  font-size: 11px;
  color: #81899b;
}
.metrics strong {
  font-size: 26px;
  letter-spacing: -0.8px;
  font-weight: 650;
  overflow-wrap: anywhere;
}
.metrics em {
  font-size: 11px;
  font-style: normal;
  color: #9da4b2;
  letter-spacing: 0;
}
.metrics small {
  font-size: 10px;
  color: #9ca2b0;
}
.positive {
  color: #289c79;
}
.day-divider {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 30px 0;
  color: #949bab;
  font-size: 10px;
}
.day-divider:before,
.day-divider:after {
  content: '';
  height: 1px;
  background: #eceef3;
  flex: 1;
}
.welcome-message,
.chat-message {
  display: flex;
  gap: 14px;
  margin-bottom: 24px;
}
.assistant-avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 11px;
  background: #edf0fc;
  color: #687fcb;
  font-size: 22px;
}
.message-author {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 12px;
  font-weight: 650;
}
.bot-badge {
  font-size: 8px;
  letter-spacing: 0.6px;
  background: #eef0f6;
  padding: 2px 5px;
  color: #8f96a8;
  border-radius: 3px;
}
.welcome-message h2 {
  font-size: 20px;
  font-weight: 650;
  margin: 14px 0 8px;
  letter-spacing: -0.3px;
}
.welcome-message p {
  font-size: 13px;
  color: #858c9d;
  line-height: 1.9;
  max-width: 600px;
}
.welcome-note {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  color: #8c94a7;
  margin-top: 18px;
  line-height: 1.6;
}
.getting-started {
  display: inline-flex;
  gap: 35px;
  color: #6378bb;
  font-size: 12px;
  border: 1px solid #dfe5f3;
  padding: 12px 16px;
  border-radius: 7px;
  margin-top: 20px;
}
.chat-message p {
  font-size: 13px;
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin-top: 5px;
}
.message-author time {
  font-size: 10px;
  font-weight: 400;
  color: #9ba1b0;
}
.composer {
  margin-top: auto;
  border: 1px solid #dce1eb;
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 3px 12px #202b4910;
}
.composer textarea {
  display: block;
  width: 100%;
  resize: vertical;
  background: transparent;
  outline: none;
  font-size: 13px;
  min-height: 55px;
}
.composer textarea::placeholder {
  color: #a0a6b5;
}
.composer-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: #a0a6b4;
}
.composer-toolbar button {
  background: #657bcb;
  color: white;
  border-radius: 6px;
  display: grid;
  place-items: center;
  width: 32px;
  height: 28px;
  font-size: 17px;
}
.composer-toolbar button:disabled {
  opacity: 0.4;
}
.agent-content {
  padding: 24px;
  flex: 1;
  overflow: auto;
}
@media (min-width: 1500px) {
  .conversation {
    padding: 40px 60px;
  }
  .channel-header,
  .channel-tabs {
    padding-left: 60px;
    padding-right: 60px;
  }
}
@media (max-width: 1000px) {
  .spaces {
    width: 220px;
  }
  .header-actions .member-count {
    display: none;
  }
  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .metrics article {
    border-bottom: 1px solid #e8ebf1;
  }
  .scope-label {
    display: none;
  }
}
@media (max-width: 680px) {
  .rail {
    width: 48px;
  }
  .spaces {
    width: 150px;
    padding: 20px 7px;
  }
  .workspace-name {
    font-size: 18px;
  }
  .workspace-pill,
  .workspace-caption,
  .search kbd {
    display: none;
  }
  .channel-header {
    padding: 18px 14px;
  }
  .channel-header p,
  .header-actions {
    display: none;
  }
  .channel-header h1 {
    font-size: 15px;
  }
  .channel-tabs {
    padding: 0 14px;
    gap: 13px;
    flex-wrap: wrap;
  }
  .channel-tabs button {
    font-size: 10px;
  }
  .conversation {
    padding: 18px 14px;
  }
  .metrics article {
    padding: 12px;
  }
  .metrics strong {
    font-size: 19px;
  }
  .overview-heading span {
    display: none;
  }
  .welcome-message h2 {
    font-size: 17px;
  }
  .composer-toolbar span {
    font-size: 8px;
  }
}
</style>
