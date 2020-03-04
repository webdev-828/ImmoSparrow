<template>
  <div v-if="adsInfo">
    <div
      :class="{ 'modal-was-open': openedPopapDetailId === `${adsInfo[0].address.coordinates.longitude}-${adsInfo[0].address.coordinates.latitude}` }"
      class="mapboxgl-popup-wrap">
      <div
        class="pos-relative">
        <div v-if="adsInfo.length === 1">
          <button
            class="no-button"
            @click="openAds(adsInfo[0], true)">
            <span
              :class="`icon-${getIconType(getMainCategory([adsInfo[0].primaryInfo.basicInfo.propertyCategory]))}`"
              class="the-icon"/>
            <span
              v-if="val(adsInfo[0], item => item.financialInfo.totalPriceCalculated, '') !== ''">
              {{ abbreviateNumber(adsInfo[0].financialInfo.totalPriceCalculated) }}
            </span>
            <span v-else>
              On Request
            </span>
          </button>
        </div>
        <div v-else>
          <button
            v-if="!(openedPopapDetailId === `${adsInfo[0].address.coordinates.longitude}-${adsInfo[0].address.coordinates.latitude}`)"
            class="no-button"
            @click="toggleModal(true)">{{ adsInfo.length }} Ads</button>
          <div
            :class="{ 'hide-slider' : !(openedPopapDetailId === `${adsInfo[0].address.coordinates.longitude}-${adsInfo[0].address.coordinates.latitude}`) }"
            class="tooltip-ads-wrap">
            <div
              class="close-button"
              @click="toggleModal(false)">x</div>
            <div class="data-section stand-out">
              <div class="section-label">
                <div class="label-copy">Ads</div>
                <div
                  class="section-controls">
                  <span class="font-s12 margin-r-10"><strong notranslate>{{ slidePage + 1 }}</strong> of <strong notranslate>{{ adsInfo.length }}</strong></span>
                </div>
              </div>
              <div class="section-content">
                <div class="flex-slider-box">
                  <button
                    v-tooltip.top="{ content: 'Previous ad', delay: { show: 700, hide: 100 }}"
                    :disabled="slidePage === 0"
                    class="btn btn-sm btn-default control"
                    @click="prevSlide"><i class="fa fa-angle-left"/></button>
                  <carousel
                    ref="cur1"
                    :per-page="1"
                    :mouse-drag="false"
                    :spacePadding="0"
                    :paginationEnabled="false"
                    :navigationEnabled="false"
                    :currentPage="slidePage"
                    class="carousel-wr h-auto"
                    @pageChange="pageChangedApartments">
                    <slide
                      v-for="ad in adsInfo"
                      :key="ad.id">
                      <div
                        class="cursor-pointer"
                        @click="openAds(ad)">
                        <div
                          class="object-item no-shadow light-border">
                          <div class="item-description">
                            <div
                              v-if="ad.pictures && ad.pictures.length"
                              :style="{ background: getBackground(ad.pictures[0].id) }"
                              class="item-picture"/>
                            <div
                              v-else
                              :style="{ backgroundImage: 'url('+photo+'', height: '100%', 'background-size': '100%', 'background-repeat': 'no-repeat' }"
                              class="item-picture"/>
                            <div class="status">
                              <span class="label label-xs label-default">
                                {{ getMainCategory([ad.primaryInfo.basicInfo.propertyCategory]) }}
                              </span>
                              <span
                                v-if="ad.trackingInfo.publicationInterval.isActive"
                                class="label label-xs label-success margin-l-5">
                                On Market
                              </span>
                              <span
                                v-else
                                class="label label-xs label-danger margin-l-5">
                                Off Market
                              </span>
                            </div>
                            <div
                              class="address"
                              notranslate>{{ shortenTitle(ad.primaryInfo.basicInfo.title) }}</div>
                          </div>
                          <div class="item-data">
                            <div class="flex-row">
                              <div class="poperty-data">Address</div>
                              <div class="value-data">
                                <span
                                  v-if="ad.address.quality > 7"
                                  notranslate>{{ val(ad, ad => ad.address.street, "") }} {{ val(ad, ad => ad.address.streetNumber, "") }}</span>
                                <span
                                  v-if="ad.address.quality > 5 && ad.address.quality <= 7"
                                  notranslate>{{ val(ad, ad => ad.address.street, "") }}</span>
                              </div>
                            </div>
                            <div class="flex-row">
                              <div class="poperty-data">Zip Locality</div>
                              <div
                                notranslate
                                class="value-data">{{ ad.address.zip }} {{ ad.address.locality }}</div>
                            </div>
                            <div class="flex-row">
                              <div class="poperty-data">Price</div>
                              <div
                                v-if="val(ad, item => item.financialInfo.totalPriceCalculated)"
                                notranslate
                                class="value-data">
                                <small>{{ val(ad, item => item.financialInfo.currency.value, "") }}</small>
                                {{ val(ad, item => item.financialInfo.totalPriceCalculated, x => formatPrice(x), "") }}
                              </div>
                            </div>
                            <div
                              v-if="ad.trackingInfo.publicationInterval.isActive"
                              class="flex-row">
                              <div class="poperty-data">On Market</div>
                              <get-time-utc
                                :publicationTimeUtc="val(ad, ad => ad.trackingInfo.publicationInterval.publicationTimeUtc, '')"
                                class="value-data"/>
                            </div>
                          </div>
                        </div>
                      </div>
                    </slide>
                  </carousel>
                  <button
                    v-tooltip.top="{ content: 'Next ad', delay: { show: 700, hide: 100 }}"
                    :disabled="slidePage === adsInfo.length - 1"
                    class="btn btn-sm btn-default control"
                    @click="nextSlide">
                  <i class="fa fa-angle-right"/></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
