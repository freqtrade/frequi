<!-- eslint-disable vue/block-order, vue/block-lang -->
<template>
  <div class="tqi-regime-metrics">
    <div class="page-header">
      <div class="page-title-group">
        <p class="eyebrow">Live Metrics</p>
        <h2>Trend Quality</h2>
        <p class="page-subtitle">
          Per-pair trend quality and regime edge tracking from the live backend.
        </p>
      </div>

      <div class="page-actions">
        <div class="status-strip" aria-label="Data source status">
          <span class="status-badge" :class="tqiError ? 'status-error' : 'status-live'">
            TQI {{ tqiError ? 'ERROR' : 'LIVE' }}
          </span>
          <span class="status-badge" :class="regimeError ? 'status-error' : 'status-live'">
            Regime {{ regimeError ? 'ERROR' : 'LIVE' }}
          </span>
        </div>
        <button class="refresh-button" type="button" :disabled="isRefreshing" @click="refreshAll">
          {{ isRefreshing ? 'Refreshing' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div class="page-status">
      <span>Backend <strong>localhost:5001</strong></span>
      <span v-if="lastUpdated">Updated {{ new Date(lastUpdated).toLocaleTimeString() }}</span>
    </div>

    <div class="metrics-container">
      <!-- TQI Breakdown Section -->
      <div class="section tqi-section">
        <div class="section-header">
          <div>
            <h3>Trend Quality Index</h3>
            <p>Real-time per-pair trend quality, volume, structure, and momentum.</p>
          </div>
        </div>
        <div v-if="tqiLoading" class="loading">Computing TQI...</div>
        <div v-else-if="tqiError" class="error">{{ tqiError }}</div>
        <div v-else class="tqi-grid">
          <div
            v-for="(data, pair) in tqiBreakdown"
            :key="pair"
            class="tqi-card"
            :style="{ borderLeft: `4px solid ${getTQIColor(data.tqi)}` }"
          >
            <div class="pair-label">{{ pair }}</div>
            <div class="tqi-main">{{ (data.tqi * 100).toFixed(1) }}%</div>
            <div class="tqi-components">
              <div class="component">
                <span class="label">ER:</span>
                <span class="value">{{ (data.tqi_er * 100).toFixed(0) }}%</span>
              </div>
              <div class="component">
                <span class="label">Vol:</span>
                <span class="value">{{ (data.vol_ratio * 100).toFixed(0) }}%</span>
              </div>
              <div class="component">
                <span class="label">Struct:</span>
                <span class="value">{{ (data.tqi_structure * 100).toFixed(0) }}%</span>
              </div>
              <div class="component">
                <span class="label">Mom:</span>
                <span class="value">{{ (data.tqi_momentum * 100).toFixed(0) }}%</span>
              </div>
            </div>
            <div class="regime-cell">
              Cell: {{ data.regime_cell }}
              <span class="badge" :style="{ background: getRegimeBadgeColor(data.er_bin, data.vol_bin) }">
                {{ getRegimeLabel(data.er_bin, data.vol_bin) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Regime Edge Tracking Section -->
      <div class="section regime-section">
        <div class="section-header">
          <div>
            <h3>Regime Performance Grid</h3>
            <p>Nine-cell ER and volatility grid for edge tracking.</p>
          </div>
        </div>
        <div v-if="regimeLoading" class="loading">Loading regime metrics...</div>
        <div v-else-if="regimeError" class="error">{{ regimeError }}</div>
        <div v-else class="regime-container">
          <div class="regime-summary">
            <div class="stat">
              <span class="label">Total Trades:</span>
              <span class="value">{{ regimeSummary.total_trades_tracked }}</span>
            </div>
            <div class="stat">
              <span class="label">Profitable Regimes:</span>
              <span class="value">{{ regimeSummary.profitable_regimes }}/9</span>
            </div>
            <div class="stat">
              <span class="label">Avg Win Rate:</span>
              <span class="value">{{ (regimeSummary.avg_win_rate * 100).toFixed(1) }}%</span>
            </div>
          </div>

          <div class="regime-grid">
            <div v-for="metric in regimeMetrics" :key="metric.cell_idx" class="regime-cell-card">
              <div class="regime-label">{{ metric.regime_label }}</div>
              <div class="cell-idx">Cell {{ metric.cell_idx }}</div>

              <div class="metrics">
                <div class="metric-row">
                  <span class="label">Count:</span>
                  <span class="value">{{ metric.trade_count }}</span>
                </div>
                <div class="metric-row">
                  <span class="label">Win Rate:</span>
                  <span class="value" :style="winRateStyle(metric.win_rate)">
                    {{ (metric.win_rate * 100).toFixed(1) }}%
                  </span>
                </div>
                <div class="metric-row">
                  <span class="label">Avg R:</span>
                  <span class="value" :style="avgRStyle(metric.ewma_r)">
                    {{ metric.ewma_r > 0 ? '+' : '' }}{{ metric.ewma_r.toFixed(2) }}R
                  </span>
                </div>
              </div>

              <div class="recommendation-badge" :class="`rec-${metric.recommendation}`">
                {{ metric.recommendation === 'high_edge' ? 'High Edge' : metric.recommendation === 'low_edge' ? 'Low Edge' : 'Uncertain' }}
              </div>

              <div v-if="!metric.confidence" class="insufficient-data">
                Insufficient data
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable-next-line vue/block-order, vue/block-lang -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const API_BASE = 'http://localhost:5001'

const tqiLoading = ref(false)
const tqiError = ref(null)
const tqiBreakdown = ref({})

const regimeLoading = ref(false)
const regimeError = ref(null)
const regimeMetrics = ref([])
const regimeSummary = ref({
  total_trades_tracked: 0,
  profitable_regimes: 0,
  avg_win_rate: 0,
})
const lastUpdated = ref(null)
const isRefreshing = ref(false)

let refreshInterval = null

const fetchTQIBreakdown = async () => {
  tqiLoading.value = true
  tqiError.value = null
  try {
    const response = await fetch(`${API_BASE}/api/v1/metrics/tqi-breakdown`)
    if (!response.ok) throw new Error(`TQI API returned ${response.status}`)
    const data = await response.json()
    if (data.error) {
      tqiError.value = data.error
    } else {
      tqiBreakdown.value = data.tqi_breakdown || {}
      lastUpdated.value = data.updated_at || new Date().toISOString()
    }
  } catch (e) {
    tqiError.value = e.message
  } finally {
    tqiLoading.value = false
  }
}

const fetchRegimeMetrics = async () => {
  regimeLoading.value = true
  regimeError.value = null
  try {
    const response = await fetch(`${API_BASE}/api/v1/metrics/regime-edge`)
    if (!response.ok) throw new Error(`Regime edge API returned ${response.status}`)
    const data = await response.json()
    if (data.error) {
      regimeError.value = data.error
    } else {
      regimeMetrics.value = data.regime_metrics || []
      regimeSummary.value = data.summary || {}
      lastUpdated.value = data.updated_at || new Date().toISOString()
    }
  } catch (e) {
    regimeError.value = e.message
  } finally {
    regimeLoading.value = false
  }
}

const getTQIColor = (tqi) => {
  if (tqi > 0.65) return '#00E676' // High quality: bright green
  if (tqi > 0.50) return '#FFC107' // Good quality: amber
  if (tqi > 0.35) return '#FF9800' // Moderate quality: orange
  return '#FF5252' // Low quality: red
}

const getRegimeBadgeColor = (erBin, _volBin) => {
  if (erBin === 2) return '#4CAF50' // Trending
  if (erBin === 1) return '#FF9800' // Mixed
  return '#F44336' // Choppy
}

const getRegimeLabel = (erBin, volBin) => {
  const erLabels = ['Choppy', 'Mixed', 'Trending']
  const volLabels = ['Low', 'Normal', 'High']
  return `${erLabels[erBin]} / ${volLabels[volBin]}`
}

const getWRColor = (wr) => {
  if (wr > 0.55) return '#00E676'
  if (wr > 0.50) return '#FFC107'
  if (wr > 0.40) return '#FF9800'
  return '#FF5252'
}

const winRateStyle = (wr) => ({ color: getWRColor(wr) })

const avgRStyle = (avgR) => ({ color: avgR > 0 ? '#00E676' : '#FF5252' })

const startRefresh = () => {
  refreshAll()
  refreshInterval = setInterval(() => {
    refreshAll()
  }, 30000) // Refresh every 30 seconds
}

const refreshAll = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await Promise.all([fetchTQIBreakdown(), fetchRegimeMetrics()])
  } finally {
    isRefreshing.value = false
  }
}

onMounted(() => {
  startRefresh()
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<style scoped>
.tqi-regime-metrics {
  width: 100%;
  min-width: 0;
  padding: clamp(0.75rem, 2vw, 1.25rem);
  background: #080b10;
  color: #e5e7eb;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  overflow-x: hidden;
}

.page-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  padding: 0.9rem 1rem;
  background: linear-gradient(180deg, rgba(31, 41, 55, 0.92), rgba(15, 23, 42, 0.9));
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 8px;
}

.page-title-group {
  min-width: 0;
}

.eyebrow {
  margin: 0 0 0.2rem;
  color: #38bdf8;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.page-header h2 {
  margin: 0;
  color: #f8fafc;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 750;
  line-height: 1.15;
}

.page-subtitle {
  max-width: 48rem;
  margin: 0.35rem 0 0;
  color: #aeb8c8;
  font-size: 0.86rem;
  line-height: 1.45;
}

.page-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.55rem;
  min-width: 0;
}

.status-strip {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.4rem;
}

.refresh-button {
  min-height: 2rem;
  border: 1px solid rgba(56, 189, 248, 0.45);
  border-radius: 6px;
  background: rgba(14, 165, 233, 0.12);
  color: #dff6ff;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.38rem 0.75rem;
  transition: background 120ms ease, border-color 120ms ease;
}

.refresh-button:hover:not(:disabled) {
  background: rgba(14, 165, 233, 0.22);
  border-color: rgba(125, 211, 252, 0.7);
}

.refresh-button:disabled {
  cursor: progress;
  opacity: 0.65;
}

.metrics-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.section {
  min-width: 0;
  background: #10151f;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  padding: clamp(0.85rem, 2vw, 1.1rem);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
}

.page-status {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.8rem;
  color: #95a1b3;
  font-size: 0.78rem;
  margin: 0.65rem 0 1rem;
  min-width: 0;
}

.page-status span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  margin: 0 0 1rem 0;
  padding-bottom: 0.8rem;
}

.section-header > div {
  min-width: 0;
}

.section h3 {
  margin: 0;
  font-size: clamp(0.98rem, 2vw, 1.1rem);
  font-weight: 750;
  color: #f8fafc;
  line-height: 1.2;
}

.section-header p {
  margin: 0.25rem 0 0;
  color: #98a4b5;
  font-size: 0.78rem;
  line-height: 1.35;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  min-height: 1.55rem;
  white-space: nowrap;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.2rem 0.55rem;
}

.status-live {
  background: rgba(34, 197, 94, 0.18);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.35);
}

