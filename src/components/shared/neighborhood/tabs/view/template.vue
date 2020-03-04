<template>
  <div class="side-panel under-subtabs">
    <div class="data-section on-image">
      <div class="section-label">
        <div class="label-image">
          <img src="/static/img/labels/view.png">
        </div>
        <div class="label-copy">View</div>
      </div>
      <div
        v-if="neighborhoodView"
        class="section-content padding-t-10">
        <div class="table-flex-col">
          <div class="fluid-data-table flex-option no-side-margins w100">
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Area slope
                </div>
                <div
                  v-if="neighborhoodView.slopeDegrees.toFixed(1)"
                  class="value"
                  notranslate>
                  {{ neighborhoodView.slopeDegrees.toFixed(1) }}&deg;
                </div>
                <div
                  v-else
                  class="value">&nbsp;</div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Visible mountains
                </div>
                <div
                  v-if="neighborhoodView.visibleMountainsPeaksCount"
                  class="value"
                  notranslate>
                  {{ neighborhoodView.visibleMountainsPeaksCount }}
                </div>
                <div
                  v-else
                  class="value">&nbsp;</div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Daylight in summer
                </div>
                <div
                  v-if="neighborhoodView.summerSunshineDailyHours.toFixed(1)"
                  class="value"
                  notranslate>
                  {{ neighborhoodView.summerSunshineDailyHours.toFixed(1) }} h
                </div>
                <div
                  v-else
                  class="value">&nbsp;</div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Daylight in winter
                </div>
                <div
                  v-if="neighborhoodView.winterSunshineDailyHours.toFixed(1)"
                  class="value"
                  notranslate>
                  {{ neighborhoodView.winterSunshineDailyHours.toFixed(1) }} h
                </div>
                <div
                  v-else
                  class="value">&nbsp;</div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Lake view type
                </div>
                <div
                  v-if="neighborhoodView.lakeViewType"
                  class="value"
                  notranslate>
                  {{ getLakeViewTypeValue(neighborhoodView.lakeViewType) }}
                </div>
                <div
                  v-else
                  class="value">No Information</div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Average cloud coverage percent
                </div>
                <div
                  v-if="neighborhoodView.averageCloudCoveragePercent.toFixed(1)"
                  class="value"
                  notranslate>
                  {{ neighborhoodView.averageCloudCoveragePercent.toFixed(1) }}%
                </div>
                <div
                  v-else
                  class="value">&nbsp;</div>
              </div>
            </div>
          </div>
          <div class="table-col col-smaller">
            <div
              class="score-plate state-moderate">
              <radial-progress-bar
                :diameter="64"
                :startColor="'#f7981c'"
                :stopColor="'#f7981c'"
                :strokeWidth="3"
                :innerStrokeColor="'#ebebeb'"
                :completed-steps="neighborhoodView.rating"
                :total-steps="5">
                <div class="plate-icon">
                  <span class="icon-view"/>
                </div>
              </radial-progress-bar>
              <div class="plate-data">
                <div
                  v-show="alphaFeature"
                  class="plate-subtitle alpha-feature feature-on-text"
                >{{ viewTitle.firstPart }}</div>
                <div class="plate-title">{{ viewTitle.secondPart }}</div>
                <div class="plate-value">{{ neighborhoodView.rating }}</div>
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
      </div>
    </div>
  </div>
</template>
