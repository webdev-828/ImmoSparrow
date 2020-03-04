<template>
  <div class="data-section stand-out">
    <div class="section-label">
      <div class="label-copy">{{ title }}</div>
    </div>
    <div class="section-content">
      <div
        v-if="dataList.length"
        class="fluid-data-table flex-option two-col">
        <div
          v-for="item in dataList"
          :key="item.key"
          class="fluid-cell-wrap">
          <div class="fluid-cell">
            <div class="attribute">
              {{ item.key }}
            </div>
            <div class="value">
              {{ item.value }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
