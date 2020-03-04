<template>
  <div
    v-if="item"
    @click="neighborhoodPopover = false">
    <!-- Portals full screen chart -->
    <modal
      v-show="showPortalsFS"
      ref="modal"
      :bigModal="true"
      :modalShow="showPortalsFS">
      <template slot="close">
        <span class="margin-r-5"><i class="fa fa-square text-muted"/> Free</span>
        <span class="margin-r-5"><i class="fa fa-square text-primary"/> Paid</span>
        <span class="margin-r-5"><i class="fa fa-square text-danger"/> NonPublic</span>
        <span><i class="fa fa-square text-info"/> Unknown</span>
        <div
          ref="fullScreenTooltip"
          class="tooltip-cust">
          <div class="tooltip-cust__title">{{ activeTooltipData.title }}</div>
          <table>
            <tr>
              <th/>
              <th>Published</th>
              <th>Active</th>
              <th>Closed</th>
            </tr>
            <tr>
              <td><i class="fa fa-square text-muted"/></td>
              <td
                v-for="(free, fKey) in activeTooltipData.data.free"
                :key="fKey">{{ free }}</td>
            </tr>
            <tr>
              <td><i class="fa fa-square text-primary"/></td>
              <td
                v-for="(paid, PKey) in activeTooltipData.data.paid"
                :key="PKey">{{ paid }}</td>
            </tr>
            <tr>
              <td><i class="fa fa-square text-danger"/></td>
              <td
                v-for="(privateItem, PrKey) in activeTooltipData.data.private"
                :key="PrKey">{{ privateItem }}</td>
            </tr>
            <tr>
              <td><i class="fa fa-square text-info"/></td>
              <td
                v-for="(unknown, UKey) in activeTooltipData.data.unknown"
                :key="UKey">{{ unknown }}</td>
            </tr>
          </table>
        </div>
        <button
          class="btn btn-sm btn-default"
          @click="showPortalsFS = false;"><i class="fa fa-close"/></button>
      </template>
      <template slot="title">Portal history</template>
      <template slot="text">
        <div class="form-group margin-b-10 padding-t-10">
          <canvas
            id="fullScreenPortalsChart"
            height="150px"/>
        </div>
      </template>
    </modal>
    <!-- / Price full screen chart -->
    <modal
      v-show="showPriceFS"
      ref="modal"
      :bigModal="true"
      :modalShow="showPriceFS">
      <template slot="close">
        <button
          class="btn btn-sm btn-default"
          @click="showPriceFS = false;"><i class="fa fa-close"/></button>
      </template>
      <template slot="title">Price change</template>
      <template slot="text">
        <div class="form-group margin-b-10 padding-t-10">
          <canvas
            id="fullScreenPriceChart"
            height="150px"/>
        </div>
      </template>
    </modal>
    <modal
      v-show="showShareLinkModal"
      ref="modal"
      :bigModal="true"
      :modalShow="showShareLinkModal">
      <template slot="close">
        <button
          class="btn btn-sm btn-default"
          @click="showShareLinkModal = false;"><i class="fa fa-close"/></button>
      </template>
      <template slot="title">Ad link:</template>
      <template slot="text">
        <div class="form-group margin-b-10">
          {{ shareLink }}
        </div>
        <input
          ref="link"
          :value="shareLink"
          class="form-control"
          type="hidden">
      </template>
      <template slot="slot_actions">
        <button
          class="btn btn-sm btn-default"
          type="button"
          data-dismiss="modal"
          @click="showShareLinkModal = false">Cancel</button>
        <button
          class="btn btn-sm btn-primary"
          type="button"
          data-dismiss="modal"
          @click="copyToClipboard('link')">Copy to clipboard</button>
      </template>
    </modal>
    <modal
      v-show="$store.getters['searchModule/statusDBModal']"
      :onCloseModal="closeDBModal"
      :bigModal="true">
      <template slot="close">
        <button
          class="btn btn-sm btn-default"
          @click="closeDBModal()"><i class="fa fa-close"/></button>
      </template>
      <template slot="title">Decibel scale</template>
      <template slot="text">
        <div class="form-group margin-b-10 padding-b-10">
          <img
            :src="getGraph($store.getters['authStatesModule/lang'])"
            style="width: 100%;">
        </div>
      </template>
      <template slot="slot_actions">
        <button
          class="btn btn-sm btn-default"
          type="button"
          data-dismiss="modal"
          @click="closeDBModal()">Close</button>
      </template>
    </modal>
    <aside
      v-move
      id="sidebar-object-fixed"
      class="active sidebar-shadow double-panel-vb"> <!-- v-if="!loading" If we want to load sidebar after we load vendor info -->
      <div
        v-show="refresh"
        class="preloader">
        <i class="fa fa-circle-o-notch fa-spin"/>
      </div>
      <div class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <div>
                <i class="fa fa-building-o margin-r-5"/>
                <span
                  v-if="item.address.quality > 7"
                  notranslate
                  class="font-s15 font-w600">{{ displayAddress(item.address) }}</span>
                <span
                  v-if="item.address.quality > 5 && item.address.quality <= 7"
                  notranslate
                  class="font-s15 font-w600">{{ val(item, item => item.address.street + ",", "") }} {{ val(item, item => item.address.zip, "") }} {{ val(item, item => item.address.locality, "") }}, {{ val(item, item => item.address.stateShort, "") }}</span>
                <span
                  v-if="item.address.quality <= 5"
                  notranslate
                  class="font-s15 font-w600"> {{ val(item, item => item.address.zip, "") }} {{ val(item, item => item.address.locality, "") }}, {{ val(item, item => item.address.stateShort, "") }}</span>
              </div>
            </div>
          </div>
          <div class="controls">
            <div
              v-if="val(item, item => item.altAddresses)"
              class="btn-group margin-r-10"
              style="display: inline-block;">
              <button
                v-tooltip.bottom="{ content: 'Address Posibilites', delay: { show: 700, hide: 100 }}"
                type="button"
                class="btn btn-sm btn-default dropdown-toggle"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false">
                <i class="fa fa-caret-down"/>
              </button>
              <ul class="dropdown-menu dropdown-menu-right">
                <li class="dropdown-header font-s11">
                  Base Address <i
                    v-tooltip="'We are not sure about the result that is why we have address-possibilities. Click the Show-on-map button to see them all on the map'"
                    class="fa fa-info-circle"/>
                </li>
                <li><a href="#">{{ displayAddress(val(item, item => item.address)) }}</a></li>
                <li class="dropdown-header font-s11">Address Posibilites</li>
                <li
                  v-for="(address, addKey) in item.altAddresses"
                  :key="addKey"><a href="#">{{ displayAddress(address) }}</a></li>
                <li
                  v-show="alphaFeature"
                  style="padding: 4px 12px;">
                  <button
                    class="btn btn-block btn-xs btn-success alpha-feature feature-on-block"
                    type="button">Show all on map</button>
                </li>
              </ul>
            </div>
            <span v-if="countItems > 1 && showArrows">
              <button
                v-tooltip.bottom="{ content: 'Previous object', delay: { show: 700, hide: 100 }}"
                v-if="!notOnMap && (selectedIndex !== 0 || pageNum && pageNum !== 1)"
                class="btn btn-sm btn-default"
                type="button"
                @click="nextItem(false)">
                <i class="fa fa-arrow-left"/>
              </button>
              <button
                v-tooltip.bottom="{ content: 'Previous object', delay: { show: 700, hide: 100 }}"
                v-if="notOnMap && (selectedIndex !== 0 || pageNum2 !== 1)"
                class="btn btn-sm btn-default"
                type="button"
                @click="nextItem(false)">
                <i class="fa fa-arrow-left"/><br>
              </button>
              <button
                v-tooltip.bottom="{ content: 'Next object', delay: { show: 700, hide: 100 }}"
                v-if="$store.getters['globalStatesModule/nextItem']"
                class="btn btn-sm btn-default margin-r-10"
                type="button"
                @click="nextItem(true)">
                <i class="fa fa-arrow-right"/>
              </button>
            </span>
            <button
              v-tooltip.bottom="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
              class="btn btn-sm btn-default"
              @click="$emit('closeRightSidebar')">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <!-- Detail Toolbar -->
        <div
          class="data-section">
          <div class="section-label">
            <action-bar
              :item="item"
              :showMR="showMR"
              :detailView="true"
              @shareAdLink="shareAdLink"/>
          </div>
        </div>
        <!-- / Detail Toolbar -->
        <div class="control-panel">
          <div class="control-status">
            <span
              v-tooltip.top="{ content: 'Deal Type', delay: { show: 700, hide: 100 }}"
              class="label label-sm label-success">{{ getTransType(item.primaryInfo.basicInfo.transactionType) }}</span>
            <span
              v-tooltip.top="{ content: 'Ad Status', delay: { show: 700, hide: 100 }}"
              v-if="item.trackingInfo.publicationInterval.isActive"
              class="label label-sm label-success">On Market</span>
            <span
              v-tooltip.top="{ content: 'Ad Status', delay: { show: 700, hide: 100 }}"
              v-else
              class="label label-sm label-danger">Off Market</span>
            <span
              v-tooltip.top="{ content: 'From where does the address-quality comes from', delay: { show: 700, hide: 100 }}"
              v-if="val(item, item => item.altAddresses)"
              class="label label-warning">Address Confidence: <span>Possibilities</span></span>
            <template v-else>
              <span
                v-tooltip.top="{ content: 'From where does the address-quality comes from', delay: { show: 700, hide: 100 }}"
                v-if="val(item, item => item.address.confidence) === 10"
                class="label label-warning">Address Confidence: <span>Inferred</span></span>
              <span
                v-tooltip.top="{ content: 'From where does the address-quality comes from', delay: { show: 700, hide: 100 }}"
                v-if="val(item, item => item.address.confidence) === 1"
                class="label label-success">Address Confidence: <span>Source</span></span>
            </template>
            <span
              v-tooltip.top="{ content: 'Address Quality', delay: { show: 700, hide: 100 }}"
              class="label label-sm label-info">{{ getAddressQuality(item.address.quality) }}</span>
          </div>
          <div class="control-buttons">
            <!-- Uncoment when implemented -->
            <!-- <button class="btn btn-xs btn-link active"><i class="fa fa-star"></i></button>
              <button class="btn btn-xs btn-link"><i class="fa fa-thumbs-down"></i></button>
              <button class="btn btn-xs btn-link"><i class="fa fa-clock-o"></i></button>
              <button class="btn btn-xs btn-link"><i class="fa fa-home"></i></button>
              <button class="btn btn-xs btn-link"><i class="fa fa-exchange"></i></button>
              <button class="btn btn-xs btn-link"><i class="fa fa-close"></i></button> -->
            <!-- <label class="css-input css-checkbox css-checkbox-sm css-checkbox-rounded css-checkbox-success" v-tooltip="'Select for Email'">
                <input type="checkbox" ><span></span>
              </label> -->
          </div>
        </div>
        <ul class="flex-tabs list-unstyled">
          <li
            :class="{ 'active' : tabsProfile['showOverview']}"
            @click="showTabs('showOverview', tabsProfile)">
            <span>Overview</span>
          </li>
          <li
            :class="{ 'active' : tabsProfile['showHistory']}"
            @click="showTabs('showHistory', tabsProfile)">
            <span>
              <span
                v-if="val(item, item => item.trackingInfo.lastTotalPriceChange.totalPriceChangeType) === 2 || val(item, item => item.trackingInfo.lastTotalPriceChange.totalPriceChangeType) === 1"
                :class="{'icon-price-down text-success': val(item, item => item.trackingInfo.lastTotalPriceChange.totalPriceChangeType) === 2,
                         'icon-price-up text-danger': val(item, item => item.trackingInfo.lastTotalPriceChange.totalPriceChangeType) === 1}"/> History</span>
          </li>
          <li
            v-if="searchNeighborhood"
            :class="{ 'active' : tabsProfile['showNbr']}"
            @click="hasEnvInfo ? '' : showTabs('showNbr', tabsProfile)">
            <span>Neighborhood</span>
          </li>
          <li
            v-else
            :class="{ 'active' : tabsProfile['showNbr']}"
            @click.stop="neighborhoodPopover = !neighborhoodPopover">
            <span style="flex-grow: 0;">
              <v-popover
                :open="neighborhoodPopover"
                placement="left"
                trigger="manual">
                <template
                  v-if="empCtx"
                  slot="popover">
                  <popover
                    :bundle="'search'"
                    :feature="'neighbourhood'" />
                </template>
              </v-popover>
            </span>
            <span>Neighborhood</span>
          </li>
        </ul>
        <div
          class="detail-content">
          <div class="tab-content">
            <div
              :class="{ 'active' : tabsProfile['showOverview']}"
              class="tab-pane">
              <!-- Overview Tab -->
              <div>
                <div class="carousel-block" >
                  <vue-gallery
                    :images="pictures"
                    :index="index"
                    @close="closeFullScreen(index)"/>
                  <carousel
                    ref="cur"
                    :value="navigateTo"
                    :paginationEnabled="true"
                    :per-page="1"
                    :mouse-drag="false"
                    :spacePadding="0"
                    :paginationColor="'#ccc'"
                    :paginationActiveColor="'#5c90d2'"
                    :navigationEnabled="true"
                    @page-change="pageChanged">
                    <slide
                      v-for="(p, imageIndex) in pictures"
                      :key="imageIndex">
                      <div
                        :style="{ 'background-image': 'url(' + p + ')', 'width': '100%', 'height': '100%', 'background-size': '100%', 'background-repeat': 'no-repeat' }"
                        class="image"
                        @click="clickOnImg(imageIndex)">
                        <i
                          class="fa fa-expand"
                        />
                      </div>
                    </slide>
                  </carousel>
                </div>
                <!-- Building -->
                <div class="data-section stand-out padding-t-10 padding-b-10">
                  <span
                    notranslate
                    class="font-s15 font-w600">{{ item.primaryInfo.basicInfo.title }}</span>
                </div>
                <!-- Ad info (only for admins) -->
                <div class="data-section stand-out padding-t-10"> <!-- v-if="$store.getters['authStatesModule/userContext'] && ($store.getters['authStatesModule/userContext'].access.globalPermissions.agencies.create && $store.getters['authStatesModule/userContext'].access.globalPermissions.users.create)"> -->
                  <div class="section-label">
                    <div class="label-copy">Ad info</div>
                  </div>
                  <div class="section-content">
                    <div class="fluid-data-table flex-option">
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div class="attribute">
                            Id
                          </div>
                          <input
                            ref="itemId"
                            :value="item.id"
                            class="form-control"
                            type="hidden">
                          <div
                            class="value"
                            notranslate
                            adId
                            @click="copyToClipboard('itemId')">
                            {{ item.id }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="data-section stand-out">
                  <div class="section-label">
                    <div class="label-copy">Building</div>
                    <div class="section-controls">
                      <span
                        v-tooltip.top="{ content: 'Property Category', delay: { show: 700, hide: 100 }}"
                        v-if="item.primaryInfo.basicInfo.propertyCategory"
                        class="label label-success">{{ getMainCategory([item.primaryInfo.basicInfo.propertyCategory]) }}</span>
                      <span
                        v-tooltip.top="{ content: 'Property Type', delay: { show: 700, hide: 100 }}"
                        v-if="item.primaryInfo.basicInfo.propertyTypeId"
                        class="label label-default">{{ getMainCategory([], [item.primaryInfo.basicInfo.propertyTypeId]) }}</span>
                    </div>
                  </div>
                  <div class="section-content">
                    <div class="fluid-data-table flex-option two-col">
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Room/s
                          </div>
                          <div
                            class="value"
                            notranslate>
                            {{ val(item, item => item.primaryInfo.layout.rooms.roomCount, "") }}
                          </div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Living Area
                          </div>
                          <div
                            v-if="val(item, item => item.primaryInfo.layout.size.areaLiving)"
                            class="value"
                            notranslate>
                            {{ val(item, item => item.primaryInfo.layout.size.areaLiving, "") }} m<sup>2</sup>
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Property Area
                          </div>
                          <div
                            v-if="val(item, item => item.primaryInfo.layout.size.areaProperty)"
                            class="value"
                            notranslate>
                            {{ val(item, item => item.primaryInfo.layout.size.areaProperty, "") }} m<sup>2</sup>
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Usable Area
                          </div>
                          <div
                            v-if="val(item, item => item.primaryInfo.layout.size.areaUsable)"
                            class="value"
                            notranslate>
                            {{ val(item, item => item.primaryInfo.layout.size.areaUsable, "") }} m<sup>2</sup>
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Area
                          </div>
                          <div
                            v-if="val(item, item => item.primaryInfo.layout.size.areaCalculated)"
                            class="value"
                            notranslate>
                            {{ val(item, item => item.primaryInfo.layout.size.areaCalculated, "") }} m<sup>2</sup>
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Cubature
                          </div>
                          <div
                            v-if="val(item, item => item.primaryInfo.layout.size.cubature)"
                            class="value"
                            notranslate>
                            {{ val(item, item => item.primaryInfo.layout.size.cubature, "") }} m<sup>3</sup>
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Built Year
                          </div>
                          <div
                            v-if="val(item, item => item.primaryInfo.basicInfo.builtYearCalculated)"
                            class="value"
                            notranslate>
                            {{ val(item, item => item.primaryInfo.basicInfo.builtYearCalculated, "") }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Renovation Year
                          </div>
                          <div
                            v-if="val(item, item => item.primaryInfo.basicInfo.renovationYearCalculated)"
                            class="value"
                            notranslate>
                            {{ val(item, item => item.primaryInfo.basicInfo.renovationYearCalculated, "") }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Floor
                          </div>
                          <div
                            v-if="val(item, item => item.primaryInfo.location.floorNumber)"
                            class="value"
                            notranslate>
                            {{ val(item, item => item.primaryInfo.location.floorNumber, "") }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Total Floors
                          </div>
                          <div
                            v-if="val(item, item => item.primaryInfo.location.floorCount)"
                            class="value"
                            notranslate>
                            {{ val(item, item => item.primaryInfo.location.floorCount, "") }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Availability
                          </div>
                          <div
                            v-if="formatAvailableDate(item)"
                            class="value"
                            notranslate>
                            {{ formatAvailableDate(item) }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Deep link
                          </div>
                          <div
                            v-if="deepLink"
                            class="value"
                            notranslate>
                            <a
                              :href="`https://blueland.azurewebsites.net/?refreshed=${encodeURIComponent(deepLink)}`"
                              target="_blank">
                              <var notranslate>{{ cropText(deepLink) }}</var>
                            </a>
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Vendor -->
                <div class="data-section stand-out">
                  <div class="section-label">
                    <div class="label-copy">Vendor</div>
                  </div>
                  <div class="section-content">
                    <!-- N -->
                    <div class="fluid-data-table flex-option">
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Name
                          </div>
                          <div
                            v-if="getPersonName(val(item, item => item.trackingInfo.publisherCalculated.primaryInfo, ''))"
                            class="value"
                            notranslate>
                            {{ getPersonName(val(item, item => item.trackingInfo.publisherCalculated.primaryInfo, "")) }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Email
                          </div>
                          <div
                            v-if="val(item, item => item.trackingInfo.publisherCalculated.primaryInfo.contactInfo.emailAddresses[0])"
                            class="value"
                            notranslate>
                            {{ val(item, item => item.trackingInfo.publisherCalculated.primaryInfo.contactInfo.emailAddresses[0], "") }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Website
                          </div>
                          <div
                            v-if="val(item, item => item.trackingInfo.publisherCalculated.primaryInfo.contactInfo.websiteUrls)"
                            class="value"
                            notranslate>
                            <span class="padding-l-10">
                              <a
                                :href="`https://blueland.azurewebsites.net/?refreshed=${encodeURIComponent('https://' + item.trackingInfo.publisherCalculated.primaryInfo.contactInfo.websiteUrls[0])}`"
                                target="_blank">
                              <var notranslate>{{ cropText(item.trackingInfo.publisherCalculated.primaryInfo.contactInfo.websiteUrls[0]) }}</var></a>
                            </span>
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                    </div>
                    <div class="fluid-data-table flex-option two-col">
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Street
                          </div>
                          <div
                            v-if="val(item, item => item.trackingInfo.publisherCalculated.address.street)"
                            class="value"
                            notranslate>
                            {{ val(item, item => item.trackingInfo.publisherCalculated.address.street, "") }} {{ val(item, item => item.trackingInfo.publisherCalculated.address.streetNumber, "") }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Locality
                          </div>
                          <div
                            v-if="val(item, item => item.trackingInfo.publisherCalculated.address.zip) || val(item, item => item.trackingInfo.publisherCalculated.address.locality)"
                            class="value"
                            notranslate>
                            {{ val(item, item => item.trackingInfo.publisherCalculated.address.zip, "") }} {{ val(item, item => item.trackingInfo.publisherCalculated.address.locality, "") }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Mobile
                          </div>
                          <div
                            v-if="parsePhone(val(item, item => item.trackingInfo.publisherCalculated.primaryInfo.contactInfo.mobilePhoneNumbers[0], ''))"
                            class="value"
                            notranslate>
                            {{ parsePhone(val(item, item => item.trackingInfo.publisherCalculated.primaryInfo.contactInfo.mobilePhoneNumbers[0], "")) }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Land Line
                          </div>
                          <div
                            v-if="parsePhone(val(item, item => item.trackingInfo.publisherCalculated.primaryInfo.contactInfo.phoneNumbers[0], ''))"
                            class="value"
                            notranslate>
                            {{ parsePhone(val(item, item => item.trackingInfo.publisherCalculated.primaryInfo.contactInfo.phoneNumbers[0], "")) }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Classification
                          </div>
                          <div
                            class="value">
                            <span
                              v-if="val(item, item => item.trackingInfo.publisherClassCalculated) !== undefined"
                              class="label label-info"
                              notranslate>{{ getVendorClass(item.trackingInfo.publisherClassCalculated) }}</span>
                            <span
                              v-tooltip="'Ad is outside of your restricted area'"
                              v-else
                              style="opacity: 0.7"
                              class="label label-default">Not available</span>
                            <div
                              v-show="betaFeature"
                              class="btn-group dropup beta-feature feature-on-text">
                              <button
                                v-tooltip.left="{ content: 'Report incorrect classification', delay: { show: 700, hide: 100 }}"
                                type="button"
                                class="btn btn-xs btn-default dropdown-toggle"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false">
                                <i class="fa fa-exclamation"/>
                              </button>
                              <ul class="dropdown-menu dropdown-menu-right">
                                <li class="dropdown-header">Should be</li>
                                <li><a href="#">Professional</a></li>
                                <li><a href="#">Non-professional</a></li>
                                <!-- <li><a href="#">Uncertain</a></li> -->
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Price -->
                <div class="data-section stand-out">
                  <div class="section-label">
                    <div class="label-copy">Price</div>
                  </div>
                  <div class="section-content">
                    <div
                      v-if="val(item, item => item.financialInfo.rentalPrice.grossRentCalculated) ||
                        val(item, item => item.financialInfo.rentalPrice.netRentCalculated) ||
                      val(item, item => item.financialInfo.rentalPrice.sideCostCalculated)"
                      class="fluid-data-table flex-option two-col">
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Gross Rent
                          </div>
                          <div
                            v-if="val(item, item => item.financialInfo.rentalPrice.grossRentCalculated)"
                            class="value"
                            notranslate>
                            <template v-if="priceChangeType">
                              <span
                                v-tooltip.top="{ content: 'Price Decrease', delay: { show: 700, hide: 100 }}"
                                v-if="priceDecrease"
                                class="icon-price-down text-success"/>
                              <span
                                v-tooltip.top="{ content: 'Price Increase', delay: { show: 700, hide: 100 }}"
                                v-if="priceIncrease"
                                class="icon-price-up text-danger"/>
                              <span v-if="fromUnknownToKnown">
                                <i
                                  v-tooltip.top="{ content: 'Price Was Unknown', delay: { show: 700, hide: 100 }}"
                                  class="fa fa-area-chart" />
                              </span>
                            </template>
                            <small>{{ safeVal(item, item => item.financialInfo.currency.text, "CHF") }}</small> {{ val(item, item => item.financialInfo.rentalPrice.grossRentCalculated, item => formatPrice(item), "") }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Net Rent
                          </div>
                          <div
                            v-if="val(item, item => item.financialInfo.rentalPrice.netRentCalculated)"
                            class="value"
                            notranslate>
                            <small>{{ safeVal(item, item => item.financialInfo.currency.text, "CHF") }}</small> {{ val(item, item => item.financialInfo.rentalPrice.netRentCalculated, item => formatPrice(item), "") }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Side Cost
                          </div>
                          <div
                            v-if="val(item, item => item.financialInfo.rentalPrice.sideCostCalculated)"
                            class="value"
                            notranslate>
                            <small>{{ safeVal(item, item => item.financialInfo.currency.text, "CHF") }}</small> {{ val(item, item => item.financialInfo.rentalPrice.sideCostCalculated, item => formatPrice(item), "") }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                    </div>
                    <div
                      v-else
                      class="fluid-data-table flex-option two-col">
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Ad price
                          </div>
                          <div
                            v-if="val(item, item => item.financialInfo.totalPriceCalculated)"
                            class="value"
                            notranslate>
                            <template v-if="priceChangeType">
                              <span
                                v-tooltip.top="{ content: 'Price Decrease', delay: { show: 700, hide: 100 }}"
                                v-if="priceDecrease"
                                class="icon-price-down text-success"/>
                              <span
                                v-tooltip.top="{ content: 'Price Increase', delay: { show: 700, hide: 100 }}"
                                v-if="priceIncrease"
                                class="icon-price-up text-danger"/>
                              <span v-if="fromUnknownToKnown">
                                <i
                                  v-tooltip.top="{ content: 'Price Was Unknown', delay: { show: 700, hide: 100 }}"
                                  class="fa fa-area-chart" />
                              </span>
                            </template>
                            <small>{{ safeVal(item, item => item.financialInfo.currency.text, "CHF") }}</small> {{ val(item, item => item.financialInfo.totalPriceCalculated, item => formatPrice(item), "") }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                      <div class="fluid-cell-wrap">
                        <div class="fluid-cell">
                          <div
                            class="attribute">
                            Price<var notranslate>/m<sup>2</sup></var>
                          </div>
                          <div
                            v-if="val(item, item => item.financialInfo.pricePerSqrMeterCalculated)"
                            class="value"
                            notranslate>
                            <small>{{ safeVal(item, item => item.financialInfo.currency.text, "CHF") }}</small> {{ val(item, item => item.financialInfo.pricePerSqrMeterCalculated, item => formatPrice(item), "") }}
                          </div>
                          <div
                            v-else
                            class="value">&nbsp;</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Predicted Price -->
                <div class="data-section stand-out">
                  <div
                    class="section-label cursor-show"
                    @click.stop="ppSection=!ppSection">
                    <div class="label-copy">Predicted Price</div>
                    <div class="section-controls">
                      <button
                        v-tooltip.top="{ content: 'Toggle section', delay: { show: 700, hide: 100 }}"
                        v-if="basicPP"
                        class="btn btn-sm btn-default cursor-none"><i
                          :class="{'fa-angle-up' : ppSection, 'fa-angle-down' : !ppSection}"
                          class="fa"/></button>
                      <v-popover
                        v-else
                        class="popover-inline"
                        placement="top">
                        <button class="btn btn-sm btn-default">
                          <i class="fa fa-angle-down"/>
                        </button>
                        <template
                          v-if="empCtx"
                          slot="popover">
                          <popover
                            :bundle="'pricePredictor'"
                            :feature="'basic'" />
                        </template>
                      </v-popover>
                    </div>
                  </div>
                  <div
                    v-if="ppSection && basicPP"
                    class="section-content">
                    <div
                      v-if="pricePrediction && !loadingPP"
                      class="table-flex-col">
                      <template>
                        <div class="table-col">
                          <div class="price-block">
                            <div class="price-label">Predicted Price</div>
                            <span style="display: none" />
                            <div
                              notranslate
                              class="price-amount">{{ val(pricePrediction, pricePrediction => pricePrediction.price.value, item => formatPrice(item), "") }}</div>
                            <div
                              class=""
                              style="font-size: 10px; text-transform: uppercase; font-weight: 600; letter-spacing: .5px;">Confidence</div>
                            <!-- Star Rating -->
                            <star-rating
                              v-if="val(pricePrediction, pricePrediction => pricePrediction.price.confidence)"
                              :no="Math.floor(pricePrediction.price.confidence * 100)"/>
                              <!-- / Star Rating -->
                          </div>
                        </div>
                        <div
                          class="table-col"
                          style="padding-right: 10px; padding-left: 25px;">
                          <div class="fluid-data-table flex-option">
                            <div class="fluid-cell-wrap">
                              <div class="fluid-cell">
                                <div
                                  class="attribute">
                                  Min
                                </div>
                                <div
                                  class="value"
                                  notranslate>
                                  <small>{{ val(pricePrediction, pricePrediction => pricePrediction.price.currencyCode, "") }}</small> {{ val(pricePrediction, pricePrediction => pricePrediction.price.min, pricePrediction => formatPrice(pricePrediction), "") }}
                                </div>
                              </div>
                            </div>
                            <div class="fluid-cell-wrap">
                              <div class="fluid-cell">
                                <div
                                  class="attribute">
                                  Max
                                </div>
                                <div
                                  class="value"
                                  notranslate>
                                  <small>{{ val(pricePrediction, pricePrediction => pricePrediction.price.currencyCode, "") }}</small> {{ val(pricePrediction, pricePrediction => pricePrediction.price.max, pricePrediction => formatPrice(pricePrediction), "") }}
                                </div>
                              </div>
                            </div>
                            <div class="fluid-cell-wrap">
                              <div class="fluid-cell">
                                <div
                                  class="attribute">
                                  Difference to Ad
                                </div>
                                <div
                                  class="value"
                                  notranslate>
                                  <small
                                    v-if="val(pricePrediction, pricePrediction => pricePrediction.price.value) || val(item, item => item.financialInfo.totalPriceCalculated)">
                                  {{ val(pricePrediction, pricePrediction => pricePrediction.price.currencyCode, "") }}</small> {{ calculateDifference(val(pricePrediction, pricePrediction => pricePrediction.price.value, 0), val(item, item => item.financialInfo.totalPriceCalculated), 0) }}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>
                    </div>
                    <div
                      v-if="!pricePrediction && !loadingPP"
                      class="sidebar-message-box no-borders">
                      <div class="icon">
                        <i class="fa fa-info-circle"/>
                      </div>
                      <div class="message">Price is currently not predictable</div>
                    </div>
                  </div>
                </div>
                <!-- / Predicted Price -->
                <!-- <div v-if="loadingPP">
                  <div class="data-section stand-out">
                    <div class="section-label">
                      <div class="label-copy">
                        <i class="fa fa-circle-o-notch fa-spin"></i> Loading Price Prediciton...
                      </div>
                    </div>
                  </div>
                </div> -->

                <!-- Inhabitants -->
                <inhabitants :item="item"/>

                <!-- Owner -->
                <owners :item="item" />

                <!-- Description -->
                <div class="data-section stand-out">
                  <div
                    class="section-label cursor-show"
                    @click="itemDescription=!itemDescription">
                    <div class="label-copy">Description</div>
                    <div class="section-controls">
                      <button
                        v-tooltip.top="{ content: 'Toggle description', delay: { show: 700, hide: 100 }}"
                        class="btn btn-sm btn-default cursor-none"><i
                          :class="{'fa-angle-up' : itemDescription, 'fa-angle-down' : !itemDescription}"
                          class="fa"/></button>
                    </div>
                  </div>
                  <div
                    :class="{'minified': itemDescriptionMinified, 'hide-descr': !itemDescription}"
                    class="section-content font-s13">
                    <p
                      ref="descr"
                      notranslate>
                      <span
                        style="white-space: pre-line;"
                        v-html="description"/>
                    </p>
                  </div>
                  <button
                    v-tooltip.top="{ content: 'Expand/truncate text', delay: { show: 700, hide: 100 }}"
                    v-if="itemDescription && $refs.descr && $refs.descr.clientHeight >= 130"
                    class="btn btn-xs btn-block btn-default margin-t-5 margin-b-10"
                    type="button"
                    @click="itemDescriptionMinified=!itemDescriptionMinified">
                    <span v-if="itemDescriptionMinified">Expand</span>
                    <span v-else>Truncate</span>
                    <span v-if="itemDescriptionMinified"><i class="fa fa-angle-down"/></span>
                    <span v-else><i class="fa fa-angle-up"/></span>
                  </button>
                </div>
                <!-- / Description -->
                <!-- Documents -->
                <div class="data-section stand-out">
                  <div
                    class="section-label cursor-show"
                    @click="docSection=!docSection">
                    <div class="label-copy">Documents</div>
                    <div class="section-controls">
                      <button
                        v-tooltip.top="{ content: 'Toggle section', delay: { show: 700, hide: 100 }}"
                        class="btn btn-sm btn-default cursor-none"
                        type="button"><i
                          :class="{'fa-angle-up' : docSection, 'fa-angle-down' : !docSection}"
                          class="fa"/></button>
                    </div>
                  </div>
                  <template v-if="docSection">
                    <div
                      v-if="item.files"
                      class="section-content">
                      <div class="fluid-data-table flex-option">
                        <div
                          v-for="(doc, docIndex) in item.files"
                          :key="docIndex"
                          class="fluid-cell-wrap">
                          <div class="fluid-cell">
                            <div
                              class="attribute">
                              <a
                                :href="`http://axresources.azurewebsites.net/pdf/get/${doc.id}`"
                                target="_blank"><i class="fa fa-file-pdf-o text-primary-darker"/>
                                <var
                                  v-if="doc.title || doc.description"
                                  notranslate>{{ doc.title || doc.description }}.pdf</var>
                                <var v-else>Document1_{{ docIndex }}</var>
                              </a>
                            </div>
                            <div
                              class="value">
                              <a
                                :href="`http://axresources.azurewebsites.net/pdf/get/${doc.id}?download=true`"
                                notranslate
                                class="btn btn-xs btn-default"
                                target="_blank">Download</a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      v-else
                      class="sidebar-message-box no-borders">
                      <div class="icon">
                        <i class="fa fa-info-circle"/>
                      </div>
                      <div class="message">No documents available for this address</div>
                    </div>
                  </template>
                </div>
                <!-- / Documents -->
                <!-- Price comparison -->
                <div class="data-section stand-out">
                  <div class="section-label">
                    <div class="label-copy">Price comparison</div>
                  </div>
                  <div
                    v-if="!priceComparisonLoading && priceComparison"
                    class="section-content">
                    <div class="chart-block table-flex-col">
                      <div class="chart-instance padding-l-4 padding-r-4">
                        <div class="flex-row-header bg-default-lighter margin-b-10 text-center">Same Locality</div>
                        <radial-progress-bar
                          :diameter="100"
                          :startColor="'#5c90d2'"
                          :stopColor="'#5c90d2'"
                          :strokeWidth="5"
                          :innerStrokeColor="'#ebebeb'"
                          :completed-steps="calculatePercentege(priceComparison.locality, 'belowCount')"
                          :total-steps="100">
                          <span notranslate>{{ calculatePercentege(priceComparison.locality, 'belowCount') }}%</span>
                        </radial-progress-bar>
                        <div class="chart-label">
                          <div><var notranslate>{{ calculatePercentege(priceComparison.locality, 'belowCount') }}%</var> are cheaper</div>
                          <div><small class="text-muted"><var notranslate>{{ calculatePercentege(priceComparison.locality, 'aboveCount') }}%</var> are more expensive</small></div>
                        </div>
                      </div>
                      <div class="chart-instance padding-l-4 padding-r-4">
                        <div class="flex-row-header bg-default-lighter margin-b-10 text-center">Canton</div>
                        <radial-progress-bar
                          :diameter="100"
                          :startColor="'#5c90d2'"
                          :stopColor="'#5c90d2'"
                          :strokeWidth="5"
                          :innerStrokeColor="'#ebebeb'"
                          :completed-steps="calculatePercentege(priceComparison.state, 'belowCount')"
                          :total-steps="100">
                          <span notranslate>{{ calculatePercentege(priceComparison.state, 'belowCount') }}%</span>
                        </radial-progress-bar>
                        <div class="chart-label">
                          <div><var notranslate>{{ calculatePercentege(priceComparison.state, 'belowCount') }}%</var> are cheaper</div>
                          <div><small class="text-muted"><var notranslate>{{ calculatePercentege(priceComparison.state, 'aboveCount') }}%</var> are more expensive</small></div>
                        </div>
                      </div>
                      <div class="chart-instance padding-l-4 padding-r-4">
                        <div class="flex-row-header bg-default-lighter margin-b-10 text-center">Switzerland</div>
                        <radial-progress-bar
                          :diameter="100"
                          :startColor="'#5c90d2'"
                          :stopColor="'#5c90d2'"
                          :strokeWidth="5"
                          :innerStrokeColor="'#ebebeb'"
                          :completed-steps="calculatePercentege(priceComparison.country, 'belowCount')"
                          :total-steps="100">
                          <span notranslate>{{ calculatePercentege(priceComparison.country, 'belowCount') }}%</span>
                        </radial-progress-bar>
                        <div class="chart-label">
                          <div><var notranslate>{{ calculatePercentege(priceComparison.country, 'belowCount') }}%</var> are cheaper</div>
                          <div><small class="text-muted"><var notranslate>{{ calculatePercentege(priceComparison.country, 'aboveCount') }}%</var> are more expensive</small></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    v-else
                    class="value-data padding-t-10">
                    <span class="label label-bordered label-muted text-uppercase">No data</span>
                  </div>
                </div>
                <!-- Features -->
                <div class="data-section stand-out margin-b-10">
                  <div class="section-label">
                    <div class="label-copy">Features</div>
                  </div>
                  <div class="section-content">
                    <div class="feature-list">
                      <div
                        v-tooltip="formatName(o)"
                        v-for="(am, o, amKey) in item.primaryInfo.amenities"
                        v-if="am && am.value"
                        :key="amKey"
                        class="feature">
                        <i class="glyphicon text-default glyphicon-check"/>
                        {{ formatName(o) }}
                      </div>
                      <div
                        v-tooltip="'Eco friendly'"
                        v-if="val(item, item => item.primaryInfo.certification.isEcoFriendlyCalculated)"
                        class="feature">
                        <i class="glyphicon text-default glyphicon-check"/>
                        Eco friendly
                      </div>
                      <div
                        v-tooltip="'New building'"
                        v-if="val(item, item => item.primaryInfo.condition.isNewBuilding.value)"
                        class="feature">
                        <i class="glyphicon text-default glyphicon-check"/>
                        New building
                      </div>
                      <div
                        v-tooltip="'Wheelchair access'"
                        v-if="val(item, item => item.primaryInfo.facilities.hasWheelchairAccess.value)"
                        class="feature">
                        <i class="glyphicon text-default glyphicon-check"/>
                        Wheelchair access
                      </div>
                      <div
                        v-tooltip="'Elevator'"
                        v-if="val(item, item => item.primaryInfo.facilities.hasLift.value)"
                        class="feature">
                        <i class="glyphicon text-default glyphicon-check"/>
                        Elevator
                      </div>
                      <div
                        v-tooltip="'Balcony / terrace'"
                        v-if="val(item, item => item.primaryInfo.layout.spaces.hasBalcony.value)"
                        class="feature">
                        <i class="glyphicon text-default glyphicon-check"/>
                        Balcony / terrace
                      </div>
                      <div
                        v-tooltip="'Parking'"
                        v-if="val(item, item => item.primaryInfo.parkingInfo.hasParkingLot.value)"
                        class="feature">
                        <i class="glyphicon text-default glyphicon-check"/>
                        Parking
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- End Overview Tab -->
            </div>
            <div
              :class="{ 'active' : tabsProfile['showHistory']}"
              class="tab-pane">
              <history
                v-if="tabsProfile['showHistory']"
                :item="item"
                :showPortalsFS="showPortalsFS"
                :showPriceFS="showPriceFS"
                :activeTooltipData="activeTooltipData"
                @showFullScreenPortals="showFullScreenPortals"
                @showFullScreenPrice="showFullScreenPrice" />
            </div>
            <div
              :class="{ 'active' : tabsProfile['showNbr']}"
              class="tab-pane">
              <template v-if="item.address.quality === 8 || item.address.quality === 9">
                <neighborhood
                  :environmentInfo="environmentInfo"
                />
              </template>
              <div
                v-else>
                <div class="data-section">
                  <div class="sidebar-message-box no-borders">
                    <div class="icon">
                      <i class="fa fa-info-circle"/>
                    </div>
                    <div class="message">Address accuracy is too low to show neighborhood information.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
<script>
</script>
