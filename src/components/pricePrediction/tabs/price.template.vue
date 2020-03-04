<template>
  <div
    v-if="predictedPrice"
    class="right-side-panel">
    <div class="data-section stand-out">
      <div class="section-label">
        <div class="label-copy">Calculation result</div>
        <div class="section-controls">
          <div
            class="dropdown"
            style="display: inline-block;">
            <div
              v-if="ppDocumentation"
              class="btn-group">
              <template v-if="predictedPrice && pubPredictedPrice">
                <button
                  v-tooltip.bottom="{ content: 'Download PDF', delay: { show: 700, hide: 100 }}"
                  class="btn btn-sm btn-default"
                  type="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="true">
                  <i :class="[ waitingforGeneratingPdf ? 'fa fa-spinner fa-spin' : 'fa fa-file-pdf-o']"/>
                  <span class="caret"/>
                </button>
                <ul
                  class="dropdown-menu dropdown-menu-right fancy-shadow">
                  <li>
                    <a
                      v-show="alphaFeature"
                      class="alpha-feature feature-on-block"
                      href="#"
                      @click="generatePdf(true)">Transaction Price
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      @click="generatePdf(false)">Advertising Price
                    </a>
                  </li>
                </ul>
              </template>
              <template v-else>
                <button
                  v-tooltip.bottom="{ content: 'Download PDF', delay: { show: 700, hide: 100 }}"
                  class="btn btn-sm btn-default"
                  type="button"
                  aria-haspopup="true"
                  aria-expanded="true"
                  @click="generatePdf(false)">
                  <i :class="[ waitingforGeneratingPdf ? 'fa fa-spinner fa-spin' : 'fa fa-file-pdf-o']"/>
                </button>
              </template>
            </div>
            <v-popover
              v-else
              class="popover-inline"
              placement="top">
              <button
                v-tooltip.bottom="{ content: 'Download PDF', delay: { show: 700, hide: 100 }}"
                class="btn btn-sm btn-default"
                type="button">
                <i class="fa fa-file-pdf-o"/>
              </button>
              <template
                v-if="empCtx"
                slot="popover">
                <popover
                  :bundle="'pricePredictor'"
                  :feature="'documentation'" />
              </template>
            </v-popover>

            <ul
              class="dropdown-menu dropdown-menu-right fancy-shadow padding-0"
              style="cursor: pointer;"
              aria-labelledby="dropdownMenu2">
              <li @click="generatePdf(false)">
                <div class="font-s12 padding-10">Ads</div>
              </li>
              <li>
                <hr style="margin: 0;">
              </li>
              <li @click="generatePdf()">
                <div class="font-s12 padding-10">Transaction</div>
              </li>
            </ul>
          </div>
          <div
            class="dropdown"
            style="display: inline-block;">
            <button
              v-tooltip.bottom="{ content: 'Prediction info', delay: { show: 700, hide: 100 }}"
              id="dropdownMenu2"
              class="btn btn-sm btn-default dropdown-toggle"
              type="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="true">
              i
            </button>
            <ul
              class="dropdown-menu dropdown-menu-right fancy-shadow"
              aria-labelledby="dropdownMenu2">
              <li>
                <div class="font-s12 padding-10">
                  We calculate price based on market analytics algorythm. It is comparing old prices with new ones based on a set period of time.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <!--<div
        v-if="predictedPrice.price"
        class="fancy-price fit-into-col padding-t-10">
        <div class="price-container bg-primary text-white">
          <div class="price-label">Advertising Price <span class="label label-default">{{ predictedModel.transactionType == 10 ? 'Rent' : 'Buy' }}</span></div>
          <div
            class="price-amount"
            notranslate>{{ format_money(predictedPrice.price.value) }}</div>
          <div
            class="price-smaller"
            notranslate>{{ format_money(predictedPrice.price.value / predictedModel.livingArea) }} / m<sup>2</sup></div>

          <div class="additional-info">
            <div class="info-section margin-r-15 margin-b-5">
              <div class="range-label">Price Range</div>
              <div
                class="range-amount"
                notranslate>{{ format_money(predictedPrice.price.min) }} <i class="fa fa-arrows-h"/> {{ format_money(predictedPrice.price.max) }}</div>
            </div>
            <div class="info-section margin-r-15">
              <div class="range-label"><span notranslate>M<sup>2</sup></span> Range</div>
              <div
                class="range-amount"
                notranslate>
                {{ format_money(predictedPrice.price.min / predictedModel.livingArea) }} <i class="fa fa-arrows-h"/> {{ format_money(predictedPrice.price.max / predictedModel.livingArea) }}
              </div>
            </div>
            <div
              class="info-section graph"
              style="">
              <div class="price-label">Confidence</div>
              <star-rating
                v-if="val(predictedPrice, pricepredictedPrice => pricepredictedPrice.price.confidence)"
                :no="Math.floor(predictedPrice.price.confidence * 100)"/>
            </div>
          </div>
        </div>
      </div>-->
      <div
        v-if="predictedPrice && predictedPrice.price"
        class="fancy-price fit-into-col">
        <div class="price-container bg-primary text-white">
          <div class="price-label">{{ getType(predictedModel.pricePredictionMethod) }} Price <span class="label label-default">{{ predictedModel.transactionType == 10 ? (getNameOfEnumValue('PricePredRentDealType', predictedModel.rentDealType) + ' rent') : 'Buy' }}</span></div>
          <div
            class="price-amount"
            notranslate>{{ format_money(predictedPrice.price.value) }}</div>
          <div
            class="price-smaller"
            notranslate>{{ format_money(predictedPrice.price.value / predictedModel.livingArea) }} / m<sup>2</sup></div>
          <div class="additional-info">
            <div class="info-section margin-r-15 margin-b-5">
              <div class="range-label">Price Range</div>
              <div
                class="range-amount"
                notranslate>{{ format_money(predictedPrice.price.min) }} <i class="fa fa-arrows-h"/> {{ format_money(predictedPrice.price.max) }}</div>
            </div>
            <div class="info-section margin-r-15">
              <div class="range-label"><span notranslate>M<sup>2</sup></span> Range</div>
              <div
                class="range-amount"
                notranslate>
                {{ format_money(predictedPrice.price.min / predictedModel.livingArea) }} <i class="fa fa-arrows-h"/> {{ format_money(predictedPrice.price.max / predictedModel.livingArea) }}
              </div>
            </div>
            <div
              class="info-section graph"
              style="">
              <div class="price-label">Confidence</div>
              <star-rating
                v-if="val(predictedPrice, pricepredictedPrice => pricepredictedPrice.price.confidence)"
                :no="Math.floor(predictedPrice.price.confidence * 100)"/>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="pubPredictedPrice && pubPredictedPrice.price"
        class="fancy-price fit-into-col">
        <div class="price-container bg-primary text-white">
          <div class="price-label">advertising Price <span class="label label-default">{{ predictedModel.transactionType == 10 ? 'Rent' : 'Buy' }}</span></div>
          <div
            class="price-amount"
            notranslate>{{ format_money(pubPredictedPrice.price.value) }}</div>
          <div
            class="price-smaller"
            notranslate>{{ format_money(pubPredictedPrice.price.value / predictedModel.livingArea) }} / m<sup>2</sup></div>
          <div class="additional-info">
            <div class="info-section margin-r-15 margin-b-5">
              <div class="range-label">Price Range</div>
              <div
                class="range-amount"
                notranslate>{{ format_money(pubPredictedPrice.price.min) }} <i class="fa fa-arrows-h"/> {{ format_money(pubPredictedPrice.price.max) }}</div>
            </div>
            <div class="info-section margin-r-15">
              <div class="range-label"><span notranslate>M<sup>2</sup></span> Range</div>
              <div
                class="range-amount"
                notranslate>
                {{ format_money(pubPredictedPrice.price.min / predictedModel.livingArea) }} <i class="fa fa-arrows-h"/> {{ format_money(pubPredictedPrice.price.max / predictedModel.livingArea) }}
              </div>
            </div>
            <div
              class="info-section graph"
              style="">
              <div class="price-label">Confidence</div>
              <star-rating
                v-if="val(pubPredictedPrice, pricepredictedPrice => pubPredictedPrice.price.confidence)"
                :no="Math.floor(pubPredictedPrice.price.confidence * 100)"/>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="!predictedPrice.price"
        class="sidebar-message-box">
        <div class="icon">
          <i class="fa fa-info-circle"/>
        </div>
        <div class="message">Price prediction is not possible for this address.</div>
      </div>
    </div>
    <!--<div class="data-section stand-out">
      <div class="section-label">
        <div class="label-copy">Competitor Prices</div>
        <div class="section-controls">
          <button class="btn btn-sm btn-default" type="button" @click="competitorAdd=!competitorAdd"><i class="fa fa-plus"></i></button>
        </div>
      </div>
      <div class="section-content">
        <div class="table-flex-col">
          <div class="table-col">
            <div class="flex-row">
              <div class="margin-r-10">12.02.2019</div>
              <div class="poperty-data font-w600">Wüest &amp; Partner</div>
              <div class="value-data"><small>CHF</small> 1 030 000 <i class="fa fa-arrow-circle-up text-success"></i></div>
            </div>
            <div class="flex-row">
              <div class="margin-r-10">12.02.2019</div>
              <div class="poperty-data font-w600">Fahrländer</div>
              <div class="value-data"><small>CHF</small> 1 190 000 <i class="fa fa-arrow-circle-down text-danger"></i></div>
            </div>
            <div class="flex-row" v-if="competitorOne">
              <div class="margin-r-10">12.02.2019</div>
              <div class="poperty-data font-w600">Iazi</div>
              <div class="value-data"><small>CHF</small> 1 050 000 <i class="fa fa-arrow-circle-up text-success"></i></div>
            </div>
            <div class="flex-row no-bg" v-if="competitorAdd">
              <div class="daterange-col simulate-form-control height32px margin-r-5 width100percent">
                <multiselect
                    v-model="competitors"
                    openDirection="bottom"
                    placeholder="Competitor"
                    :options="competitorsOptions"
                    :maxHeight="160"
                    :show-labels="false">
                </multiselect>
              </div>
              <div class="margin-r-5 width100percent">
                <div class="input-group">
                  <div class="input-group-btn">
                    <button type="button" class="btn btn-sm height32px btn-default dropdown-toggle" style="margin-right: -2px;" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">CHF <span class="caret"></span></button>
                    <ul class="dropdown-menu">
                      <li><a href="#">CHF</a></li>
                      <li><a href="#">EUR</a></li>
                    </ul>
                  </div>
                  <input class="form-control height32px input-sm" type="text" placeholder="Price" value="1 330 000">
                </div>
              </div>
              <div><button @click="competitorAdded()" class="btn btn-sm height32px btn-success" type="button">Add</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>-->
    <div class="data-section stand-out">
      <div class="section-label">
        <div class="label-copy">Similar Offers</div>
        <div class="section-controls">
          <div class="label-description">All prices in CHF.</div>
        </div>
      </div>
      <div class="section-content">
        <div class="col-table-container double-col">
          <div class="col-table">
            <div class="fluid-data-table flex-option">
              <div class="fluid-cell-wrap">
                <div class="fluid-cell head-cell head-primary">
                  <div
                    v-if="predictedAddress.zip && predictedAddress.locality"
                    class="attribute">
                    {{ predictedAddress.zip }} {{ predictedAddress.locality }}
                  </div>
                  <div
                    v-else
                    class="attribute">Locality</div>
                  <div class="value"/>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div
                    class="attribute">
                    Currently Online
                  </div>
                  <div
                    v-if="predictedPriceStats.locality.current"
                    class="value">
                    <span notranslate>{{ val(predictedPriceStats, item => item.locality.current.offersCount, "") }}</span> objects
                  </div>
                  <div
                    v-else
                    class="value"><span class="label label-bordered label-muted text-uppercase">No data</span></div>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div
                    class="attribute">
                    Median Price/m<span notranslate><sup>2</sup></span>
                  </div>
                  <div
                    v-if="val(predictedPriceStats, item => item.locality.current.avgPricePerSqrMeter.avg)"
                    class="value"
                    notranslate>
                    {{ val(predictedPriceStats, item => item.locality.current.avgPricePerSqrMeter.avg, val => format_money(val), "") }}
                  </div>
                  <div
                    v-else
                    class="value"><span class="label label-bordered label-muted text-uppercase">No data</span></div>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div
                    class="attribute">
                    Price range/<span notranslate>m<sup>2</sup></span>
                  </div>
                  <div
                    v-if="val(predictedPriceStats, item => item.locality.current.avgPricePerSqrMeter.min) || val(predictedPriceStats, item => item.locality.current.avgPricePerSqrMeter.max)"
                    class="value"
                    notranslate>
                    {{ val(predictedPriceStats, item => item.locality.current.avgPricePerSqrMeter.min, val => format_money(val), "") }} -
                    {{ val(predictedPriceStats, item => item.locality.current.avgPricePerSqrMeter.max, val => format_money(val), "") }}
                  </div>
                  <div
                    v-else
                    class="value"><span class="label label-bordered label-muted text-uppercase">No data</span></div>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div
                    class="attribute">
                    Last Month
                  </div>
                  <div
                    v-if="predictedPriceStats.locality.lastMonth"
                    class="value">
                    <span notranslate>{{ val(predictedPriceStats, item => item.locality.lastMonth.offersCount, "") }}</span> objects
                  </div>
                  <div
                    v-else
                    class="value"><span class="label label-bordered label-muted text-uppercase">No data</span></div>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div
                    class="attribute">
                    Median Price/m<span notranslate><sup>2</sup></span>
                  </div>
                  <div
                    v-if="val(predictedPriceStats, item => item.locality.lastMonth.avgPricePerSqrMeter.avg)"
                    class="value"
                    notranslate>
                    {{ val(predictedPriceStats, item => item.locality.lastMonth.avgPricePerSqrMeter.avg, val => format_money(val), "") }}
                  </div>
                  <div
                    v-else
                    class="value"><span class="label label-bordered label-muted text-uppercase">No data</span></div>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div
                    class="attribute">
                    Price range/<span notranslate>m<sup>2</sup></span>
                  </div>
                  <div
                    v-if="val(predictedPriceStats, item => item.locality.lastMonth.avgPricePerSqrMeter.min) || val(predictedPriceStats, item => item.locality.lastMonth.avgPricePerSqrMeter.max)"
                    class="value"
                    notranslate>
                    {{ val(predictedPriceStats, item => item.locality.lastMonth.avgPricePerSqrMeter.min, val => format_money(val), "") }} -
                    {{ val(predictedPriceStats, item => item.locality.lastMonth.avgPricePerSqrMeter.max, val => format_money(val), "") }}
                  </div>
                  <div
                    v-else
                    class="value"><span class="label label-bordered label-muted text-uppercase">No data</span></div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-table">
            <div class="fluid-data-table flex-option">
              <div class="fluid-cell-wrap">
                <div class="fluid-cell head-cell head-primary">
                  <div
                    v-if="predictedAddress.state"
                    class="attribute">
                    Canton <span notranslate>{{ predictedAddress.state }}</span>
                  </div>
                  <div
                    v-else
                    class="attribute">
                    Canton
                  </div>
                  <div class="value"/>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div
                    class="attribute">
                    Currently Online
                  </div>
                  <div
                    v-if="predictedPriceStats.state.current"
                    class="value">
                    <span notranslate>{{ val(predictedPriceStats, item => item.state.current.offersCount, "") }}</span> objects
                  </div>
                  <div
                    v-else
                    class="value"><span class="label label-bordered label-muted text-uppercase">No data</span></div>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div
                    class="attribute">
                    Median Price/m<span notranslate><sup>2</sup></span>
                  </div>
                  <div
                    v-if="val(predictedPriceStats, item => item.state.current.avgPricePerSqrMeter.avg)"
                    class="value"
                    notranslate>
                    {{ val(predictedPriceStats, item => item.state.current.avgPricePerSqrMeter.avg, val => format_money(val), "") }}
                  </div>
                  <div
                    v-else
                    class="value"><span class="label label-bordered label-muted text-uppercase">No data</span></div>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div
                    class="attribute">
                    Price range/<span notranslate>m<sup>2</sup></span>
                  </div>
                  <div
                    v-if="val(predictedPriceStats, item => item.state.current.avgPricePerSqrMeter.min) || val(predictedPriceStats, item => item.state.current.avgPricePerSqrMeter.max)"
                    class="value"
                    notranslate>
                    {{ val(predictedPriceStats, item => item.state.current.avgPricePerSqrMeter.min, val => format_money(val), "") }} -
                    {{ val(predictedPriceStats, item => item.state.current.avgPricePerSqrMeter.max, val => format_money(val), "") }}
                  </div>
                  <div
                    v-else
                    class="value"><span class="label label-bordered label-muted text-uppercase">No data</span></div>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div
                    class="attribute">
                    Last Month
                  </div>
                  <div
                    v-if="predictedPriceStats.state.lastMonth"
                    class="value">
                    <span notranslate>{{ val(predictedPriceStats, item => item.state.lastMonth.offersCount, "") }}</span> objects
                  </div>
                  <div
                    v-else
                    class="value"><span class="label label-bordered label-muted text-uppercase">No data</span></div>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div
                    class="attribute">
                    Median Price/<span notranslate>m<sup>2</sup></span>
                  </div>
                  <div
                    v-if="val(predictedPriceStats, item => item.state.lastMonth.avgPricePerSqrMeter.avg)"
                    class="value"
                    notranslate>
                    {{ val(predictedPriceStats, item => item.state.lastMonth.avgPricePerSqrMeter.avg, val => format_money(val), "") }}
                  </div>
                  <div
                    v-else
                    class="value"><span class="label label-bordered label-muted text-uppercase">No data</span></div>
                </div>
              </div>
              <div class="fluid-cell-wrap">
                <div class="fluid-cell">
                  <div
                    class="attribute">
                    Price range/<span notranslate>m<sup>2</sup></span>
                  </div>
                  <div
                    v-if="val(predictedPriceStats, item => item.state.lastMonth.avgPricePerSqrMeter.min) || val(predictedPriceStats, item => item.state.lastMonth.avgPricePerSqrMeter.max)"
                    class="value"
                    notranslate>
                    {{ val(predictedPriceStats, item => item.state.lastMonth.avgPricePerSqrMeter.min, val => format_money(val), "") }} -
                    {{ val(predictedPriceStats, item => item.state.lastMonth.avgPricePerSqrMeter.max, val => format_money(val), "") }}
                  </div>
                  <div
                    v-else
                    class="value"><span class="label label-bordered label-muted text-uppercase">No data</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="data-section stand-out">
      <div class="section-label">
        <div class="label-copy">Price History</div>
        <div class="section-controls">
          <div class="label-description">Minimum, average and maximum price of the last couple of months.</div>
        </div>
      </div>
      <div class="section-content">
        <div class="col-table-container double-col">
          <div class="col-table">
            <div class="fluid-data-table flex-option margin-b-0">
              <div class="fluid-cell-wrap">
                <div class="fluid-cell head-cell head-primary">
                  <div
                    v-if="predictedAddress.zip && predictedAddress.locality"
                    class="attribute">
                    {{ predictedAddress.zip }} {{ predictedAddress.locality }}
                  </div>
                  <div
                    v-else
                    class="attribute">Locality</div>
                  <div class="value"/>
                </div>
              </div>
            </div>
          </div>
          <div class="col-table">
            <div class="fluid-data-table flex-option margin-b-0">
              <div class="fluid-cell-wrap">
                <div class="fluid-cell head-cell head-primary">
                  <div
                    v-if="predictedAddress.state"
                    class="attribute">
                    Canton <span notranslate>{{ predictedAddress.state }}</span>
                  </div>
                  <div
                    v-else
                    class="attribute">
                    Canton
                  </div>
                  <div class="value"/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="table-flex-col">
          <div class="table-col">
            <div class="fancy-price">
              <div class="price-container bg-gray-light text-primary-dark">
                <div class="price-label">12 months Avg. Price</div>
                <div
                  v-if="val(predictedPriceStats, item => item.locality.last12Months.avgTotalPrice.avg)"
                  class="price-amount smaller-type"
                  notranslate>
                  {{ val(predictedPriceStats, item => item.locality.last12Months.avgTotalPrice.avg, val => format_money(val), "") }}
                </div>
                <div
                  v-else
                  class="no-data">
                  <span class="label label-bordered label-muted text-uppercase">No data</span>
                </div>
                <div class="additional-info">
                  <div class="info-section margin-r-15">
                    <div class="price-label">12 months Price Range</div>
                    <div
                      v-if="val(predictedPriceStats, item => item.locality.last12Months.avgTotalPrice.min) || val(predictedPriceStats, item => item.locality.last12Months.avgTotalPrice.max)"
                      class="range-amount"
                      notranslate>
                      {{ val(predictedPriceStats, item => item.locality.last12Months.avgTotalPrice.min, val => format_money(val), "") }}<i class="fa fa-arrows-h"/>{{ val(predictedPriceStats, item => item.locality.last12Months.avgTotalPrice.max, val => format_money(val), "") }}
                    </div>
                    <div
                      v-else
                      class="no-data">
                      <span class="label label-bordered label-muted text-uppercase">No data</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="fancy-price">
              <div class="price-container bg-gray-light text-primary-dark">
                <div class="price-label">24 months Avg. Price</div>
                <div
                  v-if="val(predictedPriceStats, item => item.locality.last24Months.avgTotalPrice.avg)"
                  class="price-amount smaller-type"
                  notranslate>
                  {{ val(predictedPriceStats, item => item.locality.last24Months.avgTotalPrice.avg, val => format_money(val), "") }}
                </div>
                <div
                  v-else
                  class="no-data">
                  <span class="label label-bordered label-muted text-uppercase">No data</span>
                </div>
                <div class="additional-info">
                  <div class="info-section margin-r-15">
                    <div class="price-label">24 months Price Range</div>
                    <div
                      v-if="val(predictedPriceStats, item => item.locality.last12Months.avgTotalPrice.min) || val(predictedPriceStats, item => item.locality.last12Months.avgTotalPrice.max)"
                      class="range-amount"
                      notranslate>
                      {{ val(predictedPriceStats, item => item.locality.last12Months.avgTotalPrice.min, val => format_money(val), "") }}<i class="fa fa-arrows-h"/>{{ val(predictedPriceStats, item => item.locality.last12Months.avgTotalPrice.max, val => format_money(val), "") }}
                    </div>
                    <div
                      v-else
                      class="no-data">
                      <span class="label label-bordered label-muted text-uppercase">No data</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="table-col">
            <div class="fancy-price">
              <div class="price-container bg-gray-light text-primary-dark">
                <div class="price-label">12 months Avg. Price</div>
                <div
                  v-if="val(predictedPriceStats, item => item.state.last12Months.avgTotalPrice.avg)"
                  class="price-amount smaller-type"
                  notranslate>
                  {{ val(predictedPriceStats, item => item.state.last12Months.avgTotalPrice.avg, val => format_money(val), "") }}
                </div>
                <div
                  v-else
                  class="no-data">
                  <span class="label label-bordered label-muted text-uppercase">No data</span>
                </div>
                <div class="additional-info">
                  <div class="info-section margin-r-15">
                    <div class="price-label">12 months Price Range</div>
                    <div
                      v-if="val(predictedPriceStats, item => item.state.last12Months.avgTotalPrice.min) || val(predictedPriceStats, item => item.state.last12Months.avgTotalPrice.max)"
                      class="range-amount"
                      notranslate>
                      {{ val(predictedPriceStats, item => item.state.last12Months.avgTotalPrice.min, val => format_money(val), "") }}<i class="fa fa-arrows-h"/>{{ val(predictedPriceStats, item => item.state.last12Months.avgTotalPrice.max, val => format_money(val), "") }}
                    </div>
                    <div
                      v-else
                      class="no-data">
                      <span class="label label-bordered label-muted text-uppercase">No data</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="fancy-price">
              <div class="price-container bg-gray-light text-primary-dark">
                <div class="price-label">24 months Avg. Price</div>
                <div
                  v-if="val(predictedPriceStats, item => item.state.last24Months.avgTotalPrice.avg)"
                  class="price-amount smaller-type"
                  notranslate>
                  {{ val(predictedPriceStats, item => item.state.last24Months.avgTotalPrice.avg, val => format_money(val), "") }}
                </div>
                <div
                  v-else
                  class="no-data">
                  <span class="label label-bordered label-muted text-uppercase">No data</span>
                </div>
                <div class="additional-info">
                  <div class="info-section margin-r-15">
                    <div class="price-label">24 months Price Range</div>
                    <div
                      v-if="val(predictedPriceStats, item => item.state.last24Months.avgTotalPrice.min) || val(predictedPriceStats, item => item.state.last24Months.avgTotalPrice.max)"
                      class="range-amount"
                      notranslate>
                      {{ val(predictedPriceStats, item => item.state.last24Months.avgTotalPrice.min, val => format_money(val), "") }}<i class="fa fa-arrows-h"/>{{ val(predictedPriceStats, item => item.state.last24Months.avgTotalPrice.max, val => format_money(val), "") }}
                    </div>
                    <div
                      v-else
                      class="no-data">
                      <span class="label label-bordered label-muted text-uppercase">No data</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="alphaFeature && val(predictedPriceStats, item => getTwo(item.locality.averagePrices.averageAnnualPriceChangePercentage))">
      <div
        class="fancy-header bg-primary">
        <div class="title alpha-feature feature-on-text"><i class="si si-graph"/> Price Trends</div>
        <div class="subtitle">Average annual price change: <span notranslate>{{ val(predictedPriceStats, item => getTwo(item.locality.averagePrices.averageAnnualPriceChangePercentage), 0) }}</span>%</div>
      </div>
      <div
        class="data-section stand-out">
        <div class="section-content">
          <div class="table-flex-col">
            <div class="table-col">
              <div class="flex-row">
                <div class="poperty-data">
                  Graph data presented in CHF per squere meter in <span notranslate><a href="#">{{ predictedAddress.state }}</a> (min({{ yearsMin }}) - max({{ yearsMax }}))</span>.
                </div>
              </div>
            </div>
            <div class="table-col col-smaller">
              <div class="plate-graph">
                <radial-progress-bar
                  :diameter="100"
                  :startColor="'#3e4a59'"
                  :stopColor="'#3e4a59'"
                  :strokeWidth="5"
                  :innerStrokeColor="'#ebebeb'"
                  :completed-steps="val(predictedPriceStats, item => item.locality.averagePrices.averageAnnualPriceChangePercentage, 0)"
                  :total-steps="100">
                  <span
                    class="radial-label"
                    notranslate>{{ val(predictedPriceStats, item => getTwo(item.locality.averagePrices.averageAnnualPriceChangePercentage), 0) }}%</span>
                </radial-progress-bar>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="priceTrendsChart && $store.getters['globalStatesModule/showNewFeatures']"
        class="data-section stand-out">
        <div class="section-content">
          <div class="section-label">
            <div class="label-copy">
              <span v-if="predictedAddress.zip && predictedAddress.locality">{{ predictedAddress.zip }} {{ predictedAddress.locality }}, </span>
              Locality Price Trends
            </div>
          </div>
          <div
            v-if="priceTrendsChart"
            class="margin-b-10">
            <line-chart
              :min="minVal"
              :max="maxVal"
              :data="chartDataLocality"
              :legend="false"
              thousands="'"/>
          </div>
          <div
            v-else
            class="margin-b-10 margin-t-10">
            <span
              class="label label-bordered label-muted text-uppercase"
              style="display: inline-block; width: 100%;">No data</span>
          </div>
        </div>
      </div>
      <div
        v-if="val(predictedPriceStats, item => item.locality.averagePrices.averageWeeksOnMarket)"
        class="fancy-header bg-primary margin-b-0">
        <div class="title alpha-feature feature-on-text"><i class="fa fa-calendar"/> <span notranslate>{{ val(predictedPriceStats, item => item.locality.averagePrices.averageWeeksOnMarket, "") }}</span> weeks</div>
        <div class="subtitle">Average time on the market</div>
      </div>
    </div>
  </div>
</template>
