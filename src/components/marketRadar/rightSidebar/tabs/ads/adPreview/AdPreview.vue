<template>
  <div>
    <div class="list-timeline-time">
      <div class="day-month">{{ adTimestamp(ad) | moment("MMMM YYYY") }}</div>
    </div>
    <div
      @click="openAd(ad)"
    >
      <i class="fa fa-building list-timeline-icon bg-primary" />
      <div class="list-timeline-content">
        <div class="object-detail-compact has-border">
          <div
            class="detail-image">
            <div class="image-placeholder">
              <i class="icon-no-image"/>
            </div>
            <div
              v-if="ad.pictures"
              :style="'background-image: url(https://axresources.azurewebsites.net/image/get/'+ad.pictures[0].id+'/?mw=500&mh=500&q=90)'"
              class="image-real"/>
          </div>
          <div class="detail-data">
            <div class="data-name">{{ ad.primaryInfo.basicInfo.title }}</div>
            <div class="data-parameters">
              <div class="fluid-data-table flex-option margin-b-0">
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell">
                    <div class="attribute">
                      Status
                    </div>
                    <div class="value">
                      <span :class="ad.trackingInfo.publicationInterval.isActive ? 'text-success' : 'text-error'">
                        <i class="fa fa-circle"/>
                        <span v-if="ad.trackingInfo.publicationInterval.isActive">Active</span>
                        <span v-else>Not active</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell">
                    <div class="attribute">
                      Price
                    </div>
                    <div
                      v-if="totalPriceCalculated(ad)"
                      class="value">
                      <small>{{ currencyValue(ad) }}</small>
                      {{ formatPrice(totalPriceCalculated(ad)) }}
                    </div>
                    <div
                      v-else
                      class="value"/>
                  </div>
                </div>
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell">
                    <div class="attribute">
                      First Seen
                    </div>
                    <div
                      v-if="publicationTime(ad)"
                      class="value">
                      {{ formatDate(publicationTime(ad)) }}
                    </div>
                    <div
                      v-else
                      class="value"/>
                  </div>
                </div>
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell">
                    <div class="attribute">
                      Last Checked
                    </div>
                    <div
                      v-if="lastUpdateTime(ad)"
                      class="value"
                    >
                      {{ formatDate(lastUpdateTime(ad)) }}
                    </div>
                    <div
                      v-else
                      class="value">&nbsp;</div>
                  </div>
                </div>
                <div class="fluid-cell-wrap">
                  <div class="fluid-cell">
                    <div class="attribute">
                      Deleted
                    </div>
                    <div
                      v-if="deleteTimeUTC(ad)"
                      class="value"
                    >
                      {{ deleteTimeUTC(ad) }}
                    </div>
                    <div
                      v-else
                      class="value">&nbsp;</div>
                  </div>
                </div>
                <div
                  v-if="ad.trackingInfo.publicationInterval.isActive"
                  class="fluid-cell-wrap">
                  <div class="fluid-cell">
                    <div class="attribute">
                      On Market
                    </div>
                    <div class="value">
                      <get-time-utc :publicationTimeUtc="publicationTimeUtc(ad)"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
