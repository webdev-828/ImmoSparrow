<template>
  <div>
    <div class="item-label">
      <div class="general-label">
        <div>Vendor Classifications</div>
        <div class="item-parameter"><var
          totalAds
          notranslate>{{ formatDBNumbers(dataset[0] + dataset[1] + dataset[2] + dataset[3] + dataset[4]) }}</var></div>
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
        id="totalAdsChart"
        height="140px"/>
    </div>
    <div class="item-legend">
      <div class="legend-label">
        <div class="general-label">
          <span
            class="color-dot"
            style="border-color: #75B0EB; background-color: #A2C6E9;"/>
          <span>Professional</span>
        </div>
        <div
          notranslate
          profCount
          class="second-label">{{ formatDBNumbers(dataset[0]) }}</div>
      </div>
      <div class="legend-label">
        <div class="general-label">
          <span
            class="color-dot"
            style="border-color: #ABE37D; background-color: #C7E6AC;"/>
          <span>Non-Professional</span>
        </div>
        <div
          notranslate
          nonProfCount
          class="second-label">{{ formatDBNumbers(dataset[1]) }}</div>
      </div>
      <div class="legend-label">
        <div class="general-label">
          <span
            class="color-dot"
            style="border-color: #f3b760; background-color: #f3b760;"/>
          <span>Uncertain</span>
        </div>
        <div
          notranslate
          uncertainCount
          class="second-label">{{ formatDBNumbers(dataset[3]) }}</div>
      </div>
      <div class="legend-label">
        <div class="general-label">
          <span
            class="color-dot"
            style="border-color: #c9c9c9; background-color: #c9c9c9;"/>
          <span>Unknown</span>
        </div>
        <div
          notranslate
          unkCount
          class="second-label">{{ formatDBNumbers(dataset[2]) }}</div>
      </div>
      <div class="legend-label">
        <div class="general-label">
          <span
            class="color-dot"
            style="border-color: #FAD02C; background-color: #FAD02C;"/>
          <span>Not Processed</span>
        </div>
        <div
          notranslate
          unkCount
          class="second-label">{{ formatDBNumbers(dataset[4]) }}</div>
      </div>
    </div>
  </div>
</template>
