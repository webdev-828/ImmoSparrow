<template>
  <div class="side-panel under-subtabs">
    <div
      v-if="noise"
      class="data-section on-image"
    >
      <div class="section-label">
        <div class="label-image">
          <img src="/static/img/labels/noise.png">
        </div>
        <div class="label-copy">Silence</div>
      </div>
      <div class="section-content padding-t-10">
        <div class="table-flex-col">
          <div class="fluid-data-table flex-option no-side-margins w100 margin-b-0">
            <div class="fluid-cell-wrap">
              <div class="fluid-cell head-cell">
                <div class="attribute"><i class="fa fa-sun-o"/> Noise level during the day
                </div>
                <div class="value"/>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Cars
                </div>
                <div
                  v-if="noise.roadDay"
                  class="value"
                  notranslate>
                  {{ noise.roadDay }} dB
                </div>
                <div
                  v-else
                  class="value">&nbsp;</div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Trains
                </div>
                <div
                  v-if="noise.railwayDay"
                  class="value"
                  notranslate>
                  {{ noise.railwayDay }} dB
                </div>
                <div
                  v-else
                  class="value">&nbsp;</div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell head-cell">
                <div class="attribute"><i class="fa fa-moon-o"/> Noise level at night
                </div>
                <div class="value"/>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Cars
                </div>
                <div
                  v-if="noise.roadNight"
                  class="value"
                  notranslate>
                  {{ noise.roadNight }} dB
                </div>
                <div
                  v-else
                  class="value">&nbsp;</div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Trains
                </div>
                <div
                  v-if="noise.railwayNight"
                  class="value"
                  notranslate>
                  {{ noise.railwayNight }} dB
                </div>
                <div
                  v-else
                  class="value">&nbsp;</div>
              </div>
            </div>
          </div>
          <div class="table-col col-smaller">
            <div
              class="score-plate state-good"
              @click="showNeighborhoodTabs('noise')">
              <radial-progress-bar
                :diameter="64"
                :startColor="'#09c199'"
                :stopColor="'#09c199'"
                :strokeWidth="3"
                :innerStrokeColor="'#ebebeb'"
                :completed-steps="noise.rating"
                :total-steps="5">
                <div class="plate-icon">
                  <span class="icon-noise"/>
                </div>
              </radial-progress-bar>
              <div class="plate-data">
                <div
                  v-show="alphaFeature"
                  class="plate-subtitle alpha-feature feature-on-text"
                >{{ noiseTitle.firstPart }}</div>
                <div class="plate-title">{{ noiseTitle.secondPart }}</div>
                <div class="plate-value">{{ noise.rating }}</div>
                <div
                  v-show="alphaFeature"
                  class="plate-controls">
                  <button
                    type="button"
                    class="btn btn-block btn-sm">Show on Map</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="fluid-data-table flex-option">
          <button
            class="btn btn-block btn-xs btn-default"
            style="margin: 0px 10px"
            @click="callModal()">Explain dB values</button>
        </div>
      </div>
    </div>
  </div>
</template>
