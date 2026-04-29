<!-- eslint-disable vue/block-order, vue/block-lang -->
<template>
  <div class="tqi-regime-metrics">
    <div class="metrics-container">
      <!-- TQI Breakdown Section -->
      <div class="section tqi-section">
        <h3>Trend Quality Index (TQI) — Real-time Per-Pair</h3>
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
        <h3>Per-Regime Performance Grid (9 Cells: ER × Vol)</h3>
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
                {{ metric.recommendation === 'high_edge' ? '🟢 High Edge' : metric.recommendation === 'low_edge' ? '🔴 Low Edge' : '🟡 Uncertain' }}
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

let refreshInterval = null

const fetchTQIBreakdown = async () => {
  tqiLoading.value = true
  tqiError.value = null
  try {
    const response = await fetch('/api/v1/metrics/tqi-breakdown')
    const data = await response.json()
    if (data.error) {
      tqiError.value = data.error
    } else {
      tqiBreakdown.value = data.tqi_breakdown || {}
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
    const response = await fetch('/api/v1/metrics/regime-edge')
    const data = await response.json()
    if (data.error) {
      regimeError.value = data.error
    } else {
      regimeMetrics.value = data.regime_metrics || []
      regimeSummary.value = data.summary || {}
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
  fetchTQIBreakdown()
  fetchRegimeMetrics()
  refreshInterval = setInterval(() => {
    fetchTQIBreakdown()
    fetchRegimeMetrics()
  }, 30000) // Refresh every 30 seconds
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
  padding: 1rem;
  background: #1e1e1e;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
  border-radius: 4px;
}

.metrics-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 1.5rem;
}

.section h3 {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  border-bottom: 1px solid #555;
  padding-bottom: 0.75rem;
}

/* TQI Section */
.tqi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.tqi-card {
  background: #333;
  border-radius: 4px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pair-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #64B5F6;
}

.tqi-main {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00E676;
}

.tqi-components {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  font-size: 0.8rem;
}

.component {
  display: flex;
  justify-content: space-between;
  background: #1e1e1e;
  padding: 0.35rem 0.5rem;
  border-radius: 2px;
}

.component .label {
  color: #999;
}

.component .value {
  color: #FFC107;
  font-weight: 600;
}

.regime-cell {
  font-size: 0.8rem;
  color: #999;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #444;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat .label {
  color: #999;
  font-size: 0.9rem;
}

.stat .value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #00E676;
}

.regime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}

.regime-cell-card {
  background: #1e1e1e;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.regime-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64B5F6;
}

.cell-idx {
  font-size: 0.7rem;
  color: #999;
}

.metrics {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
}

.metric-row .label {
  color: #999;
}

.metric-row .value {
  font-weight: 600;
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
  border-radius: 4px;
}

.loading {
  background: #333;
  color: #FFC107;
}

.error {
  background: rgba(255, 82, 82, 0.2);
  color: #FF5252;
}
</style>
