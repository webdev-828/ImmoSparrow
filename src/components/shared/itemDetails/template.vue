<template>
  <div class="block-content">
    <div class="row">
      <div class="col-xs-4">
        <div class="padding-b-10"><i class="fa fa-user margin-r-5"/><span class="font-s13 font-w600 allcaps">Object</span></div>
        <!-- .css-table -->
        <div class="css-table">
          <template
            v-if="val(item, item => item.financialInfo.rentalPrice.grossRentCalculated) ||
              val(item, item => item.financialInfo.rentalPrice.netRentCalculated) ||
            val(item, item => item.financialInfo.rentalPrice.sideCostCalculated)">
            <div class="table-line">
              <div class="line-param">Gross Rent</div>
              <div class="line-value text-muted">
                <template v-if="priceChangeType">
                  <span
                    v-tooltip.top="{ content: 'Price Decrease', delay: { show: 700, hide: 100 }}"
                    v-if="priceDecrease"
                    class="icon-price-down text-success"
                    @click.stop="$emit('selectItem', index, null, true)"/>
                  <span
                    v-tooltip.top="{ content: 'Price Increase', delay: { show: 700, hide: 100 }}"
                    v-if="priceIncrease"
                    class="icon-price-up text-danger"
                    @click.stop="$emit('selectItem', index, null, true)"/>
                  <span
                    v-if="fromUnknownToKnown"
                    @click.stop="$emit('selectItem', index, null, true)">
                    <i
                      v-tooltip.top="{ content: 'Price Was Unknown', delay: { show: 700, hide: 100 }}"
                      class="fa fa-area-chart" />
                  </span>
                </template>
                <span
                  v-if="val(item, item => item.financialInfo.rentalPrice.grossRentCalculated)"
                  notranslate><small>{{ safeVal(item, item => item.financialInfo.currency.text, "CHF") }}</small>
                  <span>{{ val(item, item => item.financialInfo.rentalPrice.grossRentCalculated, item => formatPrice(item), "") }}</span>
                </span>
              </div>
            </div>
            <div class="table-line">
              <div class="line-param">Net Rent</div>
              <div class="line-value text-muted">
                <span
                  v-if="val(item, item => item.financialInfo.rentalPrice.netRentCalculated)"
                  notranslate><small>{{ safeVal(item, item => item.financialInfo.currency.text, "CHF") }}</small> {{ val(item, item => item.financialInfo.rentalPrice.netRentCalculated, item => formatPrice(item), "") }}</span>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="table-line">
              <div class="line-param">Price</div>
              <div class="line-value text-muted">
                <template v-if="val(item, item => item.financialInfo.totalPriceCalculated)">
                  <template v-if="priceChangeType">
                    <span
                      v-tooltip.top="{ content: 'Price Decrease', delay: { show: 700, hide: 100 }}"
                      v-if="priceDecrease"
                      class="icon-price-down text-success"
                      @click.stop="$emit('selectItem', index, null, true)"/>
                    <span
                      v-tooltip.top="{ content: 'Price Increase', delay: { show: 700, hide: 100 }}"
                      v-if="priceIncrease"
                      class="icon-price-up text-danger"
                      @click.stop="$emit('selectItem', index, null, true)"/>
                    <span
                      v-if="fromUnknownToKnown"
                      @click.stop="$emit('selectItem', index, null, true)">
                      <i
                        v-tooltip.top="{ content: 'Price Was Unknown', delay: { show: 700, hide: 100 }}"
                        class="fa fa-area-chart" />
                    </span>
                  </template>
                  <span notranslate><small>{{ safeVal(item, item => item.financialInfo.currency.text, "CHF") }}</small> {{ val(item, item => item.financialInfo.totalPriceCalculated, item => formatPrice(item), "") }} </span>
                </template>
              </div>
            </div>
            <div class="table-line">
              <div class="line-param">Price/m<sup>2</sup></div>
              <div class="line-value text-muted">
                <span
                  v-if="val(item, item => item.financialInfo.pricePerSqrMeterCalculated)"
                  notranslate><small>{{ safeVal(item, item => item.financialInfo.currency.text, "CHF") }}</small> {{ val(item, item => item.financialInfo.pricePerSqrMeterCalculated, item => formatPrice(item), "") }}</span>
              </div>
            </div>
          </template>
          <div class="table-line">
            <div class="line-param">On Market</div>
            <div class="line-value text-muted">
              <get-time-utc
                :deletedTimeUtc="val(item, item => item.trackingInfo.publicationInterval.deleteTimeUtc, '')"
                :publicationTimeUtc="val(item, item => item.trackingInfo.publicationInterval.publicationTimeUtc, '')"/>
            </div>
          </div>
          <div class="table-line">
            <div class="line-param">Address</div>
            <template v-if="item.address.quality > 5">
              <div
                v-if="item.address.quality > 7"
                notranslate
                class="line-value text-muted">{{ val(item, item => item.address.street, "") }} {{ val(item, item => item.address.streetNumber, "") }}</div>
              <div
                v-if="item.address.quality > 5 && item.address.quality <= 7"
                notranslate
                class="line-value text-muted">{{ val(item, item => item.address.street, "") }}</div>
            </template>
            <div
              v-else
              class="line-value text-muted"/>
          </div>
          <div class="table-line">
            <div class="line-param">ZIP/Locality</div>
            <div
              notranslate
              class="line-value text-muted">
              {{ val(item, item => item.address.zip, "") }} {{ val(item, item => item.address.locality, "") }}, {{ val(item, item => item.address.stateShort, "") }}
            </div>
          </div>
          <div class="table-line">
            <div class="line-param">Address Confidence</div>
            <div class="line-value text-muted">
              <span
                v-if="addressConfidence === 'Inferred'"
                class="label label-warning">Inferred</span>
              <span
                v-if="addressConfidence === 'Alternative'"
                class="label label-warning">Possibilities</span>
              <span
                v-if="addressConfidence === 'Exact'"
                class="label label-success">Source</span>
              <span
                v-if="val(item, item => item.address.quality)"
                class="label label-info">{{ getAddressQuality(item.address.quality) }}</span>
            </div>
          </div>
          <div
            v-if="getAddressQuality(item.address.quality) === 'Address' || getAddressQuality(item.address.quality) === 'Rooftop'"
            class="table-line">
            <div class="line-param"/>
            <div class="line-value text-muted">
              <button
                v-tooltip.top="{ content: 'Toggle map', delay: { show: 700, hide: 100 }}"
                :disabled="!item.address.coordinates"
                type="button"
                class="btn btn-sm btn-default"
                @click.stop="$emit('showHideMap', item.id)"><i class="fa fa-map"/></button>
            </div>
          </div>
        </div>
        <!-- /.css-table -->
      </div>
      <div class="col-xs-4">
        <div class="padding-b-10"><i class="fa fa-home margin-r-5"/><span class="font-s13 font-w600 allcaps">Building</span></div>
        <!-- css-table -->
        <div class="css-table">
          <div class="table-line">
            <div class="line-param">Room/s</div>
            <div
              notranslate
              class="line-value text-muted">
              {{ val(item, item => item.primaryInfo.layout.rooms.roomCount, "") }}
            </div>
          </div>
          <div class="table-line">
            <div class="line-param">Living Area</div>
            <div
              v-if="val(item, item => item.primaryInfo.layout.size.areaLiving)"
              notranslate
              class="line-value text-muted">{{ val(item, item => item.primaryInfo.layout.size.areaLiving, "") }} m<sup>2</sup></div>
            <div
              v-else
              class="line-value text-muted"/>
          </div>
          <div class="table-line">
            <div class="line-param">Property Area</div>
            <div
              v-if="val(item, item => item.primaryInfo.layout.size.areaProperty)"
              notranslate
              class="line-value text-muted">{{ val(item, item => item.primaryInfo.layout.size.areaProperty, "") }} m<sup>2</sup></div>
            <div
              v-else
              class="line-value text-muted"/>
          </div>
          <div class="table-line">
            <div class="line-param">Usable Area</div>
            <div
              v-if="val(item, item => item.primaryInfo.layout.size.areaUsable)"
              notranslate
              class="line-value text-muted">{{ val(item, item => item.primaryInfo.layout.size.areaUsable, "") }} m<sup>2</sup></div>
            <div
              v-else
              class="line-value text-muted"/>
          </div>
          <div class="table-line">
            <div class="line-param">Area</div>
            <div
              v-if="val(item, item => item.primaryInfo.layout.size.areaCalculated)"
              notranslate
              class="line-value text-muted">{{ val(item, item => item.primaryInfo.layout.size.areaCalculated, "") }} m<sup>2</sup></div>
            <div
              v-else
              class="line-value text-muted"/>
          </div>
          <div class="table-line">
            <div class="line-param">Built Year</div>
            <div
              notranslate
              class="line-value text-muted">
              {{ val(item, item => item.primaryInfo.basicInfo.builtYearCalculated, "") }}
            </div>
          </div>
        </div>
        <!-- /.css-table -->
      </div>
      <div class="col-xs-4">
        <div class="padding-b-10 row">
          <div class="col-xs-6"><i class="fa fa-envelope margin-r-5"/><span class="font-s13 font-w600 allcaps">Vendor</span></div>
          <div class="col-xs-6 text-right">
            <span
              v-if="val(item, item => item.trackingInfo.publisherClassCalculated) !== undefined"
              class="label label-info"
              notranslate>{{ getVendorClass(item.trackingInfo.publisherClassCalculated) }}</span>
            <span
              v-tooltip="'Ad is outside of your restricted area'"
              v-else
              style="opacity: 0.7"
              class="label label-default">Not available</span>
          </div>
        </div>
        <!-- .css-table -->
        <div
          v-if="item.trackingInfo.publisherCalculated"
          class="css-table">
          <div class="table-line">
            <div class="line-param">Name</div>
            <div
              notranslate
              class="line-value text-muted">
              {{ getPersonName(val(item, item => item.trackingInfo.publisherCalculated.primaryInfo, "")) }}
            </div>
          </div>
          <div class="table-line">
            <div class="line-param">Street</div>
            <div
              notranslate
              class="line-value text-muted">
              {{ val(item, item => item.trackingInfo.publisherCalculated.address.street, "") }} {{ val(item, item => item.trackingInfo.publisherCalculated.address.streetNumber, "") }}
            </div>
          </div>
          <div class="table-line">
            <div class="line-param">Zip / Locality</div>
            <div
              notranslate
              class="line-value text-muted">
              {{ val(item, item => item.trackingInfo.publisherCalculated.address.zip, "") }} {{ val(item, item => item.trackingInfo.publisherCalculated.address.locality, "") }}
            </div>
          </div>
          <div class="table-line">
            <div class="line-param">Email</div>
            <div
              class="line-value text-muted">
              <!-- {{ val(item, item => item.trackingInfo.publisherCalculated.primaryInfo.contactInfo.emailAddresses[0], "") }} -->
              <div class="form-material floating">
                <input
                  v-if="val(item, item => item.trackingInfo.publisherCalculated.primaryInfo.contactInfo.emailAddresses)"
                  :value="val(item, item => item.trackingInfo.publisherCalculated.primaryInfo.contactInfo.emailAddresses[0])"
                  disabled
                  class="form-control input-sm">
              </div>
            </div>
          </div>
          <div class="table-line">
            <div class="line-param">Mobile</div>
            <div
              notranslate
              class="line-value text-muted">
              {{ parsePhone(val(item, item => item.trackingInfo.publisherCalculated.primaryInfo.contactInfo.mobilePhoneNumbers[0], "")) }}
            </div>
          </div>
          <div class="table-line">
            <div class="line-param">Land Line</div>
            <div
              notranslate
              class="line-value text-muted">
              {{ parsePhone(val(item, item => item.trackingInfo.publisherCalculated.primaryInfo.contactInfo.phoneNumbers[0], "")) }}
            </div>
          </div>
        </div>
        <div
          v-else
          class="css-table">
          <div class="table-line single">
            <div class="line-param"><i class="fa fa-info-circle"/> Vendor info not available</div>
          </div>
        </div>
        <!-- /.css-table -->
      </div>
    </div>
  </div>
</template>
