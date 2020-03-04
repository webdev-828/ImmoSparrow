<template>
  <div
    class="data-section stand-out">
    <div class="section-label">
      <div class="label-copy">Similar objects subtypes</div>
    </div>
    <div class="section-content padding-b-10">
      <canvas
        id="propertyTypes"
        height="150px"/>
      <div class="legend flex-legend padding-t-10">
        <div
          v-for="(label, index) in doughnutGraphOptions.data.labels"
          :key="`chart-label-${index}`"
          class="legend-label">
          <div class="general-label">
            <span
              :style="'background-color:'+ doughnutGraphOptions.data.datasets[0].backgroundColor[index]"
              class="color-dot"/>
            <span>{{ label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
