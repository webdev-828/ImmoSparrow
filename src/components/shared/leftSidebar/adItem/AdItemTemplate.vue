<template>
  <div
    :class="['object-detail-compact', { 'selected': selected }]"
    @click="selectAd">
    <div class="detail-image">
      <div class="image-placeholder">
        <i class="icon-no-image"/>
      </div>
      <div
        v-if="ad.pictures && ad.pictures.length"
        :style="`background-image: url(https://axresources.azurewebsites.net/image/get/${ad.pictures[0].id}/?mw=500&mh=500&q=90)`"
        class="image-real"/>
      <span
        :class="[ad.trackingInfo.publicationInterval.isActive ? 'text-success': 'text-danger']"
        class="status-marker">
        <i class="fa fa-circle"/>
      </span>
    </div>
    <div class="detail-data">
      <div class="data-name">{{ safeVal(ad, item => item.primaryInfo.basicInfo.title) }}</div>
      <div class="data-parameters">
        <div class="shown-compact">
          <span
            v-if="safeVal(ad, item => item.financialInfo.totalPriceCalculated)">
            <small>CHF</small> {{ safeVal(ad, item => item.financialInfo.totalPriceCalculated) }},
          </span>
          <span
            v-if="safeVal(ad, item => item.primaryInfo.layout.rooms.roomCount.value)">
            {{ safeVal(ad, item => item.primaryInfo.layout.rooms.roomCount.value) }} room/s,
          </span>
          <span
            v-if="safeVal(ad, item => item.primaryInfo.layout.size.areaLiving.value)">
            {{ safeVal(ad, item => item.primaryInfo.layout.size.areaLiving.value) }} m<sup>2</sup>
          </span>
        </div>
        <div class="fluid-data-table flex-option margin-b-0 hidden-compact">
          <div
            v-if="safeVal(ad, item => item.trackingInfo.publicationInterval)"
            class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Status</div>
              <div class="value">
                <span :class="[ad.trackingInfo.publicationInterval.isActive ? 'text-success': 'text-danger']">
                  <i class="fa fa-circle"/>
                  <span v-if="ad.trackingInfo.publicationInterval.isActive">On Market</span>
                  <span v-else>Off Market</span>
                </span>
              </div>
            </div>
          </div>
          <div
            v-if="safeVal(ad, item => item.trackingInfo.publicationInterval.lastUpdateTimeUtc)"
            class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Last change</div>
              <div
                class="value"
                notranslate>
                {{ safeVal(ad, item => item.trackingInfo.publicationInterval.lastUpdateTimeUtc) | moment('DD.MM.YYYY.') }}
              </div>
            </div>
          </div>
          <div
            v-if="safeVal(ad, item => item.financialInfo.totalPriceCalculated)"
            class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Price</div>
              <div class="value">
                {{ safeVal(ad, item => item.financialInfo.totalPriceCalculated) }}
              </div>
            </div>
          </div>
          <div
            v-if="safeVal(ad, item => item.primaryInfo.layout.rooms.roomCount.value)"
            class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Room/s</div>
              <div class="value">
                {{ safeVal(ad, item => item.primaryInfo.layout.rooms.roomCount.value) }}
              </div>
            </div>
          </div>
          <div
            v-if="safeVal(ad, item => item.primaryInfo.layout.size.areaLiving.value)"
            class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Living Area</div>
              <div class="value">
                {{ safeVal(ad, item => item.primaryInfo.layout.size.areaLiving.value) }} m<sup>2</sup>
              </div>
            </div>
          </div>
          <div
            v-if="safeVal(ad, item => item.primaryInfo.layout.size.areaProperty.value)"
            class="fluid-cell-wrap">
            <div class="fluid-cell">
              <div class="attribute">Property Area</div>
              <div class="value">
                {{ safeVal(ad, item => item.primaryInfo.layout.size.areaProperty.value) }} m<sup>2</sup>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
