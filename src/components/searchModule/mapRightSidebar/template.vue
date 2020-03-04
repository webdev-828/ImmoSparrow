<template>
  <div>
    <div v-if="selectedAd">
      <object-component
        :itemId="selectedAd"
        :selectedIndex="selectedIndex"
        :pageNum="pageNum"
        :notOnMap="showOne"
        :pageNum2="pageNum2"
        @closeRightSidebar="closeObjectRightSidebar()"
        @selectItem="selectItem"/>
    </div>
    <div>
      <aside
        id="sidebar-object-fixed-2"
        :class="{'message-mode': showMaxLimitMsg}"
        class="active sidebar-shadow"
        @click.stop>
        <div
          v-show="$store.getters['globalStatesModule/loadingSearchResults']"
          class="preloader">
          <i class="fa fa-circle-o-notch fa-spin"/>
        </div>
        <button
          class="btn btn-default side-overlay--button"
          type="button"
          @click="mapRightSidebarToggle()">
          <i class="arrow"/>
        </button>
        <div class="side-panel">
          <div class="detail-header">
            <div
              class="title">
              <div class="centering-block">
                <div>
                  <span class="font-s15 font-w600">Map Search</span>
                </div>
              </div>
            </div>
            <div class="controls">
              <button
                v-tooltip.bottom="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
                class="btn btn-sm btn-default"
                @click="mapRightSidebarToggle()">
                <i class="fa fa-close"/>
              </button>
            </div>
          </div>
          <div
            v-if="showMaxLimitMsg"
            class="message-box">
            <div class="icon">
              <i
                v-tooltip.top="{ content: 'Search result will be restricted to the Agency/Employee-Restricted Area only', delay: { show: 700, hide: 100 }}"
                class="fa fa-info-circle"/>
            </div>
            <div class="message">Search returns more than 500 entries. Showing the first&nbsp;500.</div>
          </div>
          <ul class="flex-tabs list-unstyled">
            <li
              :class="{ 'active' : showZero}"
              @click="show(0)">
              <span>On Map <var notranslate>[{{ newAdsOnMapCount }} Ads]</var></span>
            </li>
            <li
              :class="{ 'active' : showOne}"
              @click="show(1)">
              <span v-if="newAdsNotOnMap.length">Not On Map <var notranslate>[{{ newAdsNotOnMapCount }} Ads]</var></span>
              <span v-else>Not On Map <var notranslate>[0 Ads]</var></span>
            </li>
          </ul>
          <div
            v-bar
            class="detail-content">
            <div
              v-show="!$store.getters['globalStatesModule/loadingSearchResults']"
              class="tab-content">
              <!-- TAB 1 -->
              <div
                :class="{ 'active' : showZero}"
                class="tab-pane">
                <div
                  v-if="newAdsOnMap && newAdsOnMap.length">
                  <div
                    v-if="!loading"
                    class="data-section">
                    <div class="section-label with-background bg-gray-lighter">
                      <div class="label-copy">
                        <i
                          v-if="loadingOnNext"
                          class="fa fa-spinner fa-spin"
                        />
                        Objects
                      </div>
                      <div class="section-controls">
                        <span
                          class="controls-label"
                          notranslate>{{ ((pageNum - 1) * perPage) + 1 }} - {{ (pageNum * perPage) > newAdsOnMapCount ? newAdsOnMapCount : (pageNum * perPage) }} of <var
                            onMapCount
                            notranslate>{{ newAdsOnMapCount | currency }}</var></span> <!-- ({{ $store.getters['searchModule/mapSearchResults'].totalItemCount | currency }}) / {{ searchResults | currency }} -->
                        <paginate
                          ref="topPagination"
                          :page-count="adsOnMapCountPages"
                          :page-range="3"
                          :click-handler="nextPage"
                          :prev-text="'<'"
                          :next-text="'>'"
                          :container-class="'pagination'"
                          :page-class="'page-item'"
                        />
                      </div>
                    </div>
                    <div class="section-content">
                      <div class="table-flex-col">
                        <div
                          v-if="newAdsNotOnMap"
                          class="objects-container">
                          <div
                            v-for="(ad, index) in newAdsOnMap"
                            :key="ad.id"
                            class="object-item-wrap"
                            @mouseup="setSelectedIndex(index)"
                            @mouseenter="hilight_marker(ad)"
                            @mouseleave="selectedAd ? '':objectLeave()">
                            <map-item
                              :ad="ad"
                              :selectedIndex="selectedIndexOnResults"
                              :index="((pageNum - 1) * perPage) + index"
                              @selectAd="selectAd(ad, index)"/>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-else>
                  <div
                    v-if="!loadingOnNext"
                    class="data-section">
                    <div class="section-content">
                      <div class="sidebar-message-box no-borders">
                        <div class="icon"><i class="fa fa-info-circle"/></div>
                        <div class="message">No ads to display. Please adjust your query.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- TAB 2 -->
              <div
                :class="{ 'active' : showOne}"
                class="tab-pane">
                <div
                  v-if="newAdsNotOnMap && newAdsNotOnMap.length">
                  <div
                    v-if="!loading"
                    class="data-section">
                    <div class="section-label with-background bg-gray-lighter">
                      <div class="label-copy">
                        <i
                          v-if="loadingOnNext"
                          class="fa fa-spinner fa-spin"
                        /> Objects
                      </div>
                      <div class="section-controls">
                        <span
                          class="controls-label"
                          notranslate>{{ ((pageNum2 - 1) * perPage) + 1 }} - {{ (pageNum2 * perPage) > newAdsNotOnMapCount ? newAdsNotOnMapCount : (pageNum2 * perPage) }} of <var
                            notOnMapCount
                            notranslate>{{ newAdsNotOnMapCount | currency }}</var></span> <!-- ({{ $store.getters['searchModule/mapSearchResults'].totalItemCount | currency }}) / {{ searchResults | currency }} -->
                        <paginate
                          ref="topPagination2"
                          :page-count="adsNotOnMapCountPages"
                          :page-range="3"
                          :click-handler="nextPage2"
                          :prev-text="'<'"
                          :next-text="'>'"
                          :container-class="'pagination'"
                          :page-class="'page-item'"/>
                      </div>
                    </div>
                    <div class="section-content">
                      <div class="table-flex-col">
                        <div
                          v-if="newAdsNotOnMap"
                          class="objects-container">
                          <div
                            v-for="(ad, index) in newAdsNotOnMap"
                            :key="index"
                            class="object-item-wrap"
                            @click="setSelectedIndex2(index)"
                            @mouseenter="hilight_locality(ad)"
                            @mouseleave="hilight_locality(ad, '')">
                            <map-item
                              :ad="ad"
                              :selectedIndex="selectedIndexOnResults"
                              :index="((pageNum2 - 1) * perPage) + index"
                              @selectAd="selectAd(ad, index)"/>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-else>
                  <div
                    v-if="!loadingOnNext"
                    class="data-section"
                  >
                    <div class="sidebar-message-box no-borders">
                      <div class="icon"><i class="fa fa-info-circle"/></div>
                      <div class="message">No ads to display. Please adjust your query.</div>
                    </div>
                  </div>
                </div>
                <!--  -->
              </div>
            </div>
          </div>
        </div>
        <!--  -->
      </aside>
    </div>
  </div>
</template>
