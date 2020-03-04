<template>
  <div>
    <button
      type="button"
      class="btn btn-sm btn-default"
      data-toggle="dropdown"
      aria-expanded="false"
      @click="pipeSearchOpen()">
      <i class="fa fa-search"/>
    </button>
    <ul
      class="filter-dropdown dropdown-menu">
      <li>
        <div>
          <div
            class="flex-head fancy-shadow"
            @click.stop>
            <div class="data-section">
              <div class="section-label">
                <div class="label-copy">
                  <i class="fa fa-search"/> Global Item Search
                </div>
                <div class="section-controls">
                  <label class="css-input switch switch-sm switch-success">
                    <span class="margin-r-5">In Progress Only</span><input
                      v-model="inProgressOnly"
                      type="checkbox"
                      @click="globalSearch"><span/>
                  </label>
                </div>
              </div>
              <div class="section-content">
                <div class="margin-b-10">
                  <input
                    v-validate="'noHTMLTag|max:199'"
                    id="globalPipeSearch"
                    v-model="globalPipeSearch"
                    type="text"
                    name=""
                    placeholder="Title, date, address, vendor"
                    class="form-control"
                    @keyup="globalSearch"
                    @focus="openResults"
                    @keydown.enter.prevent="globalSearch">
                  <div
                    v-if="!globalPipeSearchLoading && globalPipeSearchLoaded"
                    class="help-block">
                    <span
                      v-if="globalSearchResults.length > 0"
                      class="">
                      Found {{ globalSearchResults.length }} <span v-if="globalSearchResults.length == 1">item</span><span v-else>items</span>
                    </span>
                    <span
                      v-if="globalSearchResults.length == 0"
                      class="">
                      Nothing found
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex-scroll show-scrollbar">
            <div class="tab-content">
              <div class="tab-pane active">
                <div
                  v-if="globalPipeSearchLoading"
                  class="section-content">
                  <ul class="list list-selectable padding-top-5">
                    <li class="text-center no-hover">
                      <i class="fa fa-circle-o-notch fa-spin" />
                    </li>
                  </ul>
                </div>
                <div
                  v-if="globalPipeSearchLoaded"
                  class="section-content">
                  <ul class="list list-selectable">
                    <li
                      v-for="(item, itemKey) in globalSearchResults"
                      :key="itemKey"
                      @click="selectSearchResult(item)">
                      <div
                        class="pipe-item">
                        <div class="item-description">
                          <div class="ad-state"/>
                          <div
                            v-if="val(item, item => item.publication.pictures)"
                            :style="`background-image: url('https://axresources.azurewebsites.net/image/get/${item.publication.pictures[0].id}/?mw=500&mh=500&q=90}');`"
                            class="item-picture"/>
                          <div
                            v-if="val(item, item => item.publication.trackingInfo.publicationInterval.isActive)"
                            class="item-indicator state-on">
                            <span class="indicator-label">
                              <span class="label-message">On Market</span>
                            </span>
                          </div>
                          <div
                            v-else
                            class="item-indicator state-off">
                            <span class="indicator-label">
                              <span class="label-message">Off Market</span>
                            </span>
                          </div>
                          <div
                            notranslate
                            class="title"
                            v-html="markedTitle(item)" />
                          <div
                            notranslate
                            class="address">{{ displayAddress(val(item, item => item.entityModifiableInfo.address)) || displayAddress(val(item, item => item.publication.address)) }}</div>
                          <div class="related-pipe">
                            <span class="label label-info bg-amethyst">PIPE</span><var pipeName> {{ val(item, item => item.pipeline.name, "") }}</var>
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
      </li>
    </ul>
  </div>
</template>
