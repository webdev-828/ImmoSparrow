<template>
  <div class="searchSidebar">
    <aside
      id="side-overlay"
      class="active"
      @click="ppTransPricePopover = false">
      <button
        v-tooltip.right="{ content: 'Toggle sidebar', delay: { show: 700, hide: 100 }}"
        type="button"
        class="back-button-extra btn btn-default pull-right side-overlay--button"
        @click="searchSidebarToggle()">
        <i class="arrow" />
      </button>
      <div
        v-show="mapIsLoaded"
        class="pull-right side-overlay--button nav_h"
      >
        <a
          v-tooltip.right="{ content: 'Search', delay: { show: 700, hide: 100 }}"
          :class="{active: tabs['search']}"
          class="btn"
          @click="toggle('search')">
          <span class="si si-magnifier" />
        </a>
        <br v-if="favoritesHistory.length">
        <a
          v-tooltip.right="{ content: 'Favorities', delay: { show: 700, hide: 100 }}"
          v-if="favoritesHistory.length"
          :class="{active: tabs['bookmarks']}"
          class="btn"
          @click="toggle('bookmarks')">
          <span class="si si-star" />
        </a>
        <br v-if="searchHistory.length">
        <a
          v-tooltip.right="{ content: 'History', delay: { show: 700, hide: 100 }}"
          v-if="searchHistory.length"
          :class="{active: tabs['history']}"
          class="btn"
          @click="toggle('history')">
          <span class="si si-clock" />
        </a>
      </div>
      <form
        id="pricePredictor"
        data-vv-scope="pricePredictor"
        @submit.prevent="predictPrice('pricePredictor')">
        <div
          :class="{'hidden':!tabs['search']}"
          class="side-panel">
          <div
            v-bar
            class="flex-scroll">
            <div class="tab-content">
              <div class="tab-pane active">
                <!-- Load Spinner -->
                <div
                  v-if="$store.getters['searchStatesModule/addressLoading']"
                  class="search-spinner">
                  <i class="fa fa-circle-o-notch fa-spin" />
                </div>
                <!-- End Load Spinner -->
                <div class="side-panel">
                  <!-- Header -->
                  <div
                    class="data-section"
                  >
                    <div
                      class="section-label"
                    >
                      <div class="label-copy">Search by</div>
                      <div class="section-controls">
                        <div
                          class="dropdown"
                          style="display: inline-block;">
                          <button
                            id="dropdownMenu1"
                            class="btn btn-sm btn-default dropdown-toggle"
                            type="button"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="true">
                            {{ interactWith[locationType] }}
                            <span class="caret" />
                          </button>
                          <ul
                            class="dropdown-menu dropdown-menu-right fancy-shadow"
                            aria-labelledby="dropdownMenu1">
                            <li>
                              <a
                                href="#"
                                @click="showControl('Address', 'Address')">Address
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                @click="showControl('BuildingNumber', 'Building Number')">Building Number
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                @click="showControl('ParcelNumber', 'Parcel Number')">Parcel Number
                              </a>
                            </li>
                          </ul>
                        </div>
                        <div
                          v-if="controls.BuildingNumber || controls.ParcelNumber"
                          class="dropdown"
                          style="display: inline-block;">
                          <button
                            v-tooltip.bottom="{ content: 'Section info', delay: { show: 700, hide: 100 }}"
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
                                <span class="margin-r-5">Supported Cantons:</span>
                                <strong notranslate>AG, BE, BL, BS, GE, GL, GR, SH, SO, SZ, TG, UR, VS, ZH</strong>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <!-- Address Search -->
                    <div
                      :class="{blur: !mapIsLoaded}"
                      class="section-content"
                    >
                      <div class="input-group">
                        <span class="input-group-addon">
                          <i
                            v-if="controls.Address"
                            class="fa fa-map-marker" />
                          <i
                            v-if="controls.BuildingNumber" />
                          <i
                            v-if="controls.ParcelNumber"
                            class="si si-layers" />
                        </span>
                        <autocomplete
                          ref="autocomplete_search"
                          :disabled="!mapIsLoaded"
                          :autocomplete-text-limit="autocompleteTextLimit"
                          :set-data="setObjectLocation"
                          :placeholder="addressPlaceHolder"
                          :itemHighlighted="'highlightedName'"
                          :include-in-suggestions="includeInSuggestions"
                          :searched-address="searchedAddress"
                          :no-custom-search="true"
                          @modelChanged="searchStringChanged">
                          <template
                            slot="products"
                            slot-scope="{ item }">
                            <span class="suggestion_type">{{ get_icon(item.suggestionType) }}</span>
                          </template>
                        </autocomplete>
                      </div>
                      <div class="margin-b-10">
                        <span v-if="adsAddress.name != undefined">
                          <span
                            v-if="adsAddress.name"
                            class="multiselect__tag margin-t-10">
                            <var name>
                              <i
                                v-show="$store.getters['searchStatesModule/addressLoading']"
                                class="fa fa-circle-o-notch fa-spin"/>
                              <span
                                class="address_remove"
                                notranslate
                                @click="remove_address_item()">{{ adsAddress.name }}</span>
                            </var>
                            <i
                              aria-hidden="true"
                              tabindex="1"
                              class="multiselect__tag-icon"
                              @click="remove_address_item()"/>
                          </span>
                          <!--<span v-for="(a, index) in shapes" class="multiselect__tag margin-t-10" v-bind:style="stc(a.color)"
                            v-bind:key="a.name" v-on:click="remove_shape(a.id, index)"><span notranslate>{{a.name}}</span>
                            <i aria-hidden="true" tabindex="1" class="multiselect__tag-icon"></i>
                          </span>-->
                        </span>
                      </div>
                    </div>
                    <div
                      v-if="!mapIsLoaded"
                      class="data-section"
                      style="position: absolute; top: 30px; left: 50%; font-size: 20px; margin-left: -25px; z-index: 3;"
                    >
                      <i class="fa fa-circle-o-notch fa-spin"/>
                    </div>
                  </div>
                  <!-- End Header -->
                  <!-- Section -->
                  <div
                    v-if="adsAddress.name != undefined || manualSearch"
                    class="data-section">
                    <div
                      v-if="apartments.length"
                      class="section-label">
                      <div class="label-copy with-tabs">
                        <span
                          :class="{ 'active' : subTabs['showApartments'], 'greyOut': !apartments.length}"
                          class="label-tab"
                          @click="apartments.length ? toggleSubTabs('showApartments'):''"
                          @mousedown="minified=false">
                          Apartments <span
                            class="text-muted"
                            notranslate>{{ apartments.length }}</span>
                        </span>
                      </div>
                      <div
                        v-if="adOnAddress"
                        class="label-copy with-tabs"
                      >
                        <span
                          :class="{ 'active' : subTabs['showAds']}"
                          class="label-tab"
                          @click="toggleSubTabs('showAds')"
                          @mousedown="minified=false">
                          Ad a
                          <span
                            class="text-muted"
                            notranslate>1</span>
                        </span>
                      </div>
                      <div class="section-controls">
                        <div
                          class="dropdown"
                          style="display: inline-block;">
                          <button
                            v-tooltip.top="{ content: 'Section info', delay: { show: 700, hide: 100 }}"
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
                                The building and apartment data are gathered from the internet. No guarantee of correctness and completeness.
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div class="section-content">
                      <div
                        v-if="manualSearch"
                        class="form-group padding-t-10">
                        <div
                          class="alert alert-danger font-s13"
                          role="alert"><strong>No Building information found.</strong> Please specify the values manually.</div>
                      </div>
                      <!--<div class="form-group padding-t-10" v-if="!apartments.length">
                        <div class="alert alert-danger font-s13" role="alert"><strong>No apartments found found.</strong> Please specify the values manually.</div>
                      </div>-->
                      <div class="">
                        <!-- <div class="ribbon-tabs allcaps text-white-op" v-if="apartments.length">
                          <div class="tab bg-gray-dark mouse-pointer" :class="{ 'active' : subTabs['showApartments'], 'greyOut': !apartments.length}" @click="apartments.length ? toggleSubTabs('showApartments'):''" v-on:mousedown="minified=false">Apartments <span class="label">{{apartments.length}}</span></div>
                        </div> -->
                        <div
                          v-if="apartments.length && subTabs['showApartments'] && adSelected.id"
                          class="btn-group with-item margin-b-10">
                          <button
                            type="button"
                            class="btn btn-sm btn-default dropdown-toggle left-btn"
                            data-toggle="dropdown"
                            aria-expanded="false">
                            <sidebar-apartment-item
                              :apartment="adSelected"
                              selected="true"
                              class="in-btn"/>
                          </button>
                          <button
                            type="button"
                            class="btn btn-sm btn-default dropdown-toggle caret-btn"
                            data-toggle="dropdown"
                            aria-expanded="false"><span class="caret" />
                          </button>
                          <ul class="filter-dropdown dropdown-menu">
                            <li>
                              <div
                                class="flex-scroll show-scrollbar"
                                style="width: 290px;">
                                <div class="padding-l-10 padding-r-10">
                                  <sidebar-apartment-item
                                    v-for="(apartment, index) in orderedApartments"
                                    :key="`apartment-listitem-${index}`"
                                    :apartment="apartment"
                                    :selected="apartment.id === adSelected.id"
                                    @apartmentSelected="selectApartment(apartment)"/>
                                </div>
                              </div>
                            </li>
                          </ul>
                        </div>
                        <div
                          v-if="adOnAddress && subTabs['showAds']"
                          class="tab-content">
                          <div>
                            <div
                              class="object-detail-compact selected"
                              @click="selectAdFromSm(adsAddress.uniqueIdentifier, adOnAddress.id)">
                              <div class="detail-image">
                                <div class="image-placeholder">
                                  <i class="icon-no-image"/>
                                </div>
                                <div
                                  v-if="adOnAddress.pictures && adOnAddress.pictures.length"
                                  :style="'background-image: url(https://axresources.azurewebsites.net/image/get/'+adOnAddress.pictures[0].id+'/?mw=500&mh=500&q=90)'"
                                  class="image-real"/>
                              </div>
                              <div class="detail-data">
                                <div class="data-name">{{ val(adOnAddress, item => item.primaryInfo.basicInfo.title, "") }}</div>
                                <div class="data-parameters">
                                  <div class="fluid-data-table flex-option margin-b-0">
                                    <div
                                      v-if="val(adOnAddress, item => item.trackingInfo.publicationInterval)"
                                      class="fluid-cell-wrap">
                                      <div class="fluid-cell">
                                        <div class="attribute">
                                          Status
                                        </div>
                                        <div class="value">
                                          <span :class="{'text-success': adOnAddress.trackingInfo.publicationInterval.isActive, 'text-error': !adOnAddress.trackingInfo.publicationInterval.isActive}">
                                            <i class="fa fa-circle"/>
                                            <span v-if="adOnAddress.trackingInfo.publicationInterval.isActive">Active</span>
                                            <span v-else>Not active</span>
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      v-if="val(adOnAddress, item => item.trackingInfo.publicationInterval.lastUpdateTimeUtc)"
                                      class="fluid-cell-wrap">
                                      <div class="fluid-cell">
                                        <div class="attribute">
                                          Last change
                                        </div>
                                        <div
                                          class="value"
                                          notranslate>
                                          {{ val(adOnAddress, item => item.trackingInfo.publicationInterval.lastUpdateTimeUtc, item => formatDate(item), "") }}
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      v-if="val(adOnAddress, item => item.financialInfo.totalPriceCalculated)"
                                      class="fluid-cell-wrap">
                                      <div class="fluid-cell">
                                        <div class="attribute">
                                          Price
                                        </div>
                                        <div class="value">
                                          {{ val(adOnAddress, item => item.financialInfo.totalPriceCalculated) }}
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      v-if="val(adOnAddress, item => item.primaryInfo.layout.rooms.roomCount.value)"
                                      class="fluid-cell-wrap">
                                      <div class="fluid-cell">
                                        <div class="attribute">
                                          Room/s
                                        </div>
                                        <div class="value">
                                          {{ val(adOnAddress, item => item.primaryInfo.layout.rooms.roomCount.value, "") }}
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      v-if="val(adOnAddress, item => item.primaryInfo.layout.size.areaLiving.value)"
                                      class="fluid-cell-wrap">
                                      <div class="fluid-cell">
                                        <div class="attribute">
                                          Living Area
                                        </div>
                                        <div class="value">
                                          {{ val(adOnAddress, item => item.primaryInfo.layout.size.areaLiving.value, "") }} m<sup>2</sup>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      v-if="val(adOnAddress, item => item.primaryInfo.layout.size.areaProperty.value)"
                                      class="fluid-cell-wrap">
                                      <div class="fluid-cell">
                                        <div class="attribute">
                                          Property Area
                                        </div>
                                        <div class="value">
                                          {{ val(adOnAddress, item => item.primaryInfo.layout.size.areaProperty.value, "") }} m<sup>2</sup>
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
                      <div class="separator"/>
                      <!-- Advertising/Transactions -->
                      <div class="form-group">

                        <ul
                          class="flex-tabs list-unstyled no-shadow index0"
                          style="width: 100%;">
                          <li
                            :class="{active: 0 === typePP}"
                            @click="changeTypePP(0)">
                            <span>Advertising</span>
                          </li>
                          <li
                            v-if="ppTransPrice"
                            :class="{active: 1 === typePP}"
                            @click="changeTypePP(1)">
                            <span>Transactions</span>
                          </li>
                          <li
                            v-else
                            @click.stop="ppTransPricePopover = !ppTransPricePopover">
                            <span>Transactions</span>
                            <v-popover
                              :open="ppTransPricePopover"
                              placement="bottom"
                              trigger="manual">
                              <template
                                v-if="empCtx"
                                slot="popover">
                                <popover
                                  :bundle="'pricePredictor'"
                                  :feature="'transPricePredictionType'" />
                              </template>
                            </v-popover>
                          </li>
                        </ul>
                      </div>
                      <!-- buy/rent -->
                      <div v-if="0 === typePP">
                        <div class="form-group">
                          <div class="tabs-input">
                            <div class="input-tab">
                              <label class="css-input css-radio css-radio-primary">
                                <input
                                  v-model="searchModel.transactionType"
                                  :value="api.PubTransactionType.Buy"
                                  type="radio"
                                  name="transaction type"
                                ><span class="highlight-bar"/><span class="caption">Buy</span>
                              </label>
                            </div>
                            <div class="input-tab">
                              <label
                                class="css-input css-radio css-radio-primary">
                                <input
                                  v-model="searchModel.transactionType"
                                  :value="api.PubTransactionType.Rent"
                                  type="radio"
                                  name="transaction type"><span class="highlight-bar"/><span class="caption">Rent</span>
                              </label>
                            </div>
                          </div>
                        </div>
                        <!-- Gross / Net -->
                        <div
                          v-if="alphaFeature && searchModel.transactionType === 10"
                          class="form-group">
                          <div class="tabs-input secondary-tabs alpha-feature feature-on-block">
                            <div class="input-tab">
                              <label
                                for="grossRent"
                                class="css-input css-radio css-radio-primary">
                                <input
                                  id="grossRent"
                                  v-model="searchModel.rentDealType"
                                  :value="api.PricePredRentDealType.Gross"
                                  name="rentType"
                                  type="radio"><span class="highlight-bar"/><span class="caption">Gross Rent</span>
                              </label>
                            </div>
                            <div class="input-tab">
                              <label
                                for="netRent"
                                class="css-input css-radio css-radio-primary">
                                <input
                                  id="netRent"
                                  v-model="searchModel.rentDealType"
                                  :value="api.PricePredRentDealType.Net"
                                  name="rentType"
                                  type="radio"><span class="highlight-bar"/><span class="caption">Net Rent</span>
                              </label>
                            </div>
                          </div>
                        </div>
                        <!-- / Gross / Net -->
                        <custom-select
                          v-if="!moreTabs['marketPricingInfo']"
                          v-model="selectedPropertyType"
                          :dataSet="propTypes"
                          :approved.sync="approved.propertyType"
                          formName="pricePredictor"
                          fieldName="propertyType"
                          label="Property type"
                          validate="required"
                          @input="updateSelected" />
                        <!-- Slider #1 -->
                        <custom-input
                          v-model="searchModel.builtYear"
                          :validate="{required: true, min_value:1800, max_value: currentYear}"
                          :approved.sync="approved.builtYear"
                          type="number"
                          displayType="inline"
                          formName="pricePredictor"
                          fieldName="builtYear"
                          label="Built year"
                          @enter="nextField('renovationYear', $event);"
                        />
                        <custom-input
                          v-model="searchModel.renovationYear"
                          :validate="{required: false, isSmaller: (searchModel.renovationYear, searchModel.builtYear), min_value: 1800, max_value: currentYear }"
                          :approved.sync="approved.renovationYear"
                          type="number"
                          displayType="inline"
                          formName="pricePredictor"
                          fieldName="renovationYear"
                          placeholder="Optional"
                          label="Complete renovation year"
                          @enter="nextField('roomsNumber', $event);"
                        />
                        <!-- Slider #2 -->
                        <custom-input
                          v-model="searchModel.roomCount"
                          :validate="{required: true, min_value: roomsSlider.min, max_value: roomsSlider.max }"
                          :approved.sync="approved.roomsNumber"
                          type="number"
                          displayType="inline"
                          formName="pricePredictor"
                          fieldName="roomsNumber"
                          label="Rooms"
                          step5="true"
                          @enter="goNext($event, 'roomsNumber', 'livingArea')"
                        />
                        <!-- Slider #3 -->
                        <custom-input
                          v-model="searchModel.livingArea"
                          :validate="{required: true, min_value: livingSpaceSlider.min, max_value: livingSpaceSlider.max}"
                          :approved.sync="approved.livingArea"
                          type="number"
                          displayType="inline"
                          formName="pricePredictor"
                          fieldName="livingArea"
                          label="Living Area (net)<var notranslate>, m<sup>2</sup></var>"
                          @enter="goNextLivingArea($event)"
                        />
                        <!-- Slider #4 -->
                        <custom-input
                          v-if="selectedPropertyType.id === 100"
                          v-model="searchModel.propertyArea"
                          :validate="{required: true, min_value: propertySpaceSlider.min, max_value: propertySpaceSlider.max}"
                          :approved.sync="approved.propertyArea"
                          type="number"
                          displayType="inline"
                          formName="pricePredictor"
                          fieldName="propertyArea"
                          label="Property Area"
                          @enter="nextField('submitForm', $event)"
                        />
                        <div
                          v-if="adsAddress.name != undefined || manualSearch"
                          class="form-group">
                          <div class="row">
                            <div class="col-xs-12">
                              <button
                                :disabled="valuesApproved || $validator.errors.items.length > 0 || ($store.getters['globalStatesModule/loadingButton'] && searchMap)"
                                class="btn btn-default width100percent margin-b-5"
                                type="submit"
                                name="submitForm"
                                @click="searchMap = true">
                                <i
                                  v-if="$store.getters['globalStatesModule/loadingButton'] && searchMap"
                                  class="fa fa-circle-o-notch fa-spin"/>
                                <i
                                  v-else
                                  class="fa fa-calculator"/> Calculate
                              </button>
                              <div class="font-s12 text-muted">
                                Approve the fields manualy to enable calculation
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-if="1 === typePP">
                        <transactions
                          ref="transactionForm"
                          :searchModelTransaction="searchModelTransaction"
                          :searchModel="searchModel"
                          :activeRenovationSlider="activeRenovationSlider"
                          :addToHistory="addToHistory"
                          :approved="approved"
                          :calculateTrans="calculateTrans"
                          :fullAddress="fullAddress"
                          @setPropertyType="updateSelected"/>
                      </div>
                    </div>
                  </div>
                  <!-- End Section -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <!-- History -->
      <form class="">
        <div
          v-if="tabs['history']"
          class="side-panel">
          <div class="side-panel">
            <div class="flex-head fancy-shadow">
              <div class="data-section">
                <div class="section-label">
                  <div class="label-copy">History</div>
                  <div
                    v-if="searchHistory.length"
                    class="section-controls">
                    <div class="label-description"><i
                      v-tooltip.bottom="{
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
                    <div class="data-section">
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
                            v-for="(h, index1) in searchHistory"
                            :key="index1">
                            <div>
                              <div class="font-s13 margin-b-5">
                                <span class="label label-bordered">{{ getTypePP(h.queryType) }}</span>
                              </div>
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
                                      content: 'Predict again',
                                      delay: { show: 700, hide: 100 },
                                    }"
                                    :disabled="searchAgainId == h.id"
                                    class="btn btn-sm btn-default bg-white"
                                    type="button"
                                    @click="searchAgain(h)">
                                    <i :class="{'glyphicon glyphicon-repeat': !(searchAgainId == h.id), 'fa fa-circle-o-notch fa-spin': searchAgainId == h.id}"/>
                                  </button>
                                  <button
                                    v-tooltip.bottom="{
                                      content: 'Save prediction',
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
      </form>
      <!-- Bookmarks -->
      <form class="" >
        <div
          v-if="tabs['bookmarks']"
          class="side-panel">
          <div class="side-panel">
            <div class="flex-head fancy-shadow">
              <div class="data-section">
                <div class="section-label">
                  <div class="label-copy">Favorites</div>
                  <div
                    v-if="favoritesHistory.length"
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
                    <div class="data-section">
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
                            v-for="(h, index1) in favoritesHistory"
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
                                  v-html="parseGeneratedName(h.name)" />
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
                                      content: 'Predict again',
                                      delay: { show: 700, hide: 100 },
                                    }"
                                    :disabled="searchAgainId == h.id"
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
                                      content: 'Remove from favorites',
                                      delay: { show: 700, hide: 100 },
                                    }"
                                    :disabled="historyDeleteActionLoading[h.id]"
                                    class="btn btn-sm btn-default bg-white"
                                    type="button"
                                    @click="bookmarkSearch(h, true)">
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
      </form>
      <!-- End Bookmarks -->
    </aside>
    <confirm-modal
      v-if="tabs['bookmarks']"
      :showModal="showModal"
      :title="'Delete Bookmarks'"
      :text="'You are about to delete all of your bookmarks. Are you sure? This action can not be undone.'"
      :onSubmit="()=> emptyBookmarks(true)"
      :onCancel="() => showModal = false"/>
    <confirm-modal
      v-if="tabs['history']"
      :showModal="showModal"
      :title="'Delete History'"
      :text="'You are about to delete all of your history. Are you sure? This action can not be undone.'"
      :onSubmit="()=> emptyHistory(true)"
      :onCancel="() => showModal = false"/>
    <confirm-modal
      v-if="tabs['docs']"
      :showModal="showModal"
      :title="'Delete Docs'"
      :text="'You are about to delete all of your docs. Are you sure? This action can not be undone.'"
      :onSubmit="()=> empty_docs(true)"
      :onCancel="() => showModal = false"/>
  </div>
</template>
<script>
</script>
