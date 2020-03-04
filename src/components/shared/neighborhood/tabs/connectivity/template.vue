<template>
  <div class="side-panel under-subtabs">
    <div class="data-section on-image">
      <div class="section-label">
        <div class="label-image">
          <img src="/static/img/labels/connectivity.png">
        </div>
        <div class="label-copy">Connectivity</div>
      </div>
      <div class="section-content padding-t-10">
        <div class="table-flex-col">
          <div class="fluid-data-table flex-option no-side-margins w100">
            <div class="fluid-cell-wrap">
              <div class="fluid-cell head-cell">
                <div class="attribute text-uppercase font-w700">Next Public Transport</div>
                <div class="value"/>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Type
                </div>
                <div class="value">
                  Bus
                </div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Distance
                </div>
                <div class="value">
                  {{ Math.round(connectivity.distancePublicTransportStop) }} m
                </div>
              </div>
            </div>
            <div class="fluid-cell-wrap margin-t-10">
              <div class="fluid-cell head-cell">
                <div class="attribute text-uppercase font-w700">Next Driveway</div>
                <div class="value"/>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Distance
                </div>
                <div class="value">
                  {{ Math.round(connectivity.distanceToNearestRoadNetworkNode) }} m
                </div>
              </div>
            </div>
            <div class="fluid-cell-wrap margin-t-10">
              <div class="fluid-cell head-cell">
                <div class="attribute text-uppercase font-w700">Next Airport</div>
                <div class="value"/>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Distance
                </div>
                <div class="value">
                  {{ Math.round(connectivity.distanceMajorPublicTransportStop) }} km
                </div>
              </div>
            </div>
          </div>
          <div class="table-col col-smaller">
            <div
              class="score-plate state-bad">
              <radial-progress-bar
                :diameter="64"
                :startColor="'#f85359'"
                :stopColor="'#f85359'"
                :strokeWidth="3"
                :innerStrokeColor="'#ebebeb'"
                :completed-steps="connectivityRating"
                :total-steps="5">
                <div class="plate-icon">
                  <span class="icon-education"/>
                </div>
              </radial-progress-bar>
              <div class="plate-data">
                <div class="plate-subtitle">{{ connectivityTitle.firstPart }}</div>
                <div class="plate-title">{{ connectivityTitle.secondPart }}</div>
                <div class="plate-value">{{ connectivityRating }}</div>
                <div class="plate-controls">
                  <button
                    type="button"
                    class="btn btn-block btn-sm">Show on Map</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <table class="table table-condensed improved-condensed">
          <thead>
            <tr>
              <th>Merchandise density</th>
              <th class="text-right"/>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Schools/Kindergardens</td>
              <td class="text-right">{{ education.primarySchools.length }}/{{ education.kindergardens.length }}</td>
            </tr>
            <tr>
              <td>Shopping Possibilities</td>
              <td class="text-right">{{ service.countShopping1km }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
