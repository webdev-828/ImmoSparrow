<template>
  <div class="side-panel under-subtabs">
    <div class="data-section on-image">
      <div class="section-label">
        <div class="label-image">
          <img src="/static/img/labels/shopping.png">
        </div>
        <div class="label-copy">Shopping</div>
      </div>
      <div
        v-if="shoppingPlaces && shoppingPlaces.length"
        class="section-content padding-t-10">
        <div class="table-flex-col">
          <div
            class="fluid-data-table flex-option no-side-margins w100"
            @mouseenter="highlightOnMap(1)"
            @mouseleave="highlightOnMap(null)"
          >
            <div class="fluid-cell-wrap">
              <div class="fluid-cell head-cell">
                <div class="attribute text-uppercase font-w700">Next shopping possibility</div>
                <div class="value"/>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Shop
                </div>
                <div class="value">
                  {{ closestShop.name }}
                </div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Distance
                </div>
                <div class="value">
                  {{ Math.round(closestShop.distance) }} m
                </div>
              </div>
            </div>
            <div class="fluid-cell-wrap">
              <div class="fluid-cell">
                <div class="attribute">
                  Address
                </div>
                <div class="value">
                  {{ formatAddress(shoppingPlaces[0].address) }}
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
                :completed-steps="shoppingRating"
                :total-steps="5">
                <div class="plate-icon">
                  <span class="icon-shopping"/>
                </div>
              </radial-progress-bar>
              <div class="plate-data">
                <div class="plate-subtitle">{{ shoppingTitle.firstPart }}</div>
                <div class="plate-title">{{ shoppingTitle.secondPart }}</div>
                <div class="plate-value">{{ shoppingRating }}</div>
                <div class="plate-controls">
                  <button
                    :disabled="!shoppingPlaces.length"
                    type="button"
                    class="btn btn-block btn-sm"
                    @click="shoppingPlaces.length ? addPoisToMap(shoppingPlaces):''"
                  >Show on Map</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <table class="table table-condensed improved-condensed">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Address</th>
              <th class="text-right">Distance</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(shop, index) in shoppingPlaces"
              :key="index"
              :class="{ 'dimm': dimmRow == (index + 1) }"
              @mouseenter="highlightOnMap(index)"
              @mouseleave="highlightOnMap(null)"
            >
              <td>{{ ++index }}</td>
              <td>{{ shop.name }}</td>
              <td>{{ formatAddress(shop.address) }}</td>
              <td class="text-right">{{ Math.round(shop.distance) }} m</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<style>
  .dimm {
    background-color: #fafafa;
  }
</style>
