<template>
  <div id="market-analytics">
    <div
      v-if="marketAny.length"
      class="data-section stand-out">
      <div class="section-label">
        <div class="label-copy">Medium number of days on market</div>
      </div>
      <div class="section-content">
        <div class="margin-b-10">
          <area-chart
            v-if="marketAnyDataset"
            :data="marketAnyDataset"
            :min="marketAnyAmplitude.min"
            :max="marketAnyAmplitude.max"
            :colors="['#c7b7e4']"
            height="200px"/>
        </div>
        <div class="table-flex-col">
          <div class="table-col">
            <div class="flex-row-header bg-gray-lighter">
              <div class="poperty-data">Average days on market</div>
              <div
                v-if="marketAnyAverage"
                class="h4">{{ marketAnyAverage.toFixed(2) }}</div>
              <span v-else>N/A</span>
            </div>
          </div>
          <div class="table-col">
            <div class="flex-row-header bg-gray-lighter">
              <div class="poperty-data">Q1`{{ marketAnyYearMax - 1 }} vs Q1`{{ marketAnyYearMax }}</div>
              <div class="h4">
                <span
                  v-if="marketAnyChange"
                  :class="[marketAnyChange > 0 ? 'text-success' : 'text-danger']">
                  {{ marketAnyChange > 0 ? '+' : '' }}
                  {{ marketAnyChange.toFixed(2) }} %
                </span>
                <span v-else>N/A</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="marketOnlyActive.length"
      class="data-section stand-out">
      <div class="section-label">
        <div class="label-copy">Total offers</div>
      </div>
      <div class="section-content">
        <div class="margin-b-10">
          <area-chart
            v-if="marketOnlyActiveDataset"
            :data="marketOnlyActiveDataset"
            :min="marketOnlyActiveAmplitude.min"
            :max="marketOnlyActiveAmplitude.max"
            :colors="['#83d0c7']"
            height="200px"/>
        </div>
        <div class="table-flex-col">
          <div class="table-col">
            <div class="flex-row-header bg-gray-lighter">
              <div class="poperty-data">Average number of offers</div>
              <div
                v-if="marketOnlyActiveAverage"
                class="h4">{{ marketOnlyActiveAverage.toFixed(2) }}</div>
              <span v-else>N/A</span>
            </div>
          </div>
          <div class="table-col">
            <div class="flex-row-header bg-gray-lighter">
              <div class="poperty-data">Q1`{{ marketOnlyActiveYearMax - 1 }} vs Q1`{{ marketOnlyActiveYearMax }}</div>
              <div class="h4">
                <span
                  v-if="marketOnlyActiveChange"
                  :class="[marketOnlyActiveChange > 0 ? 'text-success' : 'text-danger']">
                  {{ marketOnlyActiveChange > 0 ? '+' : '' }}
                  {{ marketOnlyActiveChange.toFixed(2) }} %
                </span>
                <span v-else>N/A</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
