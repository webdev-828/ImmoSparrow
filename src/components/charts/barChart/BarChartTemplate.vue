<template>
  <div class="dash-item bg-white has-border">
    <div>
      <div class="item-label">
        <div class="general-label big-label margin-b-10">
          <div>{{ title }}</div>
        </div>
      </div>
      <div class="item-graphic">
        <canvas
          :id="chartId"
          height="250px"/>
      </div>
      <div
        v-for="(item, index) in validItems"
        :key="`legend-${index}`"
        class="item-legend">
        <div class="legend-label">
          <div class="general-label">
            <span
              :style="{ 'border-color': 'rgb(0, 0, 0, .02)', 'background-color': item.color }"
              class="color-dot"/>
            <span>{{ item.legend }}</span>
          </div>
          <div class="second-label">{{ item.legendValue }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
