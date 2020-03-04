<template>
  <left-sidebar class="searchSidebar">
    <sidetab :tabs="sidebarTabs" />

    <template v-slot:header>
      <template v-if="activeTabL1 === 'search'">
        <div class="section-label">
          <div class="label-copy with-tabs">
            <span
              :class="{ 'active': activeTabL2 === 'address' }"
              class="label-tab"
              @click="setActiveTab('address', 2); dropdownActive['portfolioSearch'] = false">
              Address
            </span>
            <span
              v-if="alphaFeature"
              :class="{ 'active': activeTabL2 === 'portfolio' }"
              class="label-tab alpha-feature feature-on-block"
              @click="setActiveTab('portfolio', 2)">
              Portfolio <span class="text-muted">96</span>
            </span>
          </div>
          <div class="section-controls">
            <button
              v-if="activeTabL2 === 'portfolio'"
              class="btn btn-sm btn-default"
              type="button"
              @click="dropdownActive['portfolioSearch'] = !dropdownActive['portfolioSearch']">
              <i class="fa fa-search"/>
            </button>
          </div>
        </div>
        <div
          v-if="dropdownActive['portfolioSearch']"
          class="section-content margin-b-10">
          <input
            type="text"
            name="portfolio-search"
            placeholder="Find object by name, address"
            class="form-control">
        </div>
      </template>
      <div
        v-if="activeTabL1 === 'history'"
        class="section-label">
        <div class="label-copy">History</div>
        <div class="section-controls">
          <div class="label-description">
            <i
              v-tooltip.top="{ content: 'Empty history', delay: { show: 700, hide: 100 } }"
              :class="[ 'fa empty', removingHistoryInProgress ? 'fa-circle-o-notch fa-spin' : 'fa-trash' ]"
              @click="toggleModal('history', true)"/>
          </div>
        </div>
      </div>
      <div
        v-if="activeTabL1 === 'bookmarks'"
        class="section-label">
        <div class="label-copy">Favorites</div>
        <div class="section-controls">
          <div class="label-description">
            <i
              v-tooltip.top="{ content: 'Empty Favorites', delay: { show: 700, hide: 100 } }"
              :class="[ 'fa empty', removingBookmarksInProgress ? 'fa-circle-o-notch fa-spin' : 'fa-trash' ]"
              @click="toggleModal('bookmarks', true)"/>
          </div>
        </div>
      </div>
    </template>

    <template v-slot:content>
      <form v-show="activeTabL1 === 'search'">
        <template v-if="activeTabL2 === 'address'">
          <div
            v-if="isLoading"
            class="search-spinner">
            <i class="fa fa-circle-o-notch fa-spin"/>
          </div>
          <div class="side-panel">
            <div :class="['data-section', { 'blur': !isMapLoaded }]">
              <div class="section-content padding-b-10">
                <div class="input-group margin-t-20">
                  <span class="input-group-addon input-icon">
                    <i class="fa fa-map-marker"/>
                  </span>
                  <address-autocomplete @selectedItem="reset(true)"/>
                </div>
                <div
                  v-if="!isMapLoaded"
                  class="data-section"
                  style="position: absolute; top: 22px; left: 50%; font-size: 20px; margin-left: -25px; z-index: 3;">
                  <i class="fa fa-circle-o-notch fa-spin"/>
                </div>
                <div
                  v-if="searchedAddress"
                  class="under-input-tag-container">
                  <span
                    class="multiselect__tag"
                    @click="removeAddressItem()">
                    <span>
                      <i
                        v-show="isAddressLoading"
                        class="fa fa-circle-o-notch fa-spin"/>
                      <span class="address_remove">{{ searchedAddress.name }}</span>
                    </span>
                    <i
                      aria-hidden="true"
                      tabindex="1"
                      class="multiselect__tag-icon"/>
                  </span>
                </div>
              </div>
            </div>

            <template v-if="formModel && searchedAddress && !isAddressLoading">
              <div class="data-section stand-out">
                <div class="section-content">
                  <div class="data-subsection margin-b-15">
                    <div class="data-subsection--label no-border">
                      <div class="data-subsection--label--copy with-tabs text-uppercase font-s11">
                        <span
                          :class="['label-tab', { 'active' : activeTabL3 === 'ads', 'greyOut': !ads.length } ]"
                          @click="setPricingInfoTab('ads')">
                          Ads
                          <span
                            class="text-muted"
                            notranslate>{{ ads.length }}</span>
                        </span>
                        <span
                          v-if="apartments"
                          :class="['label-tab', { 'active' : activeTabL3 === 'apartments', 'greyOut': !apartments.length } ]"
                          @click="setPricingInfoTab('apartments')">
                          Apartments
                          <span
                            class="text-muted"
                            notranslate>{{ apartments.length }}</span>
                        </span>
                        <span
                          v-else
                          class="label-tab greyOut">
                          Apartments <span class="text-muted">0</span>
                        </span>
                      </div>
                    </div>
                    <div class="data-subsection--content">
                      <div
                        v-if="activeTabL3 === 'ads' && selectedAd"
                        class="btn-group with-item margin-b-10">
                        <button
                          type="button"
                          class="btn btn-sm btn-default dropdown-toggle left-btn"
                          data-toggle="dropdown"
                          aria-expanded="false">
                          <sidebar-ad-item
                            :ad="selectedAd"
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
                                <sidebar-ad-item
                                  v-for="ad in ads"
                                  :key="`ad-listitem-${ad.id}`"
                                  :ad="ad"
                                  :selected="selectedAd.id === ad.id"
                                  @adSelected="selectAd(ad)"/>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div
                        v-if="activeTabL3 === 'apartments' && selectedApartment"
                        class="btn-group with-item margin-b-10">
                        <button
                          type="button"
                          class="btn btn-sm btn-default dropdown-toggle left-btn"
                          data-toggle="dropdown"
                          aria-expanded="false">
                          <sidebar-apartment-item
                            :apartment="selectedApartment"
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
                                  v-for="(apartment, index) in apartments"
                                  :key="`apartment-listitem-${index}`"
                                  :apartment="apartment"
                                  :selected="apartment.id === selectedApartment.id"
                                  @apartmentSelected="selectApartment(apartment)"/>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="tabs-input margin-b-20">
                    <div class="input-tab">
                      <label class="css-input css-radio css-radio-primary">
                        <input
                          v-model="formModel.transactionType"
                          type="radio"
                          name="transaction-type"
                          value="20">
                        <span class="highlight-bar"/>
                        <span class="caption">Buy</span>
                      </label>
                    </div>
                    <div class="input-tab">
                      <label class="css-input css-radio css-radio-primary">
                        <input
                          v-model="formModel.transactionType"
                          :disabled="formModel.transaction.active"
                          type="radio"
                          name="transaction-type"
                          value="10">
                        <span class="highlight-bar"/>
                        <span class="caption">Rent</span>
                      </label>
                    </div>
                  </div>
                  <custom-select
                    v-model="formModel.propertyType"
                    :dataSet="propTypes"
                    :approved.sync="approved.mandatory.propertyType"
                    formName="marketRadarForm"
                    fieldName="propertyType"
                    validate="required"
                    label="Property type"
                    class="margin-b-15" />
                </div>
              </div>

              <div class="data-section button-style-header blue-accent no-z">
                <div class="section-label">
                  <div class="label-copy">Price Prediction</div>
                  <div class="section-controls">
                    <button
                      class="btn btn-sm btn-default"
                      type="button"
                      @click="dropdownActive['pricePredcion'] = !dropdownActive['pricePredcion']">
                      <i :class="['fa', dropdownActive['pricePredcion'] ? 'fa-angle-up' : 'fa-angle-down']"/>
                    </button>
                  </div>
                </div>
                <div
                  v-if="dropdownActive['pricePredcion']"
                  class="section-content">
                  <ul
                    class="flex-tabs list-unstyled no-shadow index0 margin-b-15"
                    style="width: 100%;">
                    <li
                      :class="{ 'active': !formModel.transaction.active }"
                      @click="setIsTransaction(false)">
                      <span>Advertising</span>
                    </li>
                    <li
                      :class="{ 'active': formModel.transaction.active }"
                      @click="setIsTransaction(true)">
                      <span>Transactions</span>
                    </li>
                  </ul>

                  <custom-input
                    v-model="formModel.rooms.value"
                    :validate="{ required: true, min_value: getMinMaxForField('rooms').min, max_value: getMinMaxForField('rooms').max }"
                    :approved.sync="approved.mandatory.rooms"
                    :step5="true"
                    type="number"
                    displayType="inline"
                    formName="marketRadarFormPP"
                    fieldName="rooms"
                    label="Number of Rooms"
                    class="margin-b-15"
                    @enter="nextField('livingSpace')"/>
                  <custom-input
                    v-model="formModel.livingSpace.value"
                    :validate="validatorLivingSpace"
                    :approved.sync="approved.mandatory.livingSpace"
                    type="number"
                    displayType="inline"
                    formName="marketRadarFormPP"
                    fieldName="livingSpace"
                    label="Living Area, m<sup>2</sup>"
                    class="margin-b-15"
                    @enter="formModel.propertyType.id == 100 ? nextField('propertyArea') : nextField('builtYear')"/>
                  <custom-input
                    v-if="formModel.propertyType.id === 100"
                    v-model="formModel.propertyArea.value"
                    :validate="{ required: true, min_value: getMinMaxForField('propertyArea').min, max_value: getMinMaxForField('propertyArea').max }"
                    :approved.sync="approved.mandatory.propertyArea"
                    type="number"
                    displayType="inline"
                    formName="marketRadarFormPP"
                    fieldName="propertyArea"
                    label="Property Area, m<sup>2</sup>"
                    class="margin-b-15"
                    @enter="nextField('builtYear')"/>
                  <custom-input
                    v-model="formModel.builtYear.value"
                    :validate="{ required: true, min_value: getMinMaxForField('builtYear').min, max_value: getMinMaxForField('builtYear').max }"
                    :approved.sync="approved.mandatory.builtYear"
                    type="number"
                    displayType="inline"
                    formName="marketRadarFormPP"
                    fieldName="builtYear"
                    label="Built Year"
                    class="margin-b-15"
                    @enter="nextField('renovationYear')"/>
                  <custom-input
                    v-model="formModel.renovationYear.value"
                    :validate="validatorRenovationBuild"
                    :approved.sync="approved.optional.renovationYear"
                    type="number"
                    displayType="inline"
                    formName="marketRadarFormPP"
                    fieldName="renovationYear"
                    optionalField="true"
                    label="Complete Renovation Year"
                    class="margin-b-15"
                    @enter="nextField(formModel.transaction.active ? 'cubature' : 'rooms-min')"/>

                  <transaction-form
                    v-if="formModel.transaction.active"
                    :transactionModel="formModel.transaction"
                    :propertyTypeId="formModel.propertyType.id"
                    :approved="approved.transaction"
                    formName="marketRadarFormTransaction"/>
                </div>
              </div>
              <div class="data-section button-style-header blue-accent no-z">
                <div class="section-label">
                  <div class="label-copy">Similar Offers</div>
                  <div class="section-controls">
                    <button
                      class="btn btn-sm btn-default"
                      type="button"
                      @click="dropdownActive['similarOffers'] = !dropdownActive['similarOffers']">
                      <i :class="['fa', dropdownActive['similarOffers'] ? 'fa-angle-up' : 'fa-angle-down']"/>
                    </button>
                  </div>
                </div>
                <div
                  v-if="dropdownActive['similarOffers']"
                  class="section-content">
                  <div class="data-subsection">
                    <div class="data-subsection--content">
                      <custom-input
                        :minMaxFields="minMaxInput.rooms"
                        :ppIndicator="formModel.rooms.value"
                        :step5="true"
                        type="number"
                        displayType="minmax"
                        formName="marketRadarFormSO"
                        fieldName="rooms"
                        label="Number of Rooms"
                        class="margin-b-15"
                        @enter="nextField('livingSpace-min')"/>
                      <custom-input
                        :minMaxFields="minMaxInput.livingSpace"
                        :ppIndicator="formModel.livingSpace.value"
                        type="number"
                        displayType="minmax"
                        formName="marketRadarFormSO"
                        fieldName="livingSpace"
                        label="Living Area, m<sup>2</sup>"
                        class="margin-b-15"
                        @enter="nextField(minimized['similarObjects'] ? 'geoSearch' : 'price-min', minimized['similarObjects'])"/>
                      <button
                        class="btn btn-block btn-xs btn-default margin-b-15"
                        type="button"
                        @click="minimized['similarObjects'] = !minimized['similarObjects']">
                        <span v-if="minimized['similarObjects']">More</span>
                        <span v-else>Less</span> options
                        <i :class="['fa', minimized['similarObjects'] ? 'fa-caret-down' : 'fa-caret-up']" />
                      </button>

                      <template v-if="!minimized['similarObjects']">
                        <custom-input
                          :minMaxFields="minMaxInput.price"
                          :ppIndicator="formModel.price.value"
                          type="number"
                          displayType="minmax"
                          formName="marketRadarFormSO"
                          fieldName="price"
                          label="Price, CHF"
                          class="margin-b-15"
                          @enter="nextField('builtYear-min')"/>
                        <custom-input
                          :minMaxFields="minMaxInput.builtYear"
                          :ppIndicator="formModel.builtYear.value"
                          type="number"
                          displayType="minmax"
                          formName="marketRadarFormSO"
                          fieldName="builtYear"
                          label="Built Year"
                          class="margin-b-15"
                          @enter="nextField(formModel.propertyType.id === 100 ? 'propertyArea-min' : 'geoSearch', formModel.propertyType.id !== 100)"/>
                        <custom-input
                          v-if="formModel.propertyType.id === 100"
                          :minMaxFields="minMaxInput.propertyArea"
                          :ppIndicator="formModel.propertyArea.value"
                          type="number"
                          displayType="minmax"
                          formName="marketRadarFormSO"
                          fieldName="propertyArea"
                          label="Property Area, m<sup>2</sup>"
                          class="margin-b-15"
                          @enter="nextField('geoSearch')"/>
                      </template>
                    </div>
                  </div>
                  <include-data-in-range/>
                  <div class="data-subsection">
                    <div class="data-subsection--label">
                      <div class="data-subsection--label--copy">Ads Info</div>
                    </div>
                    <div class="data-subsection--content">
                      <div class="form-group">
                        <div class="row">
                          <div class="col-xs-6">
                            <label class="css-input switch switch-sm switch-primary">
                              <input
                                v-model="formModel.activeAds"
                                type="checkbox">
                              <span/>On Market
                            </label>
                          </div>
                          <div class="col-xs-6">
                            <label class="css-input switch switch-sm switch-primary">
                              <input
                                v-model="formModel.historicAds.active"
                                type="checkbox">
                              <span/>Historic
                            </label>
                          </div>
                        </div>
                        <div
                          v-show="formModel.historicAds.active"
                          class="form-group">
                          <label>Years period</label>
                          <div class="row">
                            <div class="col-md-6">
                              <multiselect
                                v-model="formModel.historicAds.yearFrom"
                                :options="yearsList"
                                :show-labels="false"
                                :close-on-select="true"
                                class="pull-left"
                                openDirection="top"/>
                            </div>
                            <div class="col-md-6">
                              <multiselect
                                v-model="formModel.historicAds.yearTo"
                                :options="yearsList"
                                :show-labels="false"
                                :close-on-select="true"
                                class="pull-right"
                                openDirection="top"/>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="data-section stand-out no-z">
                <div class="section-content margin-b-20">
                  <button
                    :disabled="!!formErrors.length || !isAllApproved"
                    type="button"
                    name="analyze"
                    class="btn btn-block btn-sm btn-default"
                    @click="analyse(false)">
                    <i :class="['fa', isAnalysingInProgress ? 'fa-circle-o-notch fa-spin' : 'fa-map']"/> Analyse
                  </button>
                  <button
                    v-if="alphaFeature"
                    :disabled="isAnalysingInProgress"
                    type="button"
                    class="btn btn-block btn-sm btn-default alpha-feature feature-on-block">Save as Portfolio</button>
                </div>
              </div>
            </template>
          </div>
        </template>

        <div
          v-if="activeTabL2 === 'portfolio'"
          class="data-section">
          <div class="section-label">
            <div class="label-copy">Objects</div>
            <div class="section-controls">
              <button
                type="button"
                class="btn btn-sm btn-default">
                <i class="fa fa-angle-up"/>
              </button>
            </div>
          </div>
          <div class="section-content no-walls">
            <div
              v-for="(item, index) in portfolioItemsDummy"
              :key="`portfolio-item-${index}`"
              class="sidebar-item">
              <div class="item-image">
                <div
                  :style="`background-image: url(${item.image}});`"
                  class="image"/>
              </div>
              <div class="item-content">
                <div class="title">{{ item.title }}</div>
                <div class="address">{{ item.address }}</div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div
        v-if="activeTabL1 === 'bookmarks'"
        class="side-panel">
        <div class="data-section stand-out">
          <div class="section-content">
            <ul class="list list-selectable overcome-borders">
              <sidebar-history-item
                v-for="entry in bookmarks"
                :key="entry.id"
                :item="entry"
                type="bookmark"
                @search="searchAgain"
                @editBookmarkName="editBookmarkName"
                @toggleBookmark="toggleIsFavoriteHistoryEntry"/>
            </ul>
          </div>
        </div>
      </div>

      <div
        v-if="activeTabL1 === 'history'"
        class="side-panel">
        <div class="data-section stand-out">
          <div class="section-content">
            <ul class="list list-selectable overcome-borders">
              <sidebar-history-item
                v-for="entry in history"
                :key="entry.id"
                :item="entry"
                @search="searchAgain"
                @toggleBookmark="toggleIsFavoriteHistoryEntry"
                @removeFromList="removeFromHistory"/>
            </ul>
          </div>
        </div>
      </div>
    </template>

    <modal
      :modalShow="modal.show">
      <template slot="close">
        <button
          type="button"
          class="btn btn-sm btn-default"
          @click="toggleModal(modal.item, false)">
          <i class="fa fa-close"/>
        </button>
      </template>
      <template slot="title">Are you sure?</template>
      <template slot="text">
        <p>You are about to delete all of you {{ modal.item }}. Are you sure? This action can not be undone</p>
      </template>
      <template slot="slot_actions">
        <button
          class="btn btn-sm btn-default"
          type="button"
          data-dismiss="modal"
          @click="toggleModal(modal.item, false)">No</button>
        <button
          class="btn btn-sm btn-primary"
          type="button"
          data-dismiss="modal"
          @click="modalAction">
          <i class="fa fa-check"/>Yes
        </button>
      </template>
    </modal>
  </left-sidebar>
</template>

<style>
  .help-block.has-error {
    color: #d26a5c;
  }
</style>
