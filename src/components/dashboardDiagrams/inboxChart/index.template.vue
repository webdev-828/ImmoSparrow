<template>
  <div>
    <div class="item-label">
      <div class="general-label">
        <div>Inbox</div>
        <div class="item-parameter">
          <var notranslate>{{ dataset[2] }} </var><small style="font-size: 13px;">today</small>
        </div>
      </div>
    </div>
    <div class="item-graphic">
      <canvas
        id="inboxChart"
        height="140px"/>
    </div>
    <div class="item-legend">
      <div class="legend-label">
        <div class="general-label">
          <span
            class="color-dot"
            style="border-color: #7FE5F0; background-color: #7FE5F0;"/>
          <span>Total Leads</span>
        </div>
        <div
          class="second-label"
          notranslate>{{ formatDBNumbers(dataset[0]) }}</div>
      </div>
      <div class="legend-label">
        <div class="general-label">
          <span
            class="color-dot"
            style="border-color: #00C59D; background-color: #00C59D;"/>
          <span>Total Unread</span>
        </div>
        <div
          class="second-label"
          notranslate>{{ formatDBNumbers(dataset[1]) }}</div>
      </div>
      <div class="legend-label">
        <div class="general-label">
          <span
            class="color-dot"
            style="border-color: #f3b760; background-color: #f3b760;"/>
          <span>Total Today</span>
        </div>
        <div
          class="second-label"
          notranslate>{{ formatDBNumbers(dataset[2]) }}</div>
      </div>
      <div class="legend-label">
        <div class="general-label">
          <span
            class="color-dot"
            style="border-color: #C9C0F9; background-color: #C9C0F9;"/>
          <span>Unread Today</span>
        </div>
        <div
          class="second-label"
          notranslate>{{ formatDBNumbers(dataset[3]) }}</div>
      </div>
    </div>
  </div>
</template>
