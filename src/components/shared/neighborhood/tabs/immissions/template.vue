<template>
  <div class="side-panel under-subtabs">
    <div class="data-section on-image">
      <div class="section-label">
        <div class="label-image">
          <img src="/static/img/labels/immissions.png">
        </div>
        <div class="label-copy">Immissions</div>
      </div>
      <div
        v-if="closestMobileTransmitter"
        class="section-content padding-t-10">
        <div class="table-flex-col">
          <div class="fluid-data-table flex-option no-side-margins w100">
            <div class="fluid-cell-wrap">
              <div class="fluid-cell head-cell">
                <div class="attribute text-uppercase font-w700">Closest Cell Tower</div>
                <div class="value"/>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Distance
                </div>
                <div class="value">
                  {{ Math.round(closestMobileTransmitter.distance) }} m
                </div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Type
                </div>
                <div class="value">
                  5G
                </div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Radiation Intensity
                </div>
                <div class="value">
                  Low
                </div>
              </div>
            </div>
          </div>
          <div class="table-col col-smaller">
            <div
              class="score-plate state-excellent">
              <radial-progress-bar
                :diameter="64"
                :startColor="'#33b54a'"
                :stopColor="'#33b54a'"
                :strokeWidth="3"
                :innerStrokeColor="'#ebebeb'"
                :completed-steps="immissionsRating"
                :total-steps="5">
                <div class="plate-icon">
                  <span class="icon-immissions"/>
                </div>
              </radial-progress-bar>
              <div class="plate-data">
                <div class="plate-subtitle">{{ immissionsTitle.firstPart }}</div>
                <div class="plate-title">{{ immissionsTitle.secondPart }}</div>
                <div class="plate-value">{{ immissionsRating }}</div>
                <div class="plate-controls">
                  <button
                    :disabled="!mobileTransmitters.length"
                    type="button"
                    class="btn btn-block btn-sm"
                    @click="shoppingPlaces.length ? addPoisToMap(mobileTransmitters):''"
                  >Show on Map</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <table
          v-if="mobileTransmitters.length"
          class="table table-condensed improved-condensed">
          <thead>
            <tr>
              <th>#</th>
              <th>Category</th>
              <th>Type</th>
              <th>Radiation Intensity</th>
              <th class="text-right">Distance</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(transmitter, index) in mobileTransmitters"
              :key="index"
              :class="{ 'dimm': dimmRow == (index + 1) }"
              @mouseenter="highlightOnMap(index)"
              @mouseleave="highlightOnMap(null)"
            >
              <td>{{ ++index }}</td>
              <td>{{ 'Cell Tower' }}</td>
              <td>{{ '3G' }}</td>
              <td>{{ 'Low' }}</td>
              <td class="text-right">{{ Math.round(transmitter.distance) }} m</td>
            </tr>
          </tbody>
        </table>
      </div >
    </div>
  </div>
</template>
