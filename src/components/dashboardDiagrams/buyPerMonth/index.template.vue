<template>
  <div>
    <div class="item-label">
      <div class="general-label">
        <div>Avg. m<sup>2</sup> CHF price / month <span
          class="label label-primary"
          style="font-size: 100%;">BUY</span></div>
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
    <div class="double-param">
      <div class="param-col">
        <div class="general-label">
          <i
            class="si si-home"
            style="color: rgb(92,144,210);"/>
          <span>House</span>
        </div>
        <div
          class="item-parameter"
          notranslate
          currentBuyHouse>
          {{ formatDBNumbers(currentBuy.house) }}
        </div>
      </div>
      <div class="param-col text-right">
        <div class="general-label">
          <span>Apartment</span>
          <i
            class="si si-puzzle"
            style="color: rgb(210,106,93);"/>
        </div>
        <div
          class="item-parameter"
          notranslate
          currentBuyApt>
          {{ formatDBNumbers(currentBuy.apartment) }}
        </div>
      </div>
    </div>
    <div class="item-graphic margin-b-0">
      <canvas
        id="buyPerMonth"
        height="140px"/>
    </div>
  </div>
</template>
