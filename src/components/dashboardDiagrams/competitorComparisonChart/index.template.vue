<template>
  <div>
    <div class="item-label">
      <div class="general-label">
        <div>Active Ads</div>
        <div
          class="item-parameter"
          activeAds
          notranslate>
          {{ formatDBNumbers(competitorComparison.immoSparrowActiveCount) }} <small style="font-weight: 400;">/ {{ formatDBNumbers(competitorComparison.comparisActiveCount) }}</small>
        </div>
      </div>
      <div
        v-if="diagram"
        class="btn-block-wrap">
        <div
          class="btn-group"
          role="group">
          <button
            v-tooltip.top="{ content: 'Switzerland', delay: { show: 700, hide: 100 }}"
            :class="{'active': diagram.options.stats === 'unrestricted'}"
            type="button"
            class="btn btn-sm btn-default"
            @click="updateStats('unrestricted')">
            <i class="si si-globe"/>
          </button>
          <button
            v-tooltip.top="{ content: 'My Area', delay: { show: 700, hide: 100 }}"
            :class="{'active': diagram.options.stats === 'workspace'}"
            type="button"
            class="btn btn-sm btn-default"
            @click="updateStats('workspace')">
            <i class="fa fa-television"/>
          </button>
        </div>
      </div>
    </div>
    <div class="item-graphic">
      <canvas
        id="competitorComparisonChart"
        height="140px"/>
    </div>
    <div class="item-legend">
      <div class="legend-label">
        <div class="general-label">
          <span
            class="color-dot"
            style="border-color: #75B0EB; background-color: #A2C6E9;"/>
          <span>Immosparrow Only</span>
        </div>
        <div
          notranslate
          immoSparrowActiveCount
          class="second-label">{{ formatDBNumbers(competitorComparison.immoSparrowActiveCount) }}</div>
      </div>
      <div class="legend-label">
        <div class="general-label">
          <span
            class="color-dot"
            style="border-color: #EA8FE3; background-color: #EAB5E6;"/>
          <span>MetaSearches</span>
        </div>
        <div
          notranslate
          comparisonActiveCount
          class="second-label">{{ formatDBNumbers(competitorComparison.comparisActiveCount) }}</div>
      </div>
    </div>
  </div>
</template>
