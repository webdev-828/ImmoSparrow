<template>
  <div>
    <div class="item-label">
      <div class="general-label">
        <div>New Ads</div>
        <div class="item-parameter"><var
          newAdsPerDay
          notranslate>{{ formatDBNumbers(newAdsPerDay) }}</var> <small style="font-size: 13px;">today</small></div>
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
        id="adsPerDayChart"
        height="150px"/>
    </div>
    <div class="item-legend">
      <div class="legend-label">
        <div class="general-label">
          <span
            class="color-dot"
            style="border-color: #75B0EB; background-color: #A2C6E9;"/>
          <span>Buy</span>
        </div>
      </div>
      <div class="legend-label">
        <div class="general-label">
          <span
            class="color-dot"
            style="border-color: #ABE37D; background-color: #C7E6AC;"/>
          <span>Rent</span>
        </div>
      </div>
    </div>
  </div>
</template>
