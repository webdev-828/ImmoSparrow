<template>
  <div class="searchSidebar">
    <modal
      v-show="showExtendKmModal"
      ref="modal"
      :modalShow="showExtendKmModal">
      <template slot="close">
        <button
          class="btn btn-sm btn-default"
          @click="showExtendKmModal = false;"><i class="fa fa-close"/></button>
      </template>
      <template slot="title">Extend search in meters</template>
      <template slot="text">
        <div class="form-group margin-b-10">
          <form
            id="radiusForm"
            data-vv-scope="radiusForm"
            @submit.prevent="extendByKm('radiusForm')">
            <div
              :class="{'has-error': errors.has('radiusForm.extendBy')}"
              class="input-group"
            >
              <input
                v-validate="'required|min_value:1|max_value:10000'"
                v-number-input
                v-focus
                v-model="extendKm"
                name="extendBy"
                class="form-control"
                type="number"
                placeholder="Radius in meters"
                data-vv-scope="radiusForm"
                @keyup.enter="extendByKm('radiusForm')">
              <span class="input-group-addon">m</span>
            </div>
          </form>
        </div>
      </template>
      <template slot="slot_actions">
        <button
          class="btn btn-sm btn-default"
          type="button"
          data-dismiss="modal"
          @click="showExtendKmModal = false"> Cancel
        </button>
        <button
          :disabled="$store.getters['globalStatesModule/loadingButton']"
          class="btn btn-sm btn-primary"
          type="button"
          @click="extendByKm('radiusForm')">
          <i
            v-if="$store.getters['globalStatesModule/loadingButton']"
            class="fa fa-circle-o-notch fa-spin"/> Extend
        </button>
      </template>
    </modal>
    <!-- showAboModal -->
    <modal
      v-show="showAboModal"
      ref="modal"
      :modalShow="showAboModal"
      :bigModal="true">
      <template slot="close">
        <button
          class="btn btn-sm btn-default"
          @click="cloaseSearchAboModal()"><i class="fa fa-close"/></button>
      </template>
      <template slot="title">Save as search Abo</template>
      <template
        v-if="showAboModal"
        slot="text"
      >
        <search-abo
          :searchData="searchModel"
          :selectedSub="selectedSub"/>
      </template>
    </modal>
    <!-- / showAboModal -->

    <!-- showAboModal -->
    <!--<modal ref="modal" v-show="!showAboModal" :modalShow="showAboModal" :bigModal="true">
      <template slot="close">
        <button class="btn btn-sm btn-default" @click="showAboModal = false;"><i class="fa fa-close"></i></button>
      </template>
      <template slot="title">Information </template>
      <template slot="text">
        This feature FEATURE NAME is restricted to workspace area? <br /><br /> <i class="fa fa-info-circle"></i><a> Show my current workspace area.</a> <br> <br>
      </template>
    </modal>-->
    <!-- / showAboModal -->
    <aside
      id="side-overlay"
      :class="{'message-mode': agencyWorkspaceRestriction, 'blurredOut': !empCtx || !basicSearch, 'subscription-edit-mode': subEditMode}"
      class="active">
      <button
        v-tooltip.right="{ content: 'Toggle Sidebar', delay: { show: 700, hide: 100 }}"
        :disabled="$store.getters['globalStatesModule/loadingSearchResults']"
        class="back-button-extra btn btn-default pull-right side-overlay--button"
        type="button"
        @click="searchSidebarToggleIn(false)"><i class="arrow"/></button>
      <div class="pull-right side-overlay--button nav_h"><a
        v-tooltip.right="{ content: 'Search', delay: { show: 700, hide: 100 }}"
        :class="{active: tabs['search']}"
        class="btn"
        @click="$store.getters['globalStatesModule/loadingSearchResults'] ? '': toggle('search');"><span class="si si-magnifier"/></a>
        <br v-if="bookmarksHistory.length"><a
          v-tooltip.right="{ content: 'Bookmarks', delay: { show: 700, hide: 100 }}"
          v-if="bookmarksHistory.length"
          :class="{active: tabs['bookmarks']}"
          class="btn"
          @click="$store.getters['globalStatesModule/loadingSearchResults'] ? '': toggle('bookmarks')"><span class="si si-star"/></a>
        <br v-if="searchHistory.length"><a
          v-tooltip.right="{ content: 'History', delay: { show: 700, hide: 100 }}"
          v-if="searchHistory.length"
          :class="{active: tabs['history']}"
          class="btn"
          @click="$store.getters['globalStatesModule/loadingSearchResults'] ? '': toggle('history')"><span class="si si-clock"/></a>
        <br>
        <a
          v-tooltip.right="{ content: 'Abo', delay: { show: 700, hide: 100 }}"
          v-if="!$route.params.subId"
          :class="{active: tabs['abo']}"
          class="btn"
          @click="$store.getters['globalStatesModule/loadingSearchResults'] ? '': toggle('abo')"><span class="si si-bell"/></a>
        <br>
      </div>
      <!-- New Version -->
      <form
        v-show="tabs['search']"
        @submit.prevent="mapListSearch('profile_form')">
        <div
          v-if="$store.getters['searchStatesModule/addressLoading']"
          class="search-spinner">
          <i class="fa fa-circle-o-notch fa-spin"/>
        </div>
        <div
          :class="{'hidden':!tabs['search']}"
          class="side-panel">
          <div
            class="flex-head fancy-shadow"
            style="z-index: 6">
            <div class="detail-header header-as-col">
              <div class="title no-padding">
                <div class="centering-block full-width">
                  <div class="">
                    <div class="items_current">
                      <div class="param text-success">
                        <span class="allcaps">Total Ads</span><br>
                        <span notranslate>{{ counterItems.totalItemCount | currency }}</span>
                      </div>
                      <div
                        v-tooltip.top="{ content: currentBundleName, delay: { show: 700, hide: 100 }}"
                        class="param text-default">
                        <span
                          v-if="empCtx"
                          class="allcaps">
                          Your Bundle </span><br>
                        <span
                          notranslate
                          style="font-weight: 400;">
                          {{ bundleCounter | currency }}
                        </span>
                        <!-- <ul class="dropdown-menu fancy-shadow font-s13">
                          <li
                            v-for="(bundle, bKey) in counterItems.bundleTotalItemCounts"
                            :key="bKey"
                            class="dropdown-list-item with-upgrade-module">
                            <a
                              v-if="checkIfHigherBundle(bundle.count)"
                              href="#">
                              <var
                                notranslate
                                bundleNameAndCount>{{ bundle.bundle.name }}: {{ bundle.count | currency }}</var>
                            </a>
                            <div
                              v-else
                              class="upgrade-item">
                              <div class="item-title">
                                <var
                                  notranslate
                                  bundleNameAndCount>{{ bundle.bundle.name }}: {{ bundle.count | currency }}</var>
                              </div>
                              <div class="upgrade-label bg-info"><i class="fa fa-info"/>&nbsp;Upgrade</div>
                            </div>
                          </li>
                        </ul> -->
                      </div>
                      <div class="param">
                        <span class="allcaps">Currently</span><br>
                        <span notranslate>{{ counterItems.searchQueryItemCount | currency }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-show="agencyWorkspaceRestriction"
                ref="agencyWorkspaceRestriction"
                class="message-box">
                <div class="icon">
                  <i
                    v-tooltip.top="{ content: 'Search result will be restricted to the Agency/Employee-Restricted Area only', delay: { show: 700, hide: 100 }}"
                    class="fa fa-info-circle"/>
                </div>
                <div class="message">Your Query is restricted to Agency/Employee-Area</div>
              </div>
              <div
                v-if="subEditMode && selectedSub"
                class="edit-header">
                <div class="h-title" >Edit Subscription</div>
                <div
                  class="h-name"
                  notranslate>{{ selectedSub.name }}</div>
                <div class="h-controls">
                  <button
                    type="button"
                    class="btn btn-xs btn-default"
                    @click="exitEditMode()">Done</button>
                  <button
                    v-if="$route.params.subId"
                    type="submit"
                    class="btn btn-xs btn-default"
                    @click="switchSearchAbo = true">Update and Save</button>
                </div>
              </div>
            </div>
          </div>
          <div
            v-bar
            :class="{'edit-mode-frame': subEditMode}"
            class="flex-scroll">
            <div class="tab-content">
              <div class="tab-pane active">
                <div
                  class="side-panel">
                  <div
                    :class="{blur: !mapIsLoadedVar}"
                    class="data-section">
                    <div class="section-label" >
                      <div
                        id="searchSug"
                        class="label-copy">Add Location by</div>
                      <div class="section-controls">
                        <div class="btn-group">
                          <button
                            id="dropdownMenu1"
                            class="btn btn-sm btn-default dropdown-toggle"
                            type="button"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="true">
                            {{ interactWith[locationType] }}
                            <span class="caret"/>
                          </button>
                          <ul
                            v-if="mapIsLoadedVar"
                            class="dropdown-menu dropdown-menu-right fancy-shadow"
                            aria-labelledby="dropdownMenu1">
                            <li class="dropdown-list-item with-upgrade-module">
                              <a
                                v-if="searchAreaAddressParts"
                                href="#"
                                @click="showControl('Address', false, false)">Zip/Locality</a>
                              <upgrade-modal
                                v-else
                                :name="'Zip/Locality'"
                                :feature="'areaAddressPart'"/>
                            </li>
                            <li class="dropdown-list-item with-upgrade-module">
                              <a
                                v-if="searchTravelTime"
                                href="#"
                                @click="showControl('TravelTime', false, false, true)">Travel time</a>
                              <upgrade-modal
                                v-else
                                :name="'Travel time'"
                                :feature="'travelTime'"/>
                            </li>
                            <li class="dropdown-list-item with-upgrade-module">
                              <a
                                v-if="searchAreaAddressPartRadius"
                                href="#"
                                @click="showControl('Radius', false, 'draw_radius')">Radius</a>
                              <upgrade-modal
                                v-else
                                :name="'Radius'"
                                :feature="'areaAddressPartRadius'"/>
                            </li>
                            <li class="dropdown-list-item with-upgrade-module">
                              <a
                                v-if="searchAreaShape"
                                href="#"
                                @click="showControl('ManualDraw', false, 'draw_polygon')"><span class="">Manual Draw</span></a>
                              <upgrade-modal
                                v-else
                                :name="'Manual Draw'"
                                :feature="'areaAddressPartFromMap'"/>
                            </li>
                            <li class="dropdown-list-item with-upgrade-module">
                              <a
                                v-if="searchAreaViewport"
                                href="#"
                                @click="showControl('ViewPort', false, false)">Viewport</a>
                              <upgrade-modal
                                v-else
                                :name="'ViewPort'"
                                :feature="'areaViewport'"/>
                            </li>
                            <li
                              v-show="alphaFeature"
                              class="dropdown-list-item with-upgrade-module alpha-feature feature-on-block">
                              <button
                                :disabled="!employeeRestrictedArea"
                                :class="{ 'disabled': !employeeRestrictedArea }"
                                @click.prevent="restrictByArea">Restricted Area</button>
                            </li>
                            <li class="dropdown-header bg-gray-light">Polygon</li>
                            <li class="dropdown-list-item with-upgrade-module">
                              <a
                                v-if="searchAreaAddressPartFromMap"
                                href="#"
                                @click="showControl('po_localities', true, false)">Locality</a>
                              <upgrade-modal
                                v-else
                                :name="'Locality'"
                                :feature="'areaShape'"/>
                            </li>
                            <li class="dropdown-list-item with-upgrade-module">
                              <a
                                v-if="searchAreaAddressPartFromMap"
                                href="#"
                                @click="showControl('po_communes', true, false)">Commune</a>
                              <upgrade-modal
                                v-else
                                :name="'Commune'"
                                :feature="'areaShape'"/>
                            </li>
                            <li class="dropdown-list-item with-upgrade-module">
                              <a
                                v-if="searchAreaAddressPartFromMap"
                                href="#"
                                @click="showControl('po_districts', true, false)">District</a>
                              <upgrade-modal
                                v-else
                                :name="'District'"
                                :feature="'areaShape'"/>
                            </li>
                            <li class="dropdown-list-item with-upgrade-module">
                              <a
                                v-if="searchAreaAddressPartFromMap"
                                href="#"
                                @click="showControl('po_cantons', true, false)">Canton</a>
                              <upgrade-modal
                                v-else
                                :name="'Canton'"
                                :feature="'areaShape'"/>
                            </li>
                            <li class="dropdown-list-item with-upgrade-module">
                              <a
                                v-if="searchAreaAddressPartFromMap"
                                href="#"
                                @click="showControl('po_market_regions', true, false)">Market Region</a>
                              <upgrade-modal
                                v-else
                                :name="'Market Region'"
                                :feature="'areaShape'"/>
                            </li>
                            <li class="dropdown-list-item with-upgrade-module">
                              <a
                                v-if="searchAreaAddressPartFromMap"
                                href="#"
                                @click="showControl('po_ms_regions', true, false)">Ms Region</a>
                              <upgrade-modal
                                v-else
                                :name="'Ms Region'"
                                :feature="'areaShape'"/>
                            </li>
                          </ul>
                        </div>
                        <div
                          v-if="searchHistory.length && mapIsLoadedVar"
                          class="btn-group">
                          <button
                            v-tooltip.left="{ content: 'Load recent search', delay: { show: 700, hide: 100 }}"
                            type="button"
                            class="btn btn-sm btn-default dropdown-toggle"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false">
                            <i class="fa fa-history"/> <span class="caret"/>
                          </button>
                          <ul
                            class="dropdown-menu dropdown-menu-right"
                            style="width: 100%">
                            <li class="dropdown-header">Recent Searches</li>
                            <li
                              v-tooltip.bottom="{
                                content: parseGeneratedNameForEdit(searchHistory[0].name),
                                delay: { show: 700, hide: 100 },
                            }">
                              <a
                                style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden"
                                href="#"
                                @click="searchAgain(searchHistory[0])"
                                v-html="parseGeneratedName(searchHistory[0].name)"/>
                            </li>
                            <li>
                              <a
                                href="#"
                                @click.stop>
                                <label
                                  class="css-input switch switch-sm switch-success"
                                  style="margin: 0;">
                                  <input
                                    v-model="autoLoadHistory"
                                    type="checkbox"><span/> Auto Load
                                </label>
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="controls.Address"
                      class="section-content">
                      <div
                        :class="{'has-error': showLocalityRequired}"
                        class="form-group margin-b-10">
                        <div class="input-group">
                          <span class="input-group-addon input-icon"><i class="fa fa-map-marker"/></span>
                          <autocomplete
                            ref="autocomplete_search"
                            :disabled="!mapIsLoadedVar"
                            :placeholder="'Zip, City, Commune ...'"
                            :setData="setStreet"
                            :onSearch="getSearchSuggestions"
                            :itemHighlighted="'highlightedName'"
                            class="search-autocomp">
                            <template
                              slot="products"
                              slot-scope="{ item }">
                              <span class="suggestion_type">{{ get_icon(item.suggestionType) }}</span>
                            </template>
                          </autocomplete>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="!mapIsLoadedVar"
                    class="data-section"
                    style="position: absolute; top: 30px; left: 50%; font-size: 20px; margin-left: -25px;">
                    <i class="fa fa-circle-o-notch fa-spin"/>
                  </div>
                  <div
                    v-if="controls.TravelTime"
                    class="data-section">
                    <div class="section-label">
                      <!-- <div class="label-copy" v-if="markerGroupName != ''">{{markerGroupName}}</div>
                        <div class="label-copy" v-else v-on:click="setMarkerGroupName"><a>Edit name</a></div> -->
                      <div
                        v-if="editGroupName"
                        class="label-copy">
                        <input
                          id="editGroupName"
                          ref="markerGroupName"
                          :class="{error_focus: markerGroupName == ''}"
                          v-model="markerGroupName"
                          autofocus
                          class="input-sm form-control"
                          value="Marker Group 1"
                          @keydown.enter.prevent="markerGroupName !='' ? editGroupName = false : ''">
                      </div>
                      <div
                        v-else
                        class="label-copy">
                        <span v-if="markerGroupName == ''">Marker Group 1</span>
                        <span v-else>{{ markerGroupName }}</span>
                      </div>
                      <div class="section-controls">
                        <button
                          v-tooltip.top="{ content: 'Edit name', delay: { show: 700, hide: 100 }}"
                          v-if="!editGroupName"
                          :disabled="markerGroupName==''"
                          type="button"
                          class="btn btn-sm btn-default"
                          @click="editGroupName=!editGroupName">
                          <i class="fa fa-pencil"/>
                        </button>
                        <button
                          v-if="editGroupName"
                          type="button"
                          class="btn btn-sm btn-default"
                          @click="setMarkerGroupName">Set</button>
                        <button
                          v-tooltip.top="{ content: 'Remove marker', delay: { show: 700, hide: 100 }}"
                          v-for="(point, index) in points"
                          :key="point.id"
                          type="button"
                          class="btn btn-sm btn-default"
                          @click="removePoint(point.id, index)">
                          <i class="fa fa-trash"/>
                        </button>
                      </div>
                    </div>
                    <div class="section-content">
                      <!-- Marker 1 -->
                      <div
                        v-for="(point, index) in points"
                        :key="point.id"
                        class="marker-select-group">
                        <div class="options-section">
                          <div
                            :style="stc(point.color)"
                            class="marker-section">
                            <span
                              :style="stc(point.color)"
                              class="badge">{{ index + 1 }}</span>
                          </div>
                          <div class="dropdown">
                            <button
                              id="dropdownMenu2"
                              class="btn btn-block btn-sm btn-default dropdown-toggle"
                              type="button"
                              data-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="true">
                              <!--<i class="fa fa-train icon"></i>-->
                              <span
                                v-if="selectedPoints.indexOf(point.id) > -1"
                                class="option">
                                <span v-html="getIcon(by)"/>
                                <span>{{ travelTypes[point.id] }}</span>

                              </span>
                              <span
                                v-else
                                class="option">Transportation</span>
                              <span class="caret"/>
                            </button>
                            <ul
                              class="dropdown-menu fancy-shadow"
                              aria-labelledby="dropdownMenu2">
                              <li @click="selectType('Walk', point.id, point.color, 'walk')"><a href="#"><i class="fa fa-male"/> Walk</a></li>
                              <li @click="selectType('Bike', point.id, point.color, 'bike')"><a href="#"><i class="fa fa-bicycle"/> Bike</a></li>
                              <li @click="selectType('Car', point.id, point.color, 'car')"><a href="#"><i class="fa fa-car"/> Car</a></li>
                              <li @click="selectType('Transit', point.id, point.color, 'transit')"><a href="#"><i class="fa fa-train"/> Transit</a></li>
                            </ul>
                          </div>
                          <div class="dropdown">
                            <button
                              id="dropdownMenu3"
                              class="btn btn-block btn-sm btn-default dropdown-toggle"
                              type="button"
                              data-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="true">
                              <span
                                v-if="travelTimesValues.indexOf(point.id) > -1"
                                class="option">{{ travelTimes[point.id] }} min</span>
                              <span
                                v-else
                                class="option">Time</span>
                              <span class="caret"/>
                            </button>
                            <ul
                              class="dropdown-menu fancy-shadow"
                              aria-labelledby="dropdownMenu3">
                              <li @click="selectTravelTime(10, point.id, point.color)"><a href="#">10 min</a></li>
                              <li @click="selectTravelTime(15, point.id, point.color)"><a href="#">15 min</a></li>
                              <li @click="selectTravelTime(30, point.id, point.color)"><a href="#">30 min</a></li>
                              <li @click="selectTravelTime(45, point.id, point.color)"><a href="#">45 min</a></li>
                              <li @click="selectTravelTime(60, point.id, point.color)"><a href="#">60 min</a></li>
                              <!--<li v-if="by == 'transit'">
                                  <a>
                                  Max transfers<br><input class="form-control" style="font-size: 13px; width: 61%" type="text" placeholder="1 - 127"/>
                                  </a>
                                </li>-->
                            </ul>
                          </div>
                        </div>
                        <div
                          v-if="by == 'transit' || by == 'car'"
                          class="options-section">
                          <div class="flex-row">
                            <div class="col-50">
                              <label
                                class="css-input switch switch-sm switch-primary"
                                style="transform: translateY(1px); margin: 6px 0 0;">
                                <input
                                  v-model="rushHour"
                                  type="checkbox"><span/> Rush Hour
                              </label>
                            </div>
                            <div
                              v-show="by == 'transit'"
                              class="col-50"
                            >
                              <label>Start time</label>
                              <div>
                                <input
                                  v-time24-match
                                  v-model="rushHourStartTime"
                                  :class="{'has-error': rushHourStartTimeError}"
                                  class="input-sm form-control start-input"
                                  placeholder="HH:MM"
                                  @keydown.enter.prevent="updateTimeForTimeTravel">
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="controls">
                          <button
                            :disabled="isTravelTimeInvalid"
                            type="button"
                            class="btn btn-block btn-sm btn-default"
                            @click="groupTravelPolygons">
                            Add to List
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- View Port Section -->
                  <div
                    v-if="controls.ViewPort"
                    class="data-section">
                    <div
                      v-if="viewPort"
                      class="section-label">
                      <div
                        v-if="!viewPortNameEdit"
                        class="label-copy">
                        <span v-if="viewPort.name">{{ viewPort.name }}</span>
                        <span v-else>Viewport</span>
                      </div>
                      <div
                        v-else
                        class="label-copy margin-r-5">
                        <input
                          id="viewportName"
                          v-model="viewPort.name"
                          class="input-sm form-control"
                          @keydown.enter.prevent="viewPorts.unshift(viewPort); addViewPortToTheMap(viewPort); viewPort = {}; viewPortNameEdit = false;">
                      </div>
                      <div class="section-controls">
                        <button
                          v-tooltip.top="{ content: 'Edit name', delay: { show: 700, hide: 100 }}"
                          v-if="!viewPortNameEdit"
                          :disabled="!viewPort.polygon"
                          type="button"
                          class="btn btn-sm btn-default"
                          @click="viewPortNameEdit=true">
                          <i class="fa fa-pencil"/>
                        </button>
                        <button
                          v-else
                          type="button"
                          class="btn btn-sm btn-default"
                          @click="viewPortNameEdit=false">Set</button>
                      </div>
                    </div>
                    <div
                      v-if="viewPort"
                      class="section-content">
                      <button
                        :disabled="!viewPort.polygon"
                        type="button"
                        class="btn btn-block btn-sm btn-default margin-b-10"
                        @click="viewPorts.unshift(viewPort); addViewPortToTheMap(viewPort); viewPort = {}; viewPortNameEdit = false;"
                      >
                        Add to List
                      </button>
                    </div>
                  </div>
                  <!-- View Port Section end -->
                  <!-- ManualDraw Port Section -->
                  <div
                    v-if="controls.ManualDraw"
                    class="data-section">
                    <div class="section-label">
                      <div
                        v-if="!viewPortNameEdit"
                        class="label-copy">
                        <span v-if="currentShape.name">{{ currentShape.name }}</span>
                        <span v-else>Polygon name</span>
                      </div>
                      <div
                        v-else
                        class="label-copy margin-r-5">
                        <input
                          id="shapeName"
                          v-model="currentShape.name"
                          class="input-sm form-control"
                          @keydown.enter.prevent="addShapeToList(currentShape);
                                                  currentShape = {};
                                                  viewPortNameEdit = false;
                                                  showControl('ManualDraw', false, 'draw_polygon')">
                      </div>
                      <div class="section-controls">
                        <div v-if="!viewPortNameEdit">
                          <button
                            v-tooltip.top="{ content: 'Edit name', delay: { show: 700, hide: 100 }}"
                            :disabled="!currentShape.id"
                            type="button"
                            class="btn btn-sm btn-default"
                            @click="viewPortNameEdit=true">
                            <i class="fa fa-pencil"/>
                          </button>
                        </div>
                        <div v-else>
                          <button
                            type="button"
                            class="btn btn-sm btn-default"
                            @click="viewPortNameEdit=false">Set</button>
                          <button
                            v-tooltip.top="{ content: 'Remove polygon', delay: { show: 700, hide: 100 }}"
                            type="button"
                            class="btn btn-sm btn-default"
                            @click="
                              viewPortNameEdit=false;
                              $root.$emit('shape_removed', currentShape.id);
                              currentShape = {};
                              showControl('ManualDraw', false, 'draw_polygon')"><i class="fa fa-trash"/></button>
                        </div>
                      </div>
                    </div>
                    <div class="section-content" >
                      <button
                        :disabled="!currentShape.id || !currentShape.name"
                        type="button"
                        class="btn btn-block btn-sm btn-default margin-b-10"
                        @click="
                          addShapeToList(currentShape);
                          currentShape = {};
                          viewPortNameEdit = false;
                          showControl('ManualDraw', false, 'draw_polygon')"
                      >
                        Add to List
                      </button>
                    </div>
                  </div>
                  <!-- View ManualDraw Section end -->
                  <!-- Radius Section -->
                  <div
                    v-if="controls.Radius"
                    class="data-section">
                    <div class="section-label">
                      <div
                        v-if="!viewPortNameEdit"
                        class="label-copy">
                        <span v-if="currentShape.name">{{ currentShape.name }}</span>
                        <span v-else>radius name</span>
                      </div>
                      <div
                        v-else
                        class="label-copy margin-r-5">
                        <input
                          id="shapeName"
                          v-model="currentShape.name"
                          class="input-sm form-control"
                          @keydown.enter.prevent="
                            addShapeToList(currentShape);
                            currentShape = {};
                            viewPortNameEdit = false;
                            showControl('Radius', false, 'draw_radius')">
                      </div>
                      <!--<div class="section-controls">
                          <button v-bind:disabled="!currentShape.id" v-if="!viewPortNameEdit" @click="viewPortNameEdit=true" type="button" class="btn btn-sm btn-default"><i class="fa fa-pencil"></i></button>
                          <button v-else @click="viewPortNameEdit=false" type="button" class="btn btn-sm btn-default">Set</button>
                        </div>-->

                      <div class="section-controls">
                        <div v-if="!viewPortNameEdit">
                          <button
                            v-tooltip.top="{ content: 'Edit name', delay: { show: 700, hide: 100 }}"
                            :disabled="!currentShape.id"
                            type="button"
                            class="btn btn-sm btn-default"
                            @click="viewPortNameEdit=true">
                            <i class="fa fa-pencil"/>
                          </button>
                        </div>
                        <div v-else>
                          <button
                            type="button"
                            class="btn btn-sm btn-default"
                            @click="viewPortNameEdit=false">Set</button>
                          <button
                            v-tooltip.top="{ content: 'Remove radius', delay: { show: 700, hide: 100 }}"
                            type="button"
                            class="btn btn-sm btn-default"
                            @click="
                              viewPortNameEdit=false;
                              $root.$emit('shape_removed', currentShape.id);
                              currentShape = {};
                              showControl('Radius', false, 'draw_radius')"><i class="fa fa-trash"/></button>
                        </div>
                      </div>
                    </div>
                    <div class="section-content" >
                      <button
                        :disabled="!currentShape.id || !currentShape.name"
                        type="button"
                        class="btn btn-block btn-sm btn-default margin-b-10"
                        @click="
                          addShapeToList(currentShape);
                          currentShape = {};
                          viewPortNameEdit = false;
                          showControl('Radius', false, 'draw_radius')"
                      >
                        Add to List
                      </button>
                    </div>
                  </div>
                  <!-- Radius Section end -->
                  <div
                    v-if="searchModel.searchArea.addressParts.length || searchModel.searchArea.shapes.length"
                    class="data-section">
                    <div class="section-content padding-t-10">
                      <div class="margin-b-10">
                        <div
                          v-search-elements
                        >
                          <span
                            v-for="(address, index) in searchModel.searchArea.addressParts"
                            :style="'background-color:'+ address.color + '!important'"
                            :key="index"
                            notranslate
                            class="multiselect__tag">

                            <i
                              v-tooltip.top="'Extend in m.'"
                              v-if="address.type === 50"
                              aria-hidden="true"
                              tabindex="2"
                              class="fa fa-expand add_km"
                              @click="addKmToGeoObject(index)"/>
                            <i
                              aria-hidden="true"
                              tabindex="2"
                              class="fa fa-map-marker"/>
                            <span
                              v-tooltip.top="get_icon(address.type)"
                              v-if="address.type !== 70"
                              :style="'color:'+ address.color + '!important'"
                              class="iconbadge"
                              @click="removeAddressItem(address)">{{ get_icon(address.type) }}</span>
                            <span @click="removeAddressItem(address)"><i
                              aria-hidden="true"
                              tabindex="1"
                              notranslate
                              class="multiselect__tag-icon"/> {{ address.name }}</span>
                            <span
                              v-tooltip.top="'Remove km'"
                              v-show="address.radius"
                              class="km_hover"
                              @click="removeKmFromGeoObject(index)">+ {{ (address.radius/1000).toFixed(2) }}km</span>
                            <i
                              v-update-vtags
                              aria-hidden="true"
                              tabindex="1"
                              class="multiselect__tag-icon"
                              @click="removeAddressItem(address)"/>
                          </span>

                          <span
                            v-for="(shape, index) in searchModel.searchArea.shapes"
                            v-if="!shape.hasRadius"
                            :style="stc(shape.color)"
                            :key="shape.key"
                            class="multiselect__tag"
                            notranslate>
                            <!--<i
                              aria-hidden="true"
                              tabindex="2"
                              class="fa fa-expand add_km"
                              @mousedown="addKmToGeoObject(index, true)"
                            />-->
                            <i
                              v-if="!shape.icon"
                              aria-hidden="true"
                              tabindex="2"
                              class="fa fa-connectdevelop"
                            />
                            <span @click.stop="removeShape(shape.key, index)">
                              <span v-html="shape.icon"/>
                              <var
                                shapeName
                                notranslate>{{ shape.name }}</var>
                            </span>
                            <!--<span
                              v-show="shape.radius"
                              class="km_hover"
                              @mousedown="removeKmFromGeoObject(index, true)">+ {{ shape.radius }}km</span>-->
                            <i
                              v-update-vtags
                              aria-hidden="true"
                              tabindex="1"
                              class="multiselect__tag-icon"
                              @click="removeShape(shape.key, index)"/>
                          </span>
                          <!--<span notranslate v-for="(a, index) in shapes" class="multiselect__tag" v-bind:style="stc(a.color)"
                                  v-bind:key="a.name" v-on:click="remove_shape(a.id, index)"><span>{{a.name}}</span>
                              <i aria-hidden="true" tabindex="1" class="multiselect__tag-icon"></i>
                            </span>-->
                          <!--<span
                            v-for="(viewPort, index) in viewPorts"
                            :key="viewPort.id"
                            :style="'background-color:'+viewPort.color +'!important;'"
                            class="multiselect__tag" >
                            <i
                              aria-hidden="true"
                              tabindex="2"
                              class="fa fa-television"/>
                            <span
                              v-update-vtags
                              @click="viewPorts.splice(index, 1); removeFromTheMap(viewPort.id)">
                              <var
                                notranslate
                                viewportName>{{ viewPort.name }}</var>
                            </span>
                            <i
                              aria-hidden="true"
                              tabindex="1"
                              class="multiselect__tag-icon"/>
                            <i
                              v-update-vtags
                              aria-hidden="true"
                              tabindex="1"
                              class="multiselect__tag-icon"
                              @click="viewPorts.splice(index, 1);removeFromTheMap(viewPort.id)"/>
                          </span>-->
                        </div>

                        <div
                          class="tags_holder_helper">
                          <a
                            type="button"
                            class="btn btn-xs btn-default"><i class="fa fa-angle-down"/> Show <span class="numberOfHiddenElements" /></a>
                        </div>
                        <div
                          class="tags_holder_helper_less">
                          <a
                            type="button"
                            class="btn btn-xs btn-default"><i class="fa fa-angle-up"/> Show less</a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="showLocalityRequired"
                    :class="{'has-error': showLocalityRequired}"
                    style="margin-left: 20px;">
                    <div class="help-block req_error">Select Location to Search <i class="fa fa-arrow-circle-up"/></div>
                  </div>
                  <div class="data-section">
                    <div class="section-content">
                      <!-- buy/rent -->
                      <div class="form-group padding-t-20">
                        <div class="tabs-input">
                          <div class="input-tab">
                            <label class="css-input css-radio css-radio-primary">
                              <input
                                v-validate="'required'"
                                id="transactionTypeBuy"
                                v-model="searchModel.transactionType"
                                type="radio"
                                data-vv-scope="profile_form"
                                name="transaction type"
                                value="20"><span class="highlight-bar"/><span class="caption">Buy</span>
                            </label>
                          </div>
                          <div class="input-tab">
                            <label class="css-input css-radio css-radio-primary">
                              <input
                                id="transactionTypeRent"
                                v-model="searchModel.transactionType"
                                type="radio"
                                data-vv-scope="profile_form"
                                name="transaction type"
                                value="10"><span class="highlight-bar"/><span class="caption">Rent</span>
                            </label>
                          </div>
                        </div>
                      </div>
                      <!-- 2 -->
                      <div
                        :class="{'has-error': mainCategoryRequired}"
                        class="form-group">
                        <div class="input-group tamed-input-group">
                          <span class="input-group-addon input-icon"><i class="fa fa-home"/></span>
                          <multiselect
                            id="mainCat"
                            :custom-label="propLimitLabel"
                            :options="sortedMainCategories"
                            :group-select="false"
                            :multiple="false"
                            :limit="1"
                            :limit-text="limitText"
                            :taggable="true"
                            :show-labels="false"
                            :clear-on-select="true"
                            :close-on-select="true"
                            class=""
                            name="main category"
                            data-vv-scope="profile_form"
                            track-by="id"
                            openDirection="bottom"
                            placeholder="Property type"
                            @input="updateSelectedMainCategories"
                          />
                        </div>
                        <div class="">
                          <div
                            v-if="mainCategoryRequired"
                            class="help-block req_error">This field is required</div>
                        </div>
                      </div>
                      <div
                        v-if="selectedMainCategories.length"
                        class="form-group">
                        <div
                          v-hide-multiselect-elements
                          class="" >
                          <span
                            v-for="(a, index) in selectedMainCategories"
                            :key="index"
                            class="multiselect__tag"
                            @click="removeMainCategory(index)">
                            <span>{{ a.name }}</span>
                            <i
                              aria-hidden="true"
                              tabindex="1"
                              class="multiselect__tag-icon"/>
                          </span>
                        </div>
                        <div
                          v-remove-multi-tag-holder
                          class="tags_holder_helper">
                          <a
                            type="button"
                            class="btn btn-xs btn-default"><i class="fa fa-angle-down"/> Show <span/> hidden</a>
                        </div>
                        <div
                          v-show-multi-tag-holder
                          class="tags_holder_helper_less">
                          <a
                            type="button"
                            class="btn btn-xs btn-default"><i class="fa fa-angle-up"/> Show less</a>
                        </div>
                      </div>
                      <div class="form-group">
                        <div
                          v-if="selectedMainCategories.length"
                          class="margin-t-10">
                          <div class="input-group tamed-input-group">
                            <span class="input-group-addon input-icon"><i class="fa fa-binoculars"/></span>
                            <multiselect
                              :options="sortedSubCategories"
                              :show-labels="false"
                              :clear-on-select="true"
                              :multiple="false"
                              :limit="1"
                              :limit-text="limitText"
                              :taggable="true"
                              :close-on-select="true"
                              openDirection="bottom"
                              placeholder="Property sub types"
                              track-by="id"
                              label="name"
                              @input="updateSelectedSubCategories"
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        v-if="selectedSubCategories.length"
                        class="form-group">
                        <div
                          v-hide-multiselect-elements
                          class="" >
                          <span
                            v-for="(a, index) in selectedSubCategories"
                            :key="index"
                            class="multiselect__tag"
                            @click="removeSubCategory(index)">
                            <span>{{ a.name }}</span>
                            <i
                              aria-hidden="true"
                              tabindex="1"
                              class="multiselect__tag-icon"/>
                          </span>
                        </div>
                        <div
                          v-remove-multi-tag-holder
                          class="tags_holder_helper">
                          <a
                            type="button"
                            class="btn btn-xs btn-default"><i class="fa fa-angle-down"/> Show <span/> hidden</a>
                        </div>
                        <div
                          v-show-multi-tag-holder
                          class="tags_holder_helper_less">
                          <a
                            type="button"
                            class="btn btn-xs btn-default"><i class="fa fa-angle-up"/> Show less</a>
                        </div>
                      </div>
                      <!-- Price Range with inputs -->
                      <div
                        :class="{'has-error': errors.has('profile_form.priceMin') || errors.has('profile_form.priceMax')}"
                        class="form-group">
                        <div class="slider-with-inputs">
                          <label>Price Range<var notranslate>, CHF</var></label>
                          <div class="inputs-holder">
                            <div class="input-block">
                              <input
                                v-validate="{min_value: 0, max_value: 1000000000, isSmaller: (searchModel.price.min, searchModel.price.max) }"
                                v-number-input
                                key="priceMin"
                                v-model="searchModel.price.min"
                                class="v-input-number"
                                name="priceMin"
                                data-vv-scope="profile_form"
                                @keydown.enter="nextField('priceMax', $event)"
                              >
                              <!--<input-number
                                :nextInput="'priceSliderMax'"
                                :maxlength="9"
                                :name="'priceSliderMin'"
                                :min="0"
                                :max="1000000000"
                                :dval="''"
                                :ref="'priceSliderMin'"
                                :integer="false"
                                @invalidInput="invalidInput"
                                @onInputNumberChange="setPriceMin"/>-->
                            </div>
                            <div class="input-block">
                              <input
                                v-validate="{max_value: 1000000000, canNotBeZero: (searchModel.price.max) }"
                                v-number-input
                                key="priceMax"
                                v-model="searchModel.price.max"
                                class="v-input-number"
                                name="priceMax"
                                data-vv-scope="profile_form"
                                @keydown.enter="nextField('roomsMin', $event)"
                              >
                              <!--<input-number
                                :nextInput="'roomSliderMin'"
                                :maxlength="9"
                                :name="'priceSliderMax'"
                                :min="0"
                                :max="1000000000"
                                :dval="''"
                                :ref="'priceSliderMax'"
                                :integer="false"
                                @invalidInput="invalidInput"
                                @onInputNumberChange="setPriceMax"/>-->
                            </div>
                          </div>
                          <div
                            v-show="errors.has('profile_form.priceMax') || errors.has('profile_form.priceMin')"
                            class="help-block">{{
                            errors.first('profile_form.priceMax') || errors.first('profile_form.priceMin') }}
                          </div>
                          <div class="params-holder params-right">
                            <!--  <vue-slider v-model="priceSlider.value" @callback="updateSlider('priceSlider', 'price')" v-bind="priceSlider" v-on:input="$emit('input', $event)" tooltip="false" :enable-cross="false">
                              </vue-slider>
                              <div class="params-holder" v-if="priceSlider.dotSize">
                                <div class="param-block">
                                  {{priceSlider.min}}
                                </div>
                                <div class="param-block">
                                  {{priceSlider.max}}
                                </div>
                              </div>-->
                            <div
                              v-if="!errors.has('profile_form.priceMin') && !errors.has('profile_form.priceMax')"
                              class="param-block">
                              <span v-if="searchModel.price.min">{{ searchModel.price.min > 0 ? 'from chf ' : '' }}<var
                                price
                                notranslate>{{ searchModel.price.min > 0 ? formatPrice(searchModel.price.min) : '' }}</var></span>
                              <span v-if="searchModel.price.max">{{ searchModel.price.max ? 'to chf ' : '' }}<var
                                price
                                notranslate>{{ searchModel.price.max ? formatPrice(searchModel.price.max) : '' }}</var></span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- End Price Range with inputs -->
                      <!-- Number of Rooms with inputs -->
                      <div
                        :class="{'has-error': errors.has('profile_form.roomsMax') || errors.has('profile_form.roomsMin')}"
                        class="form-group">
                        <div class="slider-with-inputs">
                          <label>Number of Rooms</label>
                          <div class="inputs-holder">
                            <div class="input-block">
                              <input
                                v-validate="{min_value: 0, max_value: 9, isSmaller: (searchModel.roomCount.min, searchModel.roomCount.max) }"
                                v-number-input
                                key="roomsMin"
                                v-model="searchModel.roomCount.min"
                                :withStep5="true"
                                class="v-input-number"
                                name="roomsMin"
                                data-vv-scope="profile_form"
                                @keydown.enter="nextField('roomsMax', $event)"
                              >
                              <!--<input-number
                                :nextInput="'roomSliderMax'"
                                :maxlength="3"
                                :name="'roomSliderMin'"
                                :min="0"
                                :max="9"
                                :dval="''"
                                :ref="'roomSliderMin'"
                                :integer="false"
                                :step="0.5"
                                @invalidInput="invalidInput"
                                @onInputNumberChange="setRoomsMin"/>-->
                            </div>
                            <div class="input-block">
                              <input
                                v-validate="{canNotBeZero: (searchModel.roomCount.max), max_value: 9 }"
                                v-number-input
                                key="roomsMax"
                                v-model="searchModel.roomCount.max"
                                :withStep5="true"
                                class="v-input-number"
                                name="roomsMax"
                                data-vv-scope="profile_form"
                                @keydown.enter="nextField('livingAreaMin', $event)"
                              >
                              <!--<input-number
                                :nextInput="'livingSpaceSliderMin'"
                                :maxlength="3"
                                :name="'roomSliderMax'"
                                :min="0"
                                :max="9"
                                :dval="''"
                                :ref="'roomSliderMax'"
                                :integer="false"
                                :step="0.5"
                                @invalidInput="invalidInput"
                                @onInputNumberChange="setRoomsMax"/>-->
                            </div>
                          </div>
                          <div
                            v-show="errors.has('profile_form.roomsMax') || errors.has('profile_form.roomsMin')"
                            class="help-block">{{
                            errors.first('profile_form.roomsMax') || errors.first('profile_form.roomsMin') }}
                          </div>
                          <div class="params-holder params-right">
                            <div
                              v-if="!errors.has('profile_form.roomsMax') && !errors.has('profile_form.roomsMin')"
                              class="param-block">
                              <span v-if="searchModel.roomCount.min">{{ searchModel.roomCount.min > 0 ? 'from ' : '' }}<var
                                roomsCount
                                notranslate>{{ searchModel.roomCount.min >= 0 ? searchModel.roomCount.min : '' }}</var></span>
                              <span v-if="searchModel.roomCount.max">{{ searchModel.roomCount.max ? 'to ' : '' }}<var
                                roomsCount
                                notranslate>{{ searchModel.roomCount.max ? searchModel.roomCount.max : '' }}</var></span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- End Number of Rooms with inputs -->
                      <!-- Living space with inputs -->
                      <div
                        :class="{'has-error': errors.has('profile_form.livingAreaMax') || errors.has('profile_form.livingAreaMin')}"
                        class="form-group">
                        <div class="slider-with-inputs">
                          <label>Living Area (net)<var notranslate>, m<sup>2</sup></var></label>
                          <div class="inputs-holder">
                            <div class="input-block">
                              <input
                                v-validate="{min_value: 0, max_value: 100000, isSmaller: (searchModel.livingArea.min, searchModel.livingArea.max) }"
                                v-number-input
                                key="livingAreaMin"
                                v-model="searchModel.livingArea.min"
                                :withStep5="true"
                                class="v-input-number"
                                name="livingAreaMin"
                                data-vv-scope="profile_form"
                                @keydown.enter="nextField('livingAreaMax', $event)"
                              >
                              <!--<input-number
                                :nextInput="'livingSpaceSliderMax'"
                                :maxlength="5"
                                :name="'livingSpaceSliderMin'"
                                :min="0"
                                :max="100000"
                                :dval="''"
                                :ref="'livingSpaceSliderMin'"
                                :integer="false"
                                @invalidInput="invalidInput"
                                @onInputNumberChange="setLivingAreaMin"/>-->
                            </div>
                            <div class="input-block">
                              <!--<input-number
                                :nextInput="''"
                                :maxlength="5"
                                :name="'livingSpaceSliderMax'"
                                :min="0"
                                :max="100000"
                                :dval="''"
                                :ref="'livingSpaceSliderMax'"
                                :integer="false"
                                @invalidInput="invalidInput"
                                @onInputNumberChange="setLivingAreaMax"/>-->
                              <input
                                v-validate="{canNotBeZero: (searchModel.livingArea.max), max_value: 100000 }"
                                v-number-input
                                key="livingAreaMin"
                                v-model="searchModel.livingArea.max"
                                :withStep5="true"
                                class="v-input-number"
                                name="livingAreaMax"
                                data-vv-scope="profile_form"
                                @keydown.enter="nextField('builtYearMin', $event)">
                            </div>
                          </div>
                          <div
                            v-show="errors.has('profile_form.livingAreaMax') || errors.has('profile_form.livingAreaMin')"
                            class="help-block">{{
                            errors.first('profile_form.livingAreaMax') || errors.first('profile_form.livingAreaMin') }}
                          </div>
                          <div class="params-holder params-right">
                            <div
                              v-if="!errors.has('profile_form.livingAreaMin') && !errors.has('profile_form.livingAreaMax')"
                              class="param-block">
                              <span v-if="searchModel.livingArea.min">{{ searchModel.livingArea.min > 0 ? 'from ' : '' }}<var
                                v-if="searchModel.livingArea.min >= 0"
                                notranslate
                                livingArea>{{ searchModel.livingArea.min }}m<sup>2</sup></var></span>
                              <span v-if="searchModel.livingArea.max">{{ searchModel.livingArea.max ? 'to ' : '' }}<var
                                v-if="searchModel.livingArea.max >= 0"
                                notranslate
                                livingArea>{{ searchModel.livingArea.max }}m<sup>2</sup></var></span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- End Living space with inputs -->
                    </div>
                  </div>
                  <!-- More Options -->
                  <div class="data-section stand-out">
                    <div
                      class="section-label cursor-show"
                      @click="showMore=!showMore">
                      <div class="label-copy">More Options</div>
                      <div class="section-controls">
                        <a
                          v-tooltip.top="{ content: 'Toggle options', delay: { show: 700, hide: 100 }}"
                          type="button"
                          class="btn btn-sm btn-default cursor-none">
                          <i
                            :class="{'fa-angle-down' : showMore, 'fa-angle-up' : !showMore}"
                            class="fa"/>
                        </a>
                      </div>
                    </div>
                    <div
                      v-show="!showMore"
                      class="section-content">
                      <!-- Built Year with inputs -->
                      <div
                        :class="{'has-error': errors.has('profile_form.builtYearMin') || errors.has('profile_form.builtYearMax')}"
                        class="form-group">
                        <div class="slider-with-inputs">
                          <label>Built Year</label>
                          <div class="inputs-holder">

                            <div class="input-block">
                              <input
                                v-validate="{min_value: 1800, max_value: 9999, isSmaller: (searchModel.builtYear.min, searchModel.builtYear.max) }"
                                v-number-input
                                key="builtYearMin"
                                v-model="searchModel.builtYear.min"
                                class="v-input-number"
                                name="builtYearMin"
                                data-vv-scope="profile_form"
                                @keydown.enter="nextField('builtYearMax', $event)"
                              >
                            </div>
                            <div class="input-block">
                              <input
                                v-validate="{min_value: 1800, max_value: 9999 }"
                                v-number-input
                                key="builtYearMin"
                                v-model="searchModel.builtYear.max"
                                class="v-input-number"
                                name="builtYearMax"
                                data-vv-scope="profile_form"
                                @keydown.enter="nextField('areaMin', $event)"
                              >
                            </div>
                          </div>
                          <div
                            v-show="errors.has('profile_form.builtYearMin') || errors.has('profile_form.builtYearMax')"
                            class="help-block">{{
                            errors.first('profile_form.builtYearMin') || errors.first('profile_form.builtYearMax') }}
                          </div>
                          <div
                            v-if="!errors.has('profile_form.builtYearMin') && !errors.has('profile_form.builtYearMax')"
                            class="params-holder params-right">
                            <div class="param-block">
                              <span v-if="searchModel.builtYear.min">{{ searchModel.builtYear.min ? 'from ' : '' }}<var
                                notranslate
                                builtYear>{{ searchModel.builtYear.min ? searchModel.builtYear.min : '' }}</var></span>
                              <span v-if="searchModel.builtYear.max">{{ searchModel.builtYear.max ? 'to ' : '' }}<var
                                notranslate
                                builtYear>{{ searchModel.builtYear.max ? searchModel.builtYear.max : '' }}</var></span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- End Built Year with inputs -->
                      <!-- Property Area with inputs -->
                      <div
                        :class="{'has-error': errors.has('profile_form.areaMin') || errors.has('profile_form.areaMax')}"
                        class="form-group">
                        <div class="slider-with-inputs">
                          <label>Property Area, m<sup>2</sup></label>
                          <div class="inputs-holder">
                            <div class="input-block">

                              <input
                                v-validate="{min_value: 0, max_value: 100000, isSmaller: (searchModel.propertyArea.min, searchModel.propertyArea.max) }"
                                v-number-input
                                key="areaMin"
                                v-model="searchModel.propertyArea.min"
                                class="v-input-number"
                                name="areaMin"
                                data-vv-scope="profile_form"
                                @keydown.enter="nextField('areaMax', $event)"
                              >
                              <!--<input-number
                                :nextInput="'areaSliderMax'"
                                :maxlength="5"
                                :name="'areaSliderMin'"
                                :min="0"
                                :max="100000"
                                :dval="''"
                                :ref="'areaSliderMin'"
                                :integer="false"
                                @invalidInput="invalidInput"
                                @onInputNumberChange="setAreaMin"/>-->
                            </div>
                            <div class="input-block">
                              <input
                                v-validate="{canNotBeZero: (searchModel.propertyArea.max), max_value: 100000 }"
                                v-number-input
                                key="areaMax"
                                v-model="searchModel.propertyArea.max"
                                class="v-input-number"
                                name="areaMax"
                                data-vv-scope="profile_form"
                                @keydown.enter="nextField('usableAreaMin', $event)"
                              >
                              <!--<input-number
                                :nextInput="'usableAreaSliderMin'"
                                :maxlength="5"
                                :name="'areaSliderMax'"
                                :min="0"
                                :max="100000"
                                :dval="''"
                                :ref="'areaSliderMax'"
                                :integer="false"
                                @invalidInput="invalidInput"
                                @onInputNumberChange="setAreaMax"/>-->
                            </div>
                          </div>
                          <div
                            v-show="errors.has('profile_form.areaMin') || errors.has('profile_form.areaMax')"
                            class="help-block">{{
                            errors.first('profile_form.areaMax') || errors.first('profile_form.areaMin') }}
                          </div>
                          <div class="params-holder params-right">
                            <div
                              v-if="!errors.has('profile_form.areaMin') && !errors.has('profile_form.areaMax')"
                              class="param-block">
                              <span v-if="searchModel.propertyArea.min">{{ searchModel.propertyArea.min >= 0 ? 'from ' : '' }}<var
                                v-if="searchModel.propertyArea.min"
                                notranslate
                                propertyArea>{{ searchModel.propertyArea.min }}m<sup>2</sup></var></span>
                              <span v-if="searchModel.propertyArea.max">{{ searchModel.propertyArea.max ? 'to ' : '' }}<var
                                v-if="searchModel.propertyArea.max"
                                notranslate
                                propertyArea>{{ searchModel.propertyArea.max }}m<sup>2</sup></var></span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- End Property Area with inputs -->
                      <!-- Usable Area with inputs -->
                      <div
                        :class="{'has-error': errors.has('profile_form.usableAreaMin') || errors.has('profile_form.usableAreaMax')}"
                        class="form-group">
                        <div class="slider-with-inputs">
                          <label>Usable Area (net), m<sup>2</sup></label>
                          <div class="inputs-holder">
                            <div class="input-block">
                              <input
                                v-validate="{min_value: 0, max_value: 100000, isSmaller: (searchModel.usableArea.min, searchModel.usableArea.max) }"
                                v-number-input
                                key="usableAreaMin"
                                v-model="searchModel.usableArea.min"
                                class="v-input-number"
                                name="usableAreaMin"
                                data-vv-scope="profile_form"
                                @keydown.enter="nextField('usableAreaMax', $event)"
                              >
                              <!--<input-number
                                :nextInput="'usableAreaSliderMax'"
                                :maxlength="5"
                                :name="'usableAreaSliderMin'"
                                :min="0"
                                :max="100000"
                                :dval="''"
                                :ref="'usableAreaSliderMin'"
                                :integer="false"
                                @invalidInput="invalidInput"
                                @onInputNumberChange="setUsableAreaMin"/>-->
                            </div>
                            <div class="input-block">
                              <input
                                v-validate="{canNotBeZero: (searchModel.usableArea.max), max_value: 100000 }"
                                v-number-input
                                key="usableAreaMax"
                                v-model="searchModel.usableArea.max"
                                class="v-input-number"
                                name="usableAreaMax"
                                data-vv-scope="profile_form"
                              >
                              <!--<input-number
                                :nextInput="''"
                                :maxlength="5"
                                :name="'usableAreaSliderMax'"
                                :min="0"
                                :max="100000"
                                :dval="''"
                                :ref="'usableAreaSliderMax'"
                                :integer="false"
                                @invalidInput="invalidInput"
                                @onInputNumberChange="setUsableAreaMax"/>-->
                            </div>
                          </div>
                          <div
                            v-show="errors.has('profile_form.usableAreaMin') || errors.has('profile_form.usableAreaMax')"
                            class="help-block">{{
                            errors.first('profile_form.usableAreaMin') || errors.first('profile_form.usableAreaMax') }}
                          </div>
                          <div class="params-holder params-right">
                            <div
                              v-if="!errors.has('profile_form.usableAreaMin') && !errors.has('profile_form.usableAreaMax')"
                              class="param-block">
                              <span v-if="searchModel.usableArea.min">{{ searchModel.usableArea.min >= 0 ? 'from ' : '' }}<var
                                v-if="searchModel.usableArea.min"
                                notranslate
                                usableArea>{{ searchModel.usableArea.min }}m<sup>2</sup></var></span>
                              <span v-if="searchModel.usableArea.max">{{ searchModel.usableArea.max ? 'to ' : '' }}<var
                                v-if="searchModel.usableArea.max"
                                notranslate
                                usableArea>{{ searchModel.usableArea.max }}m<sup>2</sup></var></span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- End Usable Area with inputs -->
                      <div class="form-group">
                        <div class="row">
                          <div class="col-sm-12">
                            <label class="css-input switch switch-sm switch-primary">
                              <input
                                v-model="onlyPartereFloor"
                                type="checkbox"><span/> Only Ground Level
                            </label>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-sm-6 chbx-no-padding">
                            <label class="css-input css-checkbox css-checkbox-primary">
                              <input
                                v-model="searchModel.amenities.wheelchairAccess"
                                type="checkbox"><span/> Wheelchair access
                            </label>
                          </div>
                          <div class="col-sm-6 chbx-no-padding">
                            <label class="css-input css-checkbox css-checkbox-primary">
                              <input
                                v-model="searchModel.amenities.newBuilding"
                                type="checkbox"><span/> New building
                            </label>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-sm-6 chbx-no-padding">
                            <label class="css-input css-checkbox css-checkbox-primary">
                              <input
                                v-model="searchModel.amenities.balconyOrTerrace"
                                type="checkbox"><span/> Balcony / terrace
                            </label>
                          </div>
                          <div class="col-sm-6 chbx-no-padding">
                            <label class="css-input css-checkbox css-checkbox-primary">
                              <input
                                v-model="searchModel.amenities.elevator"
                                type="checkbox"><span/> Elevator
                            </label>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-sm-6 chbx-no-padding">
                            <label class="css-input css-checkbox css-checkbox-primary">
                              <input
                                v-model="searchModel.amenities.petsAllowed"
                                type="checkbox"><span/> Pets allowed
                            </label>
                          </div>
                          <div class="col-sm-6 chbx-no-padding">
                            <label class="css-input css-checkbox css-checkbox-primary">
                              <input
                                v-model="searchModel.amenities.parking"
                                type="checkbox"><span/> Parking
                            </label>
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-sm-6 chbx-no-padding">
                            <label class="css-input css-checkbox css-checkbox-primary">
                              <input
                                v-model="searchModel.amenities.childFriendly"
                                type="checkbox"><span/> Family friendly
                            </label>
                          </div>
                          <div class="col-sm-6 chbx-no-padding">
                            <label class="css-input css-checkbox css-checkbox-primary">
                              <input
                                v-model="searchModel.amenities.ecoFriendly"
                                type="checkbox"><span/> Ecologically
                            </label>
                          </div>
                        </div>
                      </div>
                      <div class="form-group">
                        <label
                          class="control-label"
                          for="example-datepicker1">Available from</label>
                        <div class="">
                          <datepicker
                            id="example-datepicker1"
                            :input-class="'form-control'"
                            :calendar-class="'rightside-datepicker'"
                            :typeable="false"
                            v-model="searchModel.availableDate.min"
                            :calendar-button-icon="'fa fa-calendar'"
                            :placeholder="'from'"/>
                        </div>
                      </div>
                      <div class="form-group">
                        <label
                          class="control-label"
                        >Publication date</label>
                        <div class="">
                          <div class="input-daterange input-group">
                            <datepicker
                              :input-class="'form-control'"
                              :typeable="false"
                              :calendar-class="'leftside-datepicker'"
                              :disabledDates="disabledDatesPubMin"
                              :highlighted="publicationHighlighated"
                              v-model="searchModel.publicationTime.min"
                              :placeholder="'from'"/>
                            <span class="input-group-addon"><i class="fa fa-chevron-right"/></span>
                            <datepicker
                              :input-class="'form-control'"
                              :typeable="false"
                              :disabledDates="disabledDatesPubMax"
                              :calendar-class="'rightside-datepicker'"
                              v-model="searchModel.publicationTime.max"
                              :highlighted="publicationHighlighated"
                              :placeholder="'to'"/>
                          </div>
                        </div>
                      </div>
                      <div
                        v-show="betaFeature"
                        class="form-group">
                        <div class="">
                          <div class="input-group tamed-input-group beta-feature feature-on-block">
                            <span class="input-group-addon input-icon"><i class="fa fa-home"/></span>
                            <v-popover
                              v-if="!searchSites"
                              style="display: grid !important; cursor: pointer;"
                              offset="0"
                              placement="top">
                              <input
                                disabled
                                class="form-control"
                                placeholder="Real Estate Portal">
                              <template
                                slot="popover">
                                <popover
                                  :bundle="'search'"
                                  :feature="'sites'" />
                              </template>
                            </v-popover>
                            <multiselect
                              v-else
                              ref="a"
                              :options="sortedRealEstateOptions"
                              :show-labels="false"
                              :clear-on-select="true"
                              :multiple="false"
                              :limit="1"
                              :limit-text="limitText"
                              :taggable="true"
                              :close-on-select="true"
                              class="zindex10"
                              openDirection="bottom"
                              placeholder="Real Estate Portal"
                              track-by="id"
                              label="name"
                              @input="updateSelectedPortals"
                            >
                              <template
                                slot="singleLabel"
                                slot-scope="props">
                                <div notranslate>{{ props.option.name }}</div>
                              </template>
                              <template
                                slot="option"
                                slot-scope="props">
                                <div notranslate>{{ props.option.name }}</div>
                              </template>
                            </multiselect>
                          </div>
                        </div>
                      </div>
                      <div
                        v-if="selectedRealEstateOptions.length"
                        class="form-group">
                        <div
                          v-hide-multiselect-elements
                          class="" >
                          <span
                            v-for="(a, index) in selectedRealEstateOptions"
                            :key="index"
                            class="multiselect__tag"
                            @click="removeRealEstatePortal(index)">
                            <span notranslate>{{ a.name }}</span>
                            <i
                              aria-hidden="true"
                              tabindex="1"
                              class="multiselect__tag-icon"/>
                          </span>
                        </div>
                        <div
                          v-remove-multi-tag-holder
                          class="tags_holder_helper">
                          <a
                            type="button"
                            class="btn btn-xs btn-default"><i class="fa fa-angle-down"/> Show <span/> hidden</a>
                        </div>
                        <div
                          v-show-multi-tag-holder
                          class="tags_holder_helper_less">
                          <a
                            type="button"
                            class="btn btn-xs btn-default"><i class="fa fa-angle-up"/> Show less</a>
                        </div>
                      </div>
                      <div
                        class="form-group">
                        <div class="">
                          <div class="input-group tamed-input-group">
                            <span class="input-group-addon input-icon"><i class="icon-vendor"/></span>
                            <v-popover
                              v-if="!searchPublisherClasses"
                              style="display: grid !important; cursor: pointer;"
                              offset="0"
                              placement="top">
                              <input
                                disabled
                                class="form-control"
                                placeholder="Vendor classification">
                              <template
                                slot="popover">
                                <popover
                                  :bundle="'search'"
                                  :feature="'publisherClasses'" />
                              </template>
                            </v-popover>
                            <multiselect
                              v-else
                              id="vendor"
                              :options="sortedVendorOptions"
                              :show-labels="false"
                              :clear-on-select="true"
                              :multiple="false"
                              :limit="1"
                              :limit-text="limitText"
                              :taggable="true"
                              :close-on-select="true"
                              style="cursor: pointer;"
                              openDirection="bottom"
                              placeholder="Vendor classification"
                              track-by="value"
                              label="text"
                              @input="updateSelectedVendors"
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        v-if="selectedVendors.length"
                        class="form-group">
                        <div
                          v-hide-multiselect-elements
                          class="" >
                          <span
                            v-for="(a, index) in selectedVendors"
                            :key="index"
                            class="multiselect__tag"
                            @click="removeVendor(index)">
                            <span>{{ a.text }}</span>
                            <i
                              aria-hidden="true"
                              tabindex="1"
                              class="multiselect__tag-icon"/>
                          </span>
                        </div>
                        <div
                          v-remove-multi-tag-holder
                          class="tags_holder_helper">
                          <a
                            type="button"
                            class="btn btn-xs btn-default"><i class="fa fa-angle-down"/> Show <span/> hidden</a>
                        </div>
                        <div
                          v-show-multi-tag-holder
                          class="tags_holder_helper_less">
                          <a
                            type="button"
                            class="btn btn-xs btn-default"><i class="fa fa-angle-up"/> Show less</a>
                        </div>
                      </div>
                      <div
                        v-show="alphaFeature"
                        class="form-group">
                        <div class="">
                          <div class="input-group tamed-input-group alpha-feature feature-on-block">
                            <span class="input-group-addon input-icon"><i class="fa fa-group"/></span>
                            <v-popover
                              v-if="!searchPublishers"
                              style="display: grid !important; cursor: pointer;"
                              offset="0"
                              placement="top">
                              <input
                                disabled
                                class="form-control"
                                placeholder="Competitors">
                              <template
                                slot="popover">
                                <popover
                                  :bundle="'search'"
                                  :feature="'publishers'" />
                              </template>
                            </v-popover>
                            <multiselect
                              v-else
                              id="competitor"
                              :disabled="!searchPublishers"
                              :options="competitorOptions"
                              :show-labels="false"
                              :clear-on-select="true"
                              :multiple="false"
                              :limit="1"
                              :limit-text="limitText"
                              :taggable="true"
                              :close-on-select="true"
                              openDirection="bottom"
                              placeholder="Competitors"
                              track-by="id"
                              label="name"
                              @input="updateSelectedCompetitors"
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        v-if="selectedCompetitors.length"
                        class="form-group">
                        <div
                          v-hide-multiselect-elements
                          class="" >
                          <span
                            v-for="(a, index) in selectedCompetitors"
                            :key="index"
                            class="multiselect__tag"
                            @click="removeCompetitor(index)">
                            <span>{{ a.name }}</span>
                            <i
                              aria-hidden="true"
                              tabindex="1"
                              class="multiselect__tag-icon"/>
                          </span>
                        </div>
                        <div
                          v-remove-multi-tag-holder
                          class="tags_holder_helper">
                          <a
                            type="button"
                            class="btn btn-xs btn-default"><i class="fa fa-angle-down"/> Show <span/> hidden</a>
                        </div>
                        <div
                          v-show-multi-tag-holder
                          class="tags_holder_helper_less">
                          <a
                            type="button"
                            class="btn btn-xs btn-default"><i class="fa fa-angle-up"/> Show less</a>
                        </div>
                      </div>
                      <div class="form-group">
                        <div class="">
                          <label
                            class="css-input switch switch-sm switch-primary"
                            @click="showHisPopover = true">
                            <input
                              :disabled="!searchPublicationStatuses"
                              v-model="historicAds"
                              type="checkbox"><span/> Include historic ads
                          </label>
                          <v-popover
                            v-if="!searchPublicationStatuses"
                            :open="showHisPopover"
                            class="popover-inline"
                            placement="top"
                            @auto-hide="showHisPopover = false">
                            <template
                              slot="popover">
                              <popover
                                :bundle="'search'"
                                :feature="'publicationStatuses'" />
                            </template>
                          </v-popover>
                        </div>
                        <div
                          v-if="historicAds && searchPublicationStatuses"
                          class="">
                          <div class="row">
                            <div class="col-md-6">
                              <label
                                class="control-label text-left"
                              >From</label>
                              <div class="input-group tamed-input-group">
                                <datepicker
                                  :input-class="'form-control'"
                                  :typeable="false"
                                  :disabledDates="disabledDatesHisMin"
                                  :calendar-class="'leftside-datepicker'"
                                  :minimumView="'year'"
                                  :initialView="'year'"
                                  v-model="searchModel.inactivePublicationTime.min"
                                  :placeholder="'from'"
                                  format="yyyy"/>
                              </div>
                            </div>
                            <div class="col-md-6">
                              <label
                                class="control-label text-left"
                              >To</label>
                              <div class="input-group tamed-input-group">
                                <datepicker
                                  :input-class="'form-control'"
                                  :typeable="false"
                                  :disabledDates="disabledDatesHisMax"
                                  :calendar-class="'rightside-datepicker'"
                                  :minimumView="'year'"
                                  :initialView="'year'"
                                  v-model="searchModel.inactivePublicationTime.max"
                                  :placeholder="'to'"
                                  format="yyyy"/>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="form-group">
                        <div class="">
                          <label class="css-input switch switch-sm switch-primary">
                            <input
                              v-model="searchModel.hasPictures"
                              type="checkbox"><span/> Only ads with images
                          </label>
                        </div>
                      </div>
                      <div class="form-group">
                        <div class="">
                          <label
                            class="css-input switch switch-sm switch-primary"
                            @click="showInhPopover = true">
                            <input
                              :disabled="!searchInhabitantsInfo"
                              v-model="searchModel.hasKnownInhabitants"
                              type="checkbox"><span/> Only with known inhabitants
                          </label>
                          <v-popover
                            v-if="!searchInhabitantsInfo"
                            :open="showInhPopover"
                            class="popover-inline"
                            placement="top"
                            @auto-hide="showInhPopover = false">
                            <template
                              slot="popover">
                              <popover
                                :bundle="'search'"
                                :feature="'inhabitantsInfo'" />
                            </template>
                          </v-popover>
                        </div>
                      </div>
                      <div class="form-group">
                        <label class="control-label">Search by text</label>
                        <input
                          v-model="searchModel.text"
                          type="text"
                          placeholder="Search..."
                          class="form-control">
                      </div>
                    </div>
                  </div>
                  <!-- End More Options -->
                  <!-- Other Controls -->
                  <div class="data-section stand-out no-z">
                    <div class="section-content padding-t-10">
                      <div class="form-group">
                        <div class="">
                          <label
                            class="control-label text-left"
                            for="sortBy">Sort by</label>
                          <div class="input-group tamed-input-group">
                            <span class="input-group-addon input-icon"><i class="fa fa-sort-amount-desc"/></span>
                            <multiselect
                              id="sortBy"
                              v-model="sortBy"
                              :options="sortOptions"
                              :show-labels="false"
                              :close-on-select="true"
                              label="text"
                              track-by="value"
                              class="sidebar-select"
                              openDirection="top">
                              <template
                                slot="singleLabel"
                                slot-scope="props">
                                <div>{{ props.option.text }} <span
                                  v-if="props.option.label"
                                  class="label label-default text-uppercase bg-gray-light text-primary-darker">{{ props.option.label }}</span></div>
                              </template>
                              <template
                                slot="option"
                                slot-scope="props">
                                <div>{{ props.option.text }} <span
                                  v-if="props.option.label"
                                  class="label label-default text-uppercase bg-gray-light text-primary-darker">{{ props.option.label }}</span></div>
                              </template>
                            </multiselect>
                          </div>
                        </div>
                      </div>
                      <div class="form-group">
                        <div class="row">
                          <div class="col-xs-6">
                            <button
                              :disabled="$store.getters['globalStatesModule/loadingButton'] && !searchMap"
                              class="btn btn-block btn-primary"
                              type="submit"
                              @click="searchMap = false">
                              <i
                                v-if="$store.getters['globalStatesModule/loadingButton'] && !searchMap"
                                class="fa fa-circle-o-notch fa-spin"/>
                              <i
                                v-else
                                class="fa fa-list-ul"/> List search
                            </button>
                          </div>
                          <div class="col-xs-6">
                            <button
                              :disabled="($store.getters['globalStatesModule/loadingButton'] && searchMap)"
                              class="btn btn-block btn-primary"
                              type="submit"
                              @click="searchMap = true">
                              <i
                                v-if="$store.getters['globalStatesModule/loadingButton'] && searchMap"
                                class="fa fa-circle-o-notch fa-spin"/>
                              <i
                                v-else
                                class="fa fa-map"/> Map search
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="form-group">
                        <div class="">
                          <button
                            class="btn btn-block btn-default"
                            type="button"
                            @click="resetForm()">
                            <span><i class="si si-reload padding-r-5"/> Reset</span>
                          </button>
                        </div>
                      </div>
                      <div class="form-group">
                        <div class="">
                          <button
                            v-if="!subEditMode"
                            class="btn btn-block btn-default"
                            type="submit"
                            @click="switchSearchAbo = true">
                            Save as Search Abo
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                  <!-- End Other Controls -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <div
        v-show="tabs['history']"
        style="height: 100%">
        <div class="side-panel">
          <div class="flex-head fancy-shadow">
            <div class="data-section">
              <div class="section-label">
                <div class="label-copy">History</div>
                <div
                  v-if="searchHistory.length"
                  class="section-controls">
                  <div class="label-description"><i
                    v-tooltip.top="{
                      content: 'Empty history',
                      delay: { show: 700, hide: 100 },
                    }"
                    :class="{'fa-circle-o-notch fa-spin': removingHistory, 'fa-trash': !removingHistory}"
                    class="fa empty"
                    @click="emptyHistory(false)"/></div>
                </div>
              </div>
            </div>
          </div>
          <div
            v-bar
            class="flex-scroll">
            <div class="tab-content">
              <div class="tab-pane active">
                <div
                  class="side-panel"
                  style="margin-bottom: 45px;">
                  <!-- Day 1 -->
                  <div class="data-section stand-out">

                    <div class="section-content">
                      <ul class="list list-selectable overcome-borders">
                        <li
                          v-for="(h, index1) in searchHistory"
                          :key="index1"
                        >
                          <div
                          >
                            <div
                              class="font-w600"
                              v-html="parseGeneratedName(h.name)"/>
                            <div class="font-s12 font-w400 text-muted margin-b-5">
                              <span><span notranslate>{{ getDate(h.lastUsedTime) }}</span> at <span notranslate>{{ getTime(h.lastUsedTime) }}</span></span>
                            </div>
                            <div
                              :class="{liActiveRecord: searchAgainId == h.id}"
                              class="additional-controlls">
                              <div class="btn-group">
                                <button
                                  v-tooltip.bottom="{
                                    content: 'Search again',
                                    delay: { show: 700, hide: 100 },
                                  }"
                                  class="btn btn-sm btn-default bg-white"
                                  type="button"
                                  @click="searchAgain(h)">
                                  <i :class="{'glyphicon glyphicon-repeat': !(searchAgainId == h.id), 'fa fa-circle-o-notch fa-spin': searchAgainId == h.id}"/>
                                </button>
                                <button
                                  v-tooltip.bottom="{
                                    content: 'Save search',
                                    delay: { show: 700, hide: 100 },
                                  }"
                                  class="btn btn-sm btn-default bg-white"
                                  type="button"
                                  @click="bookmarkSearch(h)">
                                  <i
                                    :class="{'fa-star-o': !h.isFavorite, 'fa-star text-warning': h.isFavorite}"
                                    class="fa"/>
                                </button>
                                <button
                                  v-tooltip.bottom="{
                                    content: 'Delete',
                                    delay: { show: 700, hide: 100 },
                                  }"
                                  :disabled="historyDeleteActionLoading[h.id]"
                                  class="btn btn-sm btn-default bg-white"
                                  type="button"
                                  @click="removeFromHistory(1, 1, h.id)">
                                  <i
                                    :class="{'fa fa-trash': !historyDeleteActionLoading[h.id], 'fa fa-circle-o-notch fa-spin': historyDeleteActionLoading[h.id]}"
                                    class="fa"/>
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-show="tabs['bookmarks']"
        style="height: 100%"
        notranslate>
        <div class="side-panel">
          <div class="flex-head fancy-shadow">
            <div class="data-section">
              <div class="section-label">
                <div class="label-copy">Favorites</div>
                <div
                  v-if="bookmarksHistory.length"
                  class="section-controls">
                  <div class="label-description "><i
                    v-tooltip.bottom="{
                      content: 'Empty Favorites',
                      delay: { show: 700, hide: 100 },
                    }"
                    :class="{'fa-circle-o-notch fa-spin': removingHistory, 'fa-trash': !removingHistory}"
                    class="fa empty"
                    @click="emptyBookmarks(false)"/></div>
                </div>
              </div>
            </div>
          </div>
          <div
            v-bar
            class="flex-scroll">
            <div class="tab-content">
              <div class="tab-pane active">
                <div
                  class="side-panel"
                  style="margin-bottom: 45px;">
                  <!-- Day 1 -->
                  <div class="data-section stand-out">
                    <!--<div class="section-label with-background bg-gray-lighter cursor-pointer">
                      <div class="label-copy">{{getDate(index)}}</div>
                      <div class="section-controls">
                        <button class="btn btn-sm btn-default" @click="index=!index">
                          <i class="fa" :class="{'fa-angle-down': !index, 'fa-angle-up': index}"></i>
                        </button>
                      </div>
                    </div>-->
                    <div class="section-content">
                      <ul class="list list-selectable overcome-borders">
                        <li
                          v-for="(h, index1) in bookmarksHistory"
                          v-if="h.isFavorite"
                          :key="index1">
                          <div>
                            <div class="font-w600">

                              <span
                                v-if="editingFavouriteId === h.id"
                                notranslate>
                                <input
                                  v-model="editingFavouriteName"
                                  class="form-control"
                                  @keydown.enter.prevent="editFavourite(h, false);">
                              </span>
                              <span
                                v-else
                                v-html="parseGeneratedName(h.name)"/>
                            </div>
                            <div class="font-s12 font-w400 text-muted margin-b-5">
                              <span><span notranslate>{{ getDate(h.lastUsedTime) }}</span> at <span notranslate>{{ getTime(h.lastUsedTime) }}</span></span>
                            </div>
                            <div
                              :class="{liActiveRecord: searchAgainId == h.id}"
                              class="additional-controlls">
                              <div class="btn-group">
                                <button
                                  v-tooltip.bottom="{
                                    content: 'Search again',
                                    delay: { show: 700, hide: 100 },
                                  }"
                                  class="btn btn-sm btn-default bg-white"
                                  type="button"
                                  @click="searchAgain(h)">
                                  <i :class="{'glyphicon glyphicon-repeat': !(searchAgainId == h.id), 'fa fa-circle-o-notch fa-spin': searchAgainId == h.id}"/>
                                </button>
                                <button
                                  v-tooltip.bottom="{
                                    content: 'Update name',
                                    delay: { show: 700, hide: 100 },
                                  }"
                                  class="btn btn-sm btn-default bg-white"
                                  type="button"
                                  @click="editingFavouriteName != '' ? editFavourite(h, false) : editFavourite(h, true);">
                                  <i
                                    :class="{'fa-save': editingFavouriteId === h.id, 'fa-edit': editingFavouriteId !== h.id}"
                                    class="fa"/>
                                </button>
                                <button
                                  v-tooltip.bottom="{
                                    content: 'Exit',
                                    delay: { show: 700, hide: 100 },
                                  }"
                                  v-if="editingFavouriteId === h.id"
                                  class="btn btn-sm btn-default bg-white"
                                  type="button"
                                  @click="editingFavouriteName = ''; editingFavouriteId = ''">
                                  <i class="fa fa-times"/>
                                </button>
                                <button
                                  v-tooltip.bottom="{
                                    content: 'Delete',
                                    delay: { show: 700, hide: 100 },
                                  }"
                                  :disabled="historyDeleteActionLoading[h.id]"
                                  class="btn btn-sm btn-default bg-white"
                                  type="button"
                                  @click="bookmarkSearch(h)">
                                  <i
                                    :class="{'fa fa-trash': !historyDeleteActionLoading[h.id], 'fa fa-circle-o-notch fa-spin': historyDeleteActionLoading[h.id]}"
                                    class="fa"/>
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="tabs['abo']"
        style="height: 100%">
        <div
          :class="{'hidden':!tabs['abo']}"
          class="side-panel">
          <subs-tab @loadSearchData="loadAboEntry"/>
        </div>
      </div>
    </aside>
    <!-- WebGL Warning -->
    <!-- <div class="map-global-warning">
      <div
        class="map-global-warning--image"
        style="background-image: url('../../../../static/img/misc/cloudy-mountains.jpg'"/>
      <div class="map-global-warning--message">
        <div class="map-global-warning--message-wrap">
          <div class="map-global-warning--message-icon">
            <i class="fa fa-warning"/>
          </div>
          <div class="map-global-warning--message-title">
            WebGL support is off or the browser does not support WebGL
          </div>
          <div class="map-global-warning--message-subtitle">
            Enable WebGL in the browser settings to use the map
          </div>
        </div>
      </div>
    </div> -->
    <!-- / WebGL Warning -->
    <div
      v-if="controls.ViewPort && viewPortIsActive"
      class="pulsating-frame">
      <div class="animated infinite flash is-frame top"/>
      <div class="animated infinite flash is-frame right"/>
      <div class="animated infinite flash is-frame bottom"/>
      <div class="animated infinite flash is-frame left"/>
    </div>

    <confirm-modal
      v-if="tabs['bookmarks']"
      :showModal="showModal"
      :title="'Delete Bookmarks'"
      :text="'You are about to delete all of your bookmarks. Are you sure? This action can not be undone.'"
      :onSubmit="() => emptyBookmarks(true)"
      :onCancel="() => showModal = false"/>
    <confirm-modal
      v-if="tabs['history']"
      :showModal="showModal"
      :title="'Delete History'"
      :text="'You are about to delete all of your history. Are you sure? This action can not be undone.'"
      :onSubmit="() => emptyHistory(true)"
      :onCancel="() => showModal = false"/>
    <confirm-modal
      :showModal="showRemoveFavModal"
      :title="'Delete from favorites'"
      :text="'Are you sure you want to delete this item from favorites?'"
      :onSubmit="confirmDeleteFromFav"
      :onCancel="() => showRemoveFavModal = false"/>
  </div>
</template>
<script>
</script>