.status-error {
  background: rgba(239, 68, 68, 0.18);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.35);
}

/* TQI Section */
.tqi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 0.75rem;
  min-width: 0;
}

.tqi-card {
  min-width: 0;
  background: #161d2a;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 8px;
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.pair-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #93c5fd;
  overflow-wrap: anywhere;
}

.tqi-main {
  font-size: 1.45rem;
  font-weight: bold;
  color: #00E676;
  line-height: 1;
}

.tqi-components {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
  font-size: 0.8rem;
  min-width: 0;
}

.component {
  display: flex;
  justify-content: space-between;
  gap: 0.35rem;
  min-width: 0;
  background: #0c111a;
  padding: 0.35rem 0.5rem;
  border-radius: 5px;
}

.component .label {
  color: #999;
}

.component .value {
  color: #FFC107;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.regime-cell {
  font-size: 0.8rem;
  color: #a3adbc;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.badge {
  color: #fff;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Regime Section */
.regime-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.stat {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  background: #0c111a;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 7px;
  padding: 0.65rem 0.75rem;
}

.stat .label {
  color: #98a4b5;
  font-size: 0.78rem;
  overflow-wrap: anywhere;
}

.stat .value {
  font-size: 1rem;
  font-weight: bold;
  color: #00E676;
  overflow-wrap: anywhere;
}

.regime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 170px), 1fr));
  gap: 0.75rem;
  min-width: 0;
}

