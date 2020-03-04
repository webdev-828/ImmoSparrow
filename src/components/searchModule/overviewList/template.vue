<template>
  <div>
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
    <object-component
      v-if="selectedItemId && $store.getters['globalStatesModule/showRightSidebar']"
      :selectedIndex="selectedIndex"
      :showHistoryFirst="showHistoryFirst"
      :itemId="selectedItemId"
      :pageNum="pageNum + 1"
      @closeRightSidebar="closeObjectRightSidebar()"
      @selectItem="selectItem"/>
    <main
      v-close-rightSidebar
      id="main-container"
      class="no-head-state no-head-vb"
      @click="selectedIndex = -1">
      <div
        v-bar
        v-if="searchResults"
        style="position: absolute; z-index: 1">
        <div
          id="scrollDiv"
          class="bg-gray-lighter font-s13">
          <div class="page-controls">
            <div
              v-show="searchResults.accessibleTotalItemCount"
              class="result-counter">
              Ads <var
                notranslate
                from><strong>{{ getPage }} </strong></var> - <var
                  notranslate
                  to><strong>{{ ((pageNum + 1) * perPage) > searchResults.accessibleTotalItemCount ? searchResults.accessibleTotalItemCount : ((pageNum + 1) * perPage) }}</strong></var> of <var
                    notranslate
                    total><strong>{{ searchResults.accessibleTotalItemCount | currency }} <var v-if="searchResults.totalItemCount > searchResults.accessibleTotalItemCount">({{ searchResults.totalItemCount | currency }})</var></strong></var> <!-- ({{ searchResults.totalCount | currency }}) / <strong>{{ allAds | currency }}</strong> -->
            </div>
            <div
              v-show="searchResults.accessibleTotalItemCount"
              class="">
              <paginate
                ref="topPagination"
                :page-count="pages"
                :page-range="3"
                :margin-pages="2"
                :click-handler="nextPage"
                :prev-text="'Prev'"
                :next-text="'Next'"
                :container-class="'pagination'"
                :page-class="'page-item'"/>
            </div>
            <!-- <div class="font-s13 margin-b-0" style="margin-left: 10px; padding: 6px 8px; background-color: #fff;"><i class="fa fa-info-circle"></i> Search returns more than 500 entries. Showing the first&nbsp;500.</div> -->
          </div>
          <div
            :class="{'greyOut': loading}"
            class="block-content block-content-full padding-left-right-60 padding-t-30">
            <div
              v-if="!loading"
              class="row">
              <div
                v-for="(item, index) in searchResults.items"
                :id="'#item' + index"
                :class="{'sel': selectedIndex === index}"
                :key="index"
                class="col-xs-12"
                @click.stop="selectItem(index, false, false, searchResults.items.length)">
                <list-item
                  :class="{'selectedItem': selectedIndex === index}"
                  :item="item"
                  :index="index"
                  @shareAdLink="shareAdLink"/>
              </div>
            </div>
            <div
              v-show="!loading && searchResults.accessibleTotalItemCount"
              class="col-md-12">
              <div class="form-material">
                <paginate
                  ref="bottomPagination"
                  :page-count="pages"
                  :page-range="3"
                  :margin-pages="2"
                  :click-handler="nextPage"
                  :prev-text="'Prev'"
                  :next-text="'Next'"
                  :container-class="'pagination'"
                  :page-class="'page-item'"/>
              </div>
            </div>
          </div>
          <div
            v-if="loading"
            class="spinner">
            <i class="fa fa-circle-o-notch fa-spin"/>
          </div>
        </div>
      </div>
      <div
        v-if="!searchResults.accessibleTotalItemCount && !loading"
        class="no-res">
        <div style="font-size: 40px;">
          <i class="fa fa-info-circle"/>
        </div>
        <div>No leads to display</div>
      </div>
    </main>
  </div>
</template>
