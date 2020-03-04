<template>
  <div>
    <div class="item-label">
      <div class="general-label">
        <div>GeoLocalized Ads </div>
        <div
          geoLocalizedCount
          notranslate
          class="item-parameter">
          {{ formatDBNumbers(dataset[1]) }}
        </div>
      </div>
      <div class="second-label">
        <span class="margin-r-10">Last 7 Days</span>
        <span
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
        </span>
      </div>
    </div>
    <div class="item-graphic">
      <canvas
        id="geoLocalChart"
        height="140px"/>
    </div>
    <div class="item-legend">
      <div class="legend-label">
        <div class="general-label">
          <span
            class="color-dot"
            style="border-color: #FAD02C; background-color: #FAD02C;"/>
          <span>Exact</span>
        </div>
        <div
          exactCount
          notranslate
          class="second-label">{{ formatDBNumbers(dataset[0]) }}</div>
      </div>
      <div class="legend-label">
        <div class="general-label">
          <span
            class="color-dot"
            style="border-color: #00A081; background-color: #00A081;"/>
          <span>GeoLocalized</span>
        </div>
        <div
          geoLocCount
          notranslate
          class="second-label">{{ formatDBNumbers(dataset[1]) }}</div>
      </div>
      <div class="legend-label">
        <div class="general-label">
          <span
            class="color-dot"
            style="border-color: #B3AA99; background-color: #B3AA99;"/>
          <span>Inaccurate</span>
        </div>
        <div
          nonGeoLocalizedCount
          notranslate
          class="second-label">{{ formatDBNumbers(dataset[2]) }}</div>
      </div>
      <div class="legend-label">
        <div class="general-label">
          <span
            class="color-dot"
            style="border-color: rgba(0,0,0,0); background-color: rgba(0,0,0,0);"/>
          <span>Total</span>
        </div>
        <div
          nonGeoLocalizedCount
          notranslate
          class="second-label">{{ formatDBNumbers(totalCount) }}</div>
      </div>
    </div>
  </div>
</template>
