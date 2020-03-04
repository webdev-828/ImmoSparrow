<template>
  <div
    :class="['object-detail-compact', { 'selected': selected }]"
    @click="selectApartment">
    <div class="detail-data">
      <div class="data-name">{{ getApartmentTitle(apartment) }}</div>
      <div class="data-parameters">
        <div class="shown-compact">
          <span>
            {{ safeVal(apartment, item => apartment.primaryInfo.roomCount) }} room/s,
          </span>
          <span>
            level {{ safeVal(apartment, item => apartment.primaryInfo.levelNumber) }}
          </span>
        </div>
        <div class="fluid-data-table flex-option margin-b-0 hidden-compact">
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">EWID</div>
              <div
                class="value"
                notranslate>
                {{ safeVal(apartment, item => apartment.address.govId.ewid) }}
              </div>
            </div>
          </div>
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Level</div>
              <div
                class="value"
                notranslate>
                {{ safeVal(apartment, item => apartment.primaryInfo.levelNumber) }}
              </div>
            </div>
          </div>
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Room/s</div>
              <div
                class="value"
                notranslate>
                {{ safeVal(apartment, item => apartment.primaryInfo.roomCount) }}
              </div>
            </div>
          </div>
          <div class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Living Area</div>
              <div
                class="value"
                notranslate>
                {{ safeVal(apartment, item => apartment.primaryInfo.livingArea, '?') }} m<sup>2</sup>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
