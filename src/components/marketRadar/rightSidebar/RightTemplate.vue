<template>
  <right-sidebar
    :aside-id="'sidebar-object-fixed-2'"
    @closed="reset"
    @click.native="neighborhoodPopover = false">
    <template
      v-slot:full-sidebar-display
      v-if="selectedAd">
      <object-component
        :itemId="selectedAd.id"
        :selectedIndex="-1"
        :pageNum="0"
        :showArrows="true"
        :showMR="false"
        :notOnMap="false"
        :pageNum2="1"
        @closeRightSidebar="unselectAd"/>
    </template>
    <template v-slot:modal>
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
    </template>
    <template
      v-slot:title
      v-if="searchedAddress">
      <i class="fa fa-building-o margin-r-5"/>
      <span class="font-s15 font-w600">{{ searchedAddress.name }}</span>
    </template>

    <template v-slot:content>
      <ul class="flex-tabs list-unstyled icon-tabs">
        <li
          v-tooltip.top="{ content: 'Overview', delay: { show: 700, hide: 100 }}"
          :class="{ active: activeTabL1 === 'overview', disabled: !buildingInfo }"
          @click="setActiveTab('overview', 1, true)">
          <span><i class="icon-overview"/></span>
        </li>
        <li
          v-tooltip.top="{ content: 'Ads History', delay: { show: 700, hide: 100 }}"
          :class="{ active: activeTabL1 === 'ads', disabled: !ads.length }"
          @click="ads.length ? setActiveTab('ads', 1, true) : null">
          <span><i class="fa fa-history"/></span>
        </li>
        <li
          v-tooltip.top="{ content: 'Neighborhood', delay: { show: 700, hide: 100 }}"
          v-if="ppNeighborhood"
          :class="{ active: activeTabL1 === 'neighborhood', disabled: !entranceRatings }"
          @click="setActiveTab('neighborhood', 1, true)">
          <span><i class="icon-mountains"/></span>
        </li>
        <li
          v-else
          @click.stop="neighborhoodPopover = true">
          <span class="alpha-feature feature-on-text"><i class="icon-mountains"/></span>
          <v-popover
            :open="neighborhoodPopover"
            placement="bottom"
            trigger="manual">
            <template
              v-if="empCtx"
              slot="popover">
              <popover
                :bundle="'pricePredictor'"
                :feature="'neighbourhood'" />
            </template>
          </v-popover>
        </li>
        <li
          v-tooltip.top="{ content: 'Similar objects', delay: { show: 700, hide: 100 }}"
          :class="{ active: activeTabL1 === 'similarObjects', disabled: !similarObjects.length }"
          @click="setActiveTab('similarObjects', 1, true)">
          <span>
            <span class="span-with-counter close-buildings">
              <i class="fa fa-building"/>
              <i class="fa fa-building"/>
              <span
                v-if="similarObjects.length > 0"
                class="ispc-counter">{{ similarObjects.length }}</span>
            </span>
          </span>
        </li>
        <li
          v-tooltip.top="{ content: 'Analytics', delay: { show: 700, hide: 100 }}"
          :class="{ active: activeTabL1 === 'analytics', disabled: prediction.loading || !prediction.ads }"
          @click="setActiveTab('analytics', 1, true); setActiveTab('price', 2, true)">
          <span style="transform: scale(1.1);">
            <i
              v-if="prediction.loading"
              class="fa fa-spinner fa-spin"
              style="font-size: 10px"/>
            <i class="icon-price-up"/>
          </span>
        </li>
        <li
          v-tooltip.top="{ content: 'Construction Sites', delay: { show: 700, hide: 100 }}"
          v-if="alphaFeature"
          :class="{ active: activeTabL1 === 'constructionSites' }"
          @click="setActiveTab('constructionSites', 1, true)">
          <span style="transform: scale(1.1);">
            <span class="alpha-feature feature-on-text"><i class="icon-hook"/></span>
          </span>
        </li>
        <li
          v-tooltip.top="{ content: 'Documentation', delay: { show: 700, hide: 100 }}"
          v-if="alphaFeature"
          :class="{ active: activeTabL1 === 'documentation', disabled: prediction.loading || !prediction.ads }"
          @click="setActiveTab('documentation', 1, true)">
          <span>
            <span class="alpha-feature feature-on-text"><i class="fa fa-file-o"/></span>
          </span>
        </li>
      </ul>
      <div
        v-bar
        class="detail-content">
        <div class="tab-content">
          <overview-tab v-if="activeTabL1 === 'overview'"/>
          <ads-history-tab v-if="activeTabL1 === 'ads'"/>
          <analytics-tab v-show="activeTabL1 === 'analytics'"/>
          <similar-objects-tab v-if="activeTabL1 === 'similarObjects'"/>
          <construction-sites-tab v-if="activeTabL1 === 'constructionSites'"/>
          <documentation-tab v-if="activeTabL1 === 'documentation'"/>
          <neighborhood v-if="activeTabL1 === 'neighborhood'"/>
        </div>
      </div>
    </template>
  </right-sidebar>
</template>

<style scoped>
ul.flex-tabs>li.disabled {
  pointer-events: none;
}
</style>