.regime-cell-card {
  min-width: 0;
  background: #0c111a;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 7px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.regime-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #93c5fd;
  overflow-wrap: anywhere;
}

.cell-idx {
  font-size: 0.7rem;
  color: #98a4b5;
}

.metrics {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.metric-row {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
  font-size: 0.75rem;
  min-width: 0;
}

.metric-row .label {
  color: #98a4b5;
}

.metric-row .value {
  font-weight: 600;
  text-align: right;
  overflow-wrap: anywhere;
}

.recommendation-badge {
  margin-top: 0.5rem;
  padding: 0.3rem 0.4rem;
  border-radius: 3px;
  font-size: 0.7rem;
  text-align: center;
  font-weight: 600;
}

.rec-high_edge {
  background: rgba(0, 230, 118, 0.2);
  color: #00E676;
}

.rec-low_edge {
  background: rgba(255, 82, 82, 0.2);
  color: #FF5252;
}

.rec-uncertain {
  background: rgba(255, 193, 7, 0.2);
  color: #FFC107;
}

.insufficient-data {
  font-size: 0.65rem;
  color: #666;
  text-align: center;
}

.loading,
.error {
  padding: 1rem;
  text-align: center;
  border-radius: 7px;
  overflow-wrap: anywhere;
}

.loading {
  background: #333;
  color: #FFC107;
}

.error {
  background: rgba(255, 82, 82, 0.2);
  color: #FF5252;
}

@media (max-width: 760px) {
  .page-header {
    grid-template-columns: 1fr;
  }

  .page-actions,
  .status-strip {
    justify-content: flex-start;
  }

  .refresh-button {
    width: 100%;
  }

  .regime-summary {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .tqi-regime-metrics {
    padding: 0.65rem;
  }

  .page-header,
  .section {
    border-radius: 6px;
  }

  .section-header {
    gap: 0.5rem;
  }

  .tqi-components {
    grid-template-columns: 1fr;
  }
}
</style>
