<script setup lang="ts">
import { FtWsMessageTypes } from '@/types/wsMessageTypes';

const settingsStore = useSettingsStore();
const colorStore = useColorStore();
const layoutStore = useLayoutStore();
const { t, locale } = useUiText();

const timezoneOptions = ['UTC', Intl.DateTimeFormat().resolvedOptions().timeZone];
const languageOptions = computed(() => [
  { value: 'en', text: t('english') },
  { value: 'zh-TW', text: t('traditionalChinese') },
]);
const openTradesOptions = computed(() => [
  { value: OpenTradeVizOptions.showPill, text: t('showPillInIcon') },
  { value: OpenTradeVizOptions.asTitle, text: t('showInTitle') },
  { value: OpenTradeVizOptions.noOpenTrades, text: t('dontShowOpenTradesInHeader') },
]);
const colorPreferenceOptions = computed(() => [
  { value: ColorPreferences.GREEN_UP, text: t('greenUpRedDown') },
  { value: ColorPreferences.RED_UP, text: t('greenDownRedUp') },
]);

const resetDynamicLayout = () => {
  layoutStore.resetTradingLayout();
  layoutStore.resetDashboardLayout();
  showAlert(t('resetLayout'));
};
</script>

<template>
  <Card class="mx-auto mt-3 p-4 max-w-4xl">
    <template #title>{{ t('settings') }}</template>
    <template #content>
      <div class="flex flex-col gap-4 text-start dark:text-surface-300">
        <p class="text-left">{{ t('version') }}: {{ settingsStore.uiVersion }}</p>

        <div class="border border-surface-400 rounded-sm p-4 space-y-4">
          <h4 class="text-xl font-semibold">{{ t('uiSettings') }}</h4>

          <div class="space-y-1">
            <label class="block text-sm">{{ t('language') }}</label>
            <Select
              v-model="locale"
              :options="languageOptions"
              option-label="text"
              option-value="value"
              size="small"
              class="w-full"
            />
            <small class="text-surface-600 dark:text-surface-400"
              >{{ t('language') }}</small
            >
          </div>

          <BaseCheckbox v-model="layoutStore.layoutLocked" class="space-y-1">
            {{ t('lockDynamicLayout') }}
            <template #hint>
              {{ t('lockDynamicLayout') }}, so they cannot move anymore. Can also be set from the
              navbar at the top.
            </template>
          </BaseCheckbox>

          <div class="flex flex-row items-center gap-2 space-y-2">
            <Button severity="secondary" size="small" class="mb-0" @click="resetDynamicLayout"
              >{{ t('resetLayout') }}</Button
            >
            <small class="block text-surface-600 dark:text-surface-400"
              >{{ t('resetLayout') }}.</small
            >
          </div>

          <Divider />

          <div class="space-y-1">
            <label class="block text-sm">{{ t('showOpenTradesInHeader') }}</label>
            <Select
              v-model="settingsStore.openTradesInTitle"
              :options="openTradesOptions"
              option-label="text"
              option-value="value"
              size="small"
              class="w-full"
            />
            <small class="text-surface-600 dark:text-surface-400"
              >{{ t('showOpenTradesInHeader') }}</small
            >
          </div>

          <div class="space-y-1">
            <label class="block text-sm">{{ t('utcTimezone') }}</label>
            <Select
              v-model="settingsStore.timezone"
              :options="timezoneOptions"
              class="w-full"
              size="small"
            />
            <small class="text-surface-600 dark:text-surface-400"
              >{{ t('utcTimezone') }}</small
            >
          </div>

          <BaseCheckbox v-model="settingsStore.backgroundSync" class="space-y-1">
            {{ t('backgroundSync') }}
            <template #hint> Keep background sync running while other bots are selected. </template>
          </BaseCheckbox>

          <BaseCheckbox v-model="settingsStore.confirmDialog" class="space-y-1">
            {{ t('confirmDialogForTradeExits') }}
            <template #hint
              >Use confirmation dialogs when force-exiting a trade.<br />
              This will also show <i-mdi-run-fast class="text-yellow-300 inline" />
              <i-mdi-alert class="text-yellow-300 inline" />
              in the title bar.
            </template>
          </BaseCheckbox>

          <BaseCheckbox v-model="settingsStore.multiPaneButtonsShowText" class="space-y-1">
            {{ t('showTextOnMultiPaneButtons') }}
            <template #hint
              >Show text on multi pane buttons. If disabled, only shows images.</template
            >
          </BaseCheckbox>
        </div>

        <div class="border border-surface-400 rounded-sm p-4 space-y-4">
          <h4 class="text-lg font-semibold">{{ t('chartSettings') }}</h4>

          <div class="space-y-1">
            <label class="block text-sm">{{ t('chartScaleSide') }}</label>
            <div class="flex gap-4">
              <div class="flex items-center">
                <RadioButton v-model="settingsStore.chartLabelSide" value="left" size="small" />
                <label class="ml-2">{{ t('left') }}</label>
              </div>
              <div class="flex items-center">
                <RadioButton v-model="settingsStore.chartLabelSide" value="right" size="small" />
                <label class="ml-2">{{ t('right') }}</label>
              </div>
            </div>
            <small class="text-surface-600 dark:text-surface-400">
              Should the scale be displayed on the right or left?
            </small>
          </div>

          <BaseCheckbox v-model="settingsStore.useHeikinAshiCandles" class="space-y-1">
            {{ t('useHeikinAshiCandles') }}
            <template #hint>{{ t('useHeikinAshiCandles') }}</template>
          </BaseCheckbox>

          <BaseCheckbox v-model="settingsStore.useReducedPairCalls" class="space-y-1">
            {{ t('onlyRequestNecessaryColumns') }}
            <template #hint
              >Can reduce the transfer size for large dataframes. May require additional calls if
              the plot config changes.</template
            >
          </BaseCheckbox>

          <div>
            <p>{{ t('defaultCandlesToDisplay') }} (defaults to 250)</p>
            <div class="flex flex-row gap-5 w-full items-center">
              <Slider
                v-model="settingsStore.chartDefaultCandleCount"
                class="flex-1"
                :step="50"
                :min="100"
                :max="2000"
              />
              <InputNumber
                v-model="settingsStore.chartDefaultCandleCount"
                :step="50"
                :min="100"
                :max="2000"
                size="small"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block">{{ t('candleColorPreference') }}</label>
            <div class="flex flex-row gap-5 items-center">
              <div
                v-for="option in colorPreferenceOptions"
                :key="option.value"
                class="flex items-center"
              >
                <RadioButton
                  v-model="colorStore.colorPreference"
                  :value="option.value"
                  :input-id="`input-id${option.value}`"
                  size="small"
                  @change="colorStore.updateProfitLossColor"
                />
                <label :for="`input-id${option.value}`" class="ml-2 flex items-center">
                  <span class="mr-2">{{ option.text }}</span>
                  <i-mdi-arrow-up-thin
                    :color="
                      option.value === ColorPreferences.GREEN_UP
                        ? colorStore.colorProfit
                        : colorStore.colorLoss
                    "
                    class="-ml-2"
                  />
                  <i-mdi-arrow-down-thin
                    :color="
                      option.value === ColorPreferences.GREEN_UP
                        ? colorStore.colorLoss
                        : colorStore.colorProfit
                    "
                    class="-ml-2"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="border rounded-sm p-4 space-y-4">
          <h4 class="text-lg font-semibold">{{ t('notificationSettings') }}</h4>
          <div class="space-y-2">
            <BaseCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.entryFill]">
              {{ t('entryNotifications') }}
            </BaseCheckbox>
            <BaseCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.exitFill]">
              {{ t('exitNotifications') }}
            </BaseCheckbox>
            <BaseCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.entryCancel]">
              {{ t('entryCancelNotifications') }}
            </BaseCheckbox>
            <BaseCheckbox v-model="settingsStore.notifications[FtWsMessageTypes.exitCancel]">
              {{ t('exitCancelNotifications') }}
            </BaseCheckbox>
          </div>
        </div>

        <div class="border rounded-sm p-4 space-y-4">
          <h4 class="text-lg font-semibold">{{ t('backtestingSettings') }}</h4>
          <div>
            <label for="backtestMetrics" class="block text-sm">{{ t('backtestingMetrics') }}</label>
            <MultiSelect
              id="backtestMetrics"
              v-model="settingsStore.backtestAdditionalMetrics"
              :options="availableBacktestMetrics"
              option-label="header"
              option-value="field"
              class="w-full"
              size="small"
              display="chip"
            />
            <small class="text-surface-600 dark:text-surface-400"
              >{{ t('selectMetricsByPairTag') }}</small
            >
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
