<template>
  <div id="inbox">
    <main
      id="main-container"
      class="with-second-sidebar no-head-state no-head-vb">
      <object-component
        v-if="selectedItem.id && $store.getters['globalStatesModule/showRightSidebar']"
        :selectedIndex="selectedIndex"
        :showHistoryFirst="showHistoryFirst"
        :itemId="val(selectedItem, selectedItem => selectedItem.publication.id)"
        :pageNum="null"
        :countItems="countItems"
        @closeRightSidebar="closeObjectRightSidebar()"
        @selectItem="selectItem"/>
      <div class="vb vb-visible">
        <div
          id="scrollDiv"
          class="vb-content activeScroll">
          <div
            v-close-rightSidebar
            class="content pos-relative">
            <confirm-modal
              :showModal="showModal"
              :title="'Please confirm'"
              :text="deactivate ? 'Are you sure you want to deactivate this subscription?' : 'Are you sure you want to activate this subscription?'"
              :onSubmit="deactivateSub"
              :onCancel="cancelModal"/>
            <confirm-modal
              :showModal="showDeleteModal"
              :title="tabsSubscr['bookmarks'] ? 'Delete Inbox' : 'Delete Subscription'"
              :text="tabsSubscr['bookmarks'] ? 'Are you sure you want to delete this inbox?' : 'Are you sure you want to delete this subsription?'"
              :onSubmit="tabsSubscr['bookmarks'] ? confirmDeleteInbox : confirmDeleteSub"
              :onCancel="cancelModal"/>
            <confirm-modal
              :showModal="showLinkPipeModal"
              :title="'Please confirm'"
              :text="pipeForLink ? `Are you sure you want to link this subscription to ${pipeForLink.name} ?` : ''"
              :onSubmit="linkToPipe"
              :onCancel="cancelLinkPipeModal"/>
            <!-- Pipe Modal -->
            <modal
              v-show="showPipeModal"
              ref="modal"
              :modalShow="showPipeModal">
              <template slot="close">
                <button
                  class="btn btn-sm btn-default"
                  @click="showPipeModal=!showPipeModal"><i class="fa fa-close"/></button>
              </template>
              <template slot="title">Add to Pipeline</template>
              <template slot="text">
                <div class="open">
                  <div class="font-s13 padding-b-10">This subscription has no pipe linked to it. Please add one.</div>
                  <ul
                    class="dropdown-menu dropdown-correction">
                    <li class="margin-b-10">
                      <button
                        :class="{'btn-danger': createNewPipelineInput, 'btn-success': !createNewPipelineInput}"
                        type="button"
                        class="btn btn-block btn-sm"
                        @click.stop="createNewPipelineInput ? cancelNew() : cancelExisting()">
                        <span v-if="createNewPipelineInput">Cancel</span>
                        <span v-else>Create New</span>
                      </button>
                    </li>
                    <li
                      v-if="createNewPipelineInput"
                      style="display: flex;"
                      class="margin-b-10">
                      <input
                        v-model="newPipeline.name"
                        placeholder="Pipeline name"
                        class="form-control input-sm margin-r-5">
                    </li>
                    <template v-else>
                      <li
                        style="margin-right: 1px;"
                        class="dropdown-header bg-gray-lighter margin-b-10">Existing Pipelines</li>
                      <li
                        v-if="pipelines && pipelines.items.length"
                        class="margin-b-10"
                        style="display: flex;">
                        <select
                          v-model="selectedPipeline"
                          class="form-control input-sm margin-r-5"
                          @click.stop>
                          <option
                            v-for="pipe in pipelines.items"
                            :key="pipe.id"
                            :value="pipe">{{ pipe.name }}</option>
                        </select>
                      </li>
                    </template>
                  </ul>
                </div>
              </template>
              <template slot="slot_actions">
                <button
                  :disabled="(!newPipeline.name && !selectedPipeline.name) || modalLoading"
                  class="btn btn-sm btn-primary"
                  type="button"
                  data-dismiss="modal"
                  @click="createNewPipelineInput ? addToNewPipe() : addToExistingPipe()">
                  <i
                    v-if="modalLoading"
                    class="fa fa-circle-o-notch fa-spin"/> Add</button>
                <button
                  class="btn btn-sm btn-default"
                  type="button"
                  data-dismiss="modal"
                  @click="closeNewPipeModal()">Cancel</button>
              </template>
            </modal>
            <!-- / Pipe Modal -->
            <!-- Main Content-->
            <div class="leads-container">
              <div class="page-hdr fancy-shadow">
                <div
                  v-if="showPipeMessage"
                  class="message-container">
                  <div class="message">
                    <i class="fa fa-info-circle"/> The pipe function is not enabled for your subscription
                    <button
                      type="button"
                      class="btn btn-xs btn-info"
                      @click="$root.$emit('showIntercom')">Contact Us</button>
                  </div>
                  <div class="controls">
                    <button
                      class="btn btn-xs btn-link"
                      type="button"
                      @click="hidePipeMessage()"><i class="fa fa-close"/></button>
                  </div>
                </div>
                <div class="header-container">
                  <div class="titles with-control-block">
                    <div
                      v-if="!renamingSubName"
                      class="subscription-name">
                      <span v-if="selectedSub.name === 'All subscriptions'">{{ selectedSub.name }}</span>
                      <var
                        v-else
                        notranslate
                        subName> {{ selectedSub.name }} </var>
                      <!-- <button v-if="selectedSub.id" @click="renameSub()" class="btn btn-xs btn-default" type="button" data-toggle="tooltip" title="" data-original-title="Undo">
                        <i class="fa fa-pencil"></i>
                      </button> -->
                      <div class="description font-s12">{{ selectedSub.description }}</div>
                    </div>
                    <div
                      v-show="renamingSubName"
                      class="subscription-name">
                      <input
                        ref="subNameRef"
                        v-model="selectedSub.name"
                        type="text"
                        class="renameInput form-control input-sm"
                        @keyup.enter="renameSubName(selectedSub)">
                      <button
                        class="btn btn-sm btn-success"
                        type="button"
                        data-toggle="tooltip"
                        title=""
                        data-original-title="Save"
                        @click="renameSubName(selectedSub)">
                        Save
                      </button>
                    </div>
                    <div class="control-group">
                      <div class="btn-toolbar">
                        <div
                          v-if="alphaFeature"
                          class="btn-group">
                          <button
                            :disabled="!selectedLeads.length"
                            class="btn btn-sm btn-success alpha-feature feature-on-block"
                            type="button"
                            @click="showSidebar = !showSidebar">
                            <span v-if="selectedLeads.length == 0"><i class="fa fa-send margin-r-5"/>Send to Client</span>
                            <span v-else><i class="fa fa-send margin-r-5"/>Send <var
                              notranslate
                              selectedLeads>{{ selectedLeads.length }}</var>{{ selectedLeads.length === 1 ? " object" : " objects" }}</span>
                          </button>
                        </div>
                        <div class="btn-group">
                          <button
                            :disabled="downloading"
                            class="btn btn-sm btn-default dropdown-toggle"
                            type="button"
                            data-toggle="dropdown"
                            aria-expanded="false">
                            <span>
                              Save List
                            </span>
                            <span
                              v-if="!downloading"
                              class="caret"/>
                            <span
                              v-else
                              class="spin-wrap">
                              <i class="fa fa-refresh fa-spin"/>
                            </span>
                          </button>
                          <ul class="dropdown-menu dropdown-menu-right">
                            <li><a
                              tabindex="-1"
                              @click="downloadExcel(true)">All Entries</a></li>
                            <li><a
                              tabindex="-2"
                              @click="downloadExcel(false)">Since last download</a></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="titles">
                    <!-- parameter-table -->
                    <div class="parameter-table">
                      <template v-if="selectedSub && (selectedSub.id || selectedSub.stats)">
                        <div class="param-block">
                          <div class="block--title">
                            {{ selectedSub.stats.existingLeadCount === 1 ? " object" : " objects" }}
                          </div>
                          <div class="block--value">
                            <var
                              notranslate
                              existingLeadCount>{{ selectedSub.stats.existingLeadCount }}</var>
                          </div>
                        </div>
                        <template v-if="dataWasFiltered && leads && leads.items">
                          <div class="param-block">
                            <div class="block--title">
                              shown
                            </div>
                            <div class="block--value">
                              <var
                                notranslate
                                shwonLeadCount>{{ totalItemCount }}</var>
                            </div>
                          </div>
                        </template>
                        <template v-if="selectedSub.stats.newLeadCount > 0">
                          <div class="param-block">
                            <div class="block--title text-success">
                              New
                            </div>
                            <div class="block--value">
                              <var
                                notranslate
                                newLeadCount>{{ selectedSub.stats.newLeadCount }}</var>
                            </div>
                          </div>
                        </template>
                      </template>
                      <template v-else>
                        <div class="param-block">
                          <div class="block--title">
                            {{ allSubsCount === 1 ? " object" : " objects" }}
                          </div>
                          <div class="block--value">
                            <var
                              v-if="allSubsCount"
                              notranslate
                              allSubsCount>{{ allSubsCount }}</var>
                          </div>
                        </div>
                        <template v-if="dataWasFiltered && leads && leads.items">
                          <div class="param-block">
                            <div class="block--title">
                              shown
                            </div>
                            <div class="block--value">
                              <var
                                notranslate
                                shwonLeadCount>{{ totalItemCount }}</var>
                            </div>
                          </div>
                        </template>
                        <template v-if="allSubsNewCount">
                          <div class="param-block">
                            <div class="block--title text-success">
                              New
                            </div>
                            <div class="block--value">
                              <var
                                notranslate
                                allSubsCount>{{ allSubsNewCount }}</var>
                            </div>
                          </div>
                        </template>
                      </template>
                      <div
                        v-show="basicPipe"
                        v-if="selectedSub.id || (selectedSub.leadList && selectedSub.leadList.id) && selectedSub.name !== 'Favorites'"
                        class="param-block">
                        <div class="block--title">
                          Pipeline
                        </div>
                        <div class="block--value">
                          <div class="btn-group">
                            <button
                              type="button"
                              data-toggle="dropdown"
                              aria-expanded="true"
                              class="btn btn-xs btn-flexible btn-default">
                              <span
                                v-if="linkedPipeline"
                                notranslate
                                class="truncate-big">{{ linkedPipeline.name }}</span>
                              <span
                                v-else
                                class="truncate-big">Select pipeline</span><span class="caret margin-l-10"/>
                            </button>
                            <ul
                              id="filter-dropdown"
                              class="dropdown-menu">
                              <li>
                                <div>
                                  <div class="flex-head fancy-shadow">
                                    <div class="data-section">
                                      <div class="section-label">
                                        <div class="label-copy">
                                          Select Pipeline
                                        </div>
                                        <div class="section-controls">
                                          <button
                                            type="button"
                                            class="btn btn-sm btn-success"
                                            @click.stop="addDealInList = !addDealInList">
                                            <i
                                              class="fa fa-plus"/>
                                          </button>
                                        </div>
                                      </div>
                                      <div class="section-content">
                                        <div class="margin-b-10">
                                          <input
                                            v-model="pipeSearch"
                                            type="text"
                                            placeholder="Search by pipe name"
                                            class="form-control">
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <pipe-details
                                    v-if="addDealInList"
                                    @closePipeDetails="addDealInList = false"
                                    @reloadPipelines="reloadPipelines" />
                                  <div class="flex-scroll">
                                    <div class="tab-content">
                                      <div
                                        class="tab-pane active">
                                        <div
                                          class="section-content">
                                          <ul class="list list-selectable padding-top-5">
                                            <li
                                              v-for="(pipe, index) in filteredPipelines"
                                              :key="index"
                                              :class="linkedPipeline && linkedPipeline.id == pipe.id ? 'bg-info-light' : '' "
                                              @click.stop="linkedPipeline && linkedPipeline.id == pipe.id ? '' : showLinkToPipe(pipe)">
                                              <div class="filter-row">
                                                <div
                                                  notranslate
                                                  class="name">{{ pipe.name }}</div>
                                                  <!-- <div class="text-muted"><span class="badge badge-primary">{{ pipe.pendingEntryActivityCount }}</span></div> -->
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
                        </div>
                      </div>
                      <template v-if="selectedSub.limitations">
                        <div
                          v-if="selectedSub.id || (selectedSub.leadList && selectedSub.leadList.id) && selectedSub.name !== 'Favorites'"
                          class="param-block">
                          <div class="block--title">Remaining (Today)</div>
                          <div
                            class="block--value"
                            notranslate>{{ selectedSub.limitations.maximumTodayLeadCount - selectedSub.limitations.createdTodayLeadCount }} / {{ selectedSub.limitations.maximumTodayLeadCount }}</div>
                        </div>
                        <div
                          v-if="selectedSub.id || (selectedSub.leadList && selectedSub.leadList.id) && selectedSub.name !== 'Favorites'"
                          class="param-block">
                          <div class="block--title">Remaining (Week)</div>
                          <div
                            class="block--value"
                            notranslate>{{ selectedSub.limitations.maximumCurrentWeekLeadCount - selectedSub.limitations.createdCurrentWeekLeadCount }} / {{ selectedSub.limitations.maximumCurrentWeekLeadCount }}</div>
                        </div>
                      </template>
                      <div class="param-block">
                        <div class="block--title">
                          Ads
                        </div>
                        <div class="block--value">
                          <div class="btn-group margin-r-10">
                            <label class="css-input switch switch-sm switch-success">
                              <input
                                type="checkbox"
                                @input="activeAds()"><span/> <span>On Market Only</span>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div class="param-stretch"/>
                    </div>
                  </div>
                </div>
                <div class="filters-container">
                  <div class="control-part wider cursor-show">
                    <multiselect
                      id="sortBy"
                      v-model="sortFilter"
                      :options="sortOptions"
                      :show-labels="false"
                      :close-on-select="true"
                      :allow-empty="false"
                      label="text"
                      track-by="value"
                      class="in-param-block"
                      openDirection="bottom">
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
                  <div class="control-part cursor-show">
                    <multiselect
                      id="filterBy"
                      :options="filterSelect"
                      :group-select="true"
                      :multiple="true"
                      :taggable="true"
                      :show-labels="false"
                      :clear-on-select="true"
                      :allow-empty="false"
                      group-values="options"
                      group-label="headers"
                      class="in-param-block see-all-options"
                      track-by="value"
                      label="text"
                      openDirection="bottom"
                      placeholder="Select Filter"
                      @input="updateVendorFilters">
                      <template
                        slot="option"
                        slot-scope="props">
                        <div>{{ props.option.text || props.option.$groupLabel }} <i
                          :class="{'fa-thumbs-up' : props.option.text == 'Highlighted', 'fa-thumbs-down' : props.option.text == 'Deleted'}"
                          class="fa"/></div>
                      </template>
                    </multiselect>
                  </div>
                  <div class="tags-part">
                    <span
                      v-for="(i, index) in selectedFilters"
                      :key="index"
                      class="multiselect__tag"
                      @click="removeFilter(i, index)"><span>{{ i.text }}</span>
                      <i
                        v-if="i.text == 'Highlighted' || i.text == 'Deleted'"
                        :class="{'fa-thumbs-up' : i.text == 'Highlighted', 'fa-thumbs-down' : i.text == 'Deleted'}"
                        class="fa"/> <i class="multiselect__tag-icon"/></span>
                  </div>
                </div>
              </div>
              <!-- Inbox Items-->
              <div>
                <div
                  v-for="(item, itemIndex) in filteredLeads"
                  :key="itemIndex"
                  :id="'#item' + itemIndex"
                  :class="{'selected': checkIfSelected(item), 'in-sidebar': selectedIndex === itemIndex }"
                  class="block not-viewed-yet with-image ribbon ribbon-bookmark ribbon-info ribbon-left mouse-pointer can-be-selected"
                  @click.stop="selectItem(itemIndex)">
                  <div class="item-flap">
                    <div
                      v-if="item.status === 0"
                      class="not-viewed">
                      <i class="fa fa-eye"/> Not Viewed
                    </div>
                    <div
                      v-tooltip.top="{ content: 'In Inbox since', delay: { show: 700, hide: 100 }}"
                      class="entry-date">
                      <var
                        notranslate
                        createdTime>{{ getDay(item.createdTime, $store.getters['authStatesModule/lang']) }}, {{ getDateAndTime(item.createdTime, "DD.MM.YYYY, HH:mm") }}</var>
                    </div>
                  </div>
                  <div class="block-image">
                    <div
                      :style="'background-image: url(static/img/house-placeholder.png'"
                      class="placeholder"/>
                    <div
                      v-if="item.publication.pictures && item.publication.pictures.length"
                      :style="`background-image: url(https://axresources.azurewebsites.net/image/get/${item.publication.pictures[0].id}/?mw=500&mh=500&q=90}`"
                      class="object-image"/>
                    <div class="like-block">
                      <button
                        v-tooltip.top="{ content: 'Highlight', delay: { show: 700, hide: 100 }}"
                        :disabled="item.status === 2"
                        class="btn btn-success push-5-r push-10"
                        type="button"
                        @click.stop.prevent="updateLeadStatus(item, true)"><i class="fa fa-thumbs-up"/></button>
                      <button
                        v-tooltip.top="{ content: 'Delete', delay: { show: 700, hide: 100 }}"
                        :disabled="item.status === 4"
                        class="btn btn-default push-5-r push-10"
                        type="button"
                        @click.stop.prevent="updateLeadStatus(item, false)"><i class="fa fa-thumbs-down"/></button>
                    </div>
                    <div
                      v-if="item.status !== 0"
                      class="status-tags margin-t-10 margin-l-10">
                      <span
                        v-if="item.status === 4"
                        class="label label-danger margin-r-5">Deleted</span>
                      <span
                        v-if="item.status === 2"
                        class="label label-info">Highlighted</span>
                    </div>
                  </div>
                  <div class="block-not-image">
                    <div class="block-header padding-b-0">
                      <div class="header-data">
                        <div
                          v-if="!selectedSub.id"
                          class="font-s13"
                          notranslate
                          subName>{{ val(item, item => item.leadGenFilter.name, "") }}</div>
                        <h5 class="margin-b-5">
                          <span
                            class="font-s18 font-w600"
                            style="vertical-align: middle;"
                            notranslate
                            title>
                            {{ item.publication.primaryInfo.basicInfo.title }}
                          </span>
                        </h5>
                        <div class="font-s13">
                          <template v-if="val(item, item => item.leadGenInfo.publication.triggers)">
                            <span
                              v-for="(trigger, triggerIndex) in item.leadGenInfo.publication.triggers"
                              :key="triggerIndex"
                              class="label label-bordered margin-r-5 text-uppercase"
                              style="font-size: 8.6px; vertical-align: middle;">
                              {{ getTriggerName(trigger) }}
                            </span>
                            <span
                              class="text-muted"
                              notranslate>|</span>
                          </template>
                          <template v-if="item.sourceType === 2">
                            <span class="label label-sm label-success margin-r-5">
                              Manually
                            </span>
                            <span
                              class="text-muted"
                              notranslate>|</span>
                          </template>
                          <span
                            v-if="val(item, item => item.publication.trackingInfo.publicationInterval.isActive)"
                            class="label label-sm label-success">On Market</span>
                          <span
                            v-else
                            class="label label-sm label-danger">Off Market</span>
                          <span
                            class="text-muted"
                            notranslate>|</span>
                          <span
                            v-tooltip="'Property Category'"
                            class="label label-success">{{ getMainCategory([item.publication.primaryInfo.basicInfo.propertyCategory]) }}</span>
                          <span
                            v-tooltip="'Property Type'"
                            class="label label-default">{{ getMainCategory([], [item.publication.primaryInfo.basicInfo.propertyTypeId]) }}</span>
                        </div>
                        <div class="font-s13">
                          <span
                            v-if="val(selectedSub, selectedSub => selectedSub.query.leadGenParams.minPriceChange)"
                            class="label label-default">Min Price Change</span>
                          <span
                            v-if="val(selectedSub, selectedSub => selectedSub.query.leadGenParams.minPriceChangePercentage)"
                            class="label label-default">Min Price Change Percentage</span>
                        </div>
                      </div>
                      <div class="select-option">
                        <span class="font-s13">
                          <get-time-utc :publicationTimeUtc="val(item, item => item.publication.trackingInfo.publicationInterval.publicationTimeUtc, '')"/> on market
                        </span>
                        <label
                          v-tooltip.top="{ content: 'Add to Send list', delay: { show: 700, hide: 100 }}"
                          v-show="alphaFeature"
                          class="css-input css-checkbox css-checkbox-rounded css-checkbox-success alpha-feature feature-on-block"
                          @click.stop.prevent="addToSelected(item)">
                          <input
                            :checked="checkIfSelected(item)"
                            type="checkbox"><span/>
                        </label>
                      </div>
                    </div>
                    <item-details
                      :item="item.publication"
                      :index="itemIndex"
                      @showHideMap="showHideMap"
                      @selectItem="selectItem"/>
                  </div>
                  <div class="col-xs-12 padding-0">
                    <div
                      v-if="maps.indexOf(item.publication.id) > -1"
                      class="mapBox"
                      @click.stop>
                      <list-map :coordinates="item.publication.address.coordinates"/>
                    </div>
                  </div>
                </div>
                <infinite-loading
                  ref="infiniteLoading"
                  :identifier="infiniteId"
                  @infinite="infiniteHandler">
                  <span
                    slot="no-more"
                    style="display: none"/>
                  <div slot="spinner">
                    <div class="list-spinner">
                      <i class="fa fa-circle-o-notch fa-spin big_spinner"/>
                    </div>
                  </div>
                  <div slot="no-results">
                    <div style="font-size: 40px;">
                      <i class="fa fa-info-circle"/>
                    </div>
                    <div>No leads to display</div>
                  </div>
                  <div slot="error">
                    <div style="font-size: 40px;">
                      <i class="fa fa-info-circle"/>
                    </div>
                    <div>No leads to display</div>
                  </div>
                </infinite-loading>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <!-- Left Sidebar -->
    <aside
      id="side-overlay"
      class="active">
      <button
        v-tooltip.right="{ content: 'Toggle sidebar', delay: { show: 700, hide: 100 }}"
        type="button"
        class="back-button-extra btn btn-default pull-right side-overlay--button"
        @click="searchSidebarToggle()"><i class="arrow"/></button>
      <div class="side-panel">
        <div class="flex-head fancy-shadow">
          <div class="data-section">
            <div class="section-label">
              <div class="label-copy">Inbox</div>
              <div class="section-controls">
                <button
                  v-tooltip.top="{ content: 'Toggle disabled subscriptions', delay: { show: 700, hide: 100 }}"
                  class="btn btn-sm btn-default"
                  @click="switchSidebarDisabled()">
                  <i
                    :class="{'fa-eye': !showSidebarDisabled, 'fa-eye-slash': showSidebarDisabled}"
                    class="fa"/>
                </button>
                <button
                  v-tooltip.top="{ content: 'Search Inbox', delay: { show: 700, hide: 100 }}"
                  class="btn btn-sm btn-default"
                  @click="toggleSidebarSearch()"><i class="fa fa-search"/></button>
                <button
                  v-tooltip.top="{ content: 'Refresh Inbox', delay: { show: 700, hide: 100 }}"
                  class="btn btn-sm btn-default"
                  @click="refreshSubsList()">
                  <i class="fa fa-refresh"/>
                </button>
              </div>
            </div>
            <div
              v-show="showSidebarSearch"
              class="section-content">
              <div class="margin-b-10">
                <input
                  ref="sidebarSearch"
                  v-model="subSearchText"
                  class="form-control"
                  type="text"
                  name=""
                  placeholder="Client name, title...">
              </div>
            </div>
          </div>
          <ul class="flex-tabs no-shadow list-unstyled">
            <li
              :class="{ 'active' : tabsSubscr['bookmarks']}"
              @click="show('bookmarks')">
              <span><i class="fa fa-fw fa-bookmark"/> Bookmarks</span>
            </li>
            <li
              :class="{ 'active' : tabsSubscr['showOwn']}"
              @click="show('showOwn')">
              <span><i class="fa fa-fw fa-user"/> Own Abos</span>
            </li>
            <li
              :class="{ 'active' : tabsSubscr['showClients']}"
              @click="show('showClients')">
              <span><i class="fa fa-fw fa-vcard"/> Client Abos</span>
            </li>
          </ul>
        </div>
        <div
          v-bar
          class="flex-scroll">
          <div class="tab-content">
            <div
              :class="{ 'active' : tabsSubscr['bookmarks']}"
              class="tab-pane">
              <div
                class="side-panel"
                style="margin-bottom: 100px;">
                <div
                  v-if="!loadingSubscriptions"
                  class="data-section">
                  <div class="section-content">
                    <ul class="list list-selectable static-controls overcome-borders">
                      <li
                        v-if="favorites"
                        :class="{'is-active': selectedSub.leadList ? selectedSub.leadList.id === favorites.id : false}"
                        @click="selectBookmark(favorites)">
                        <div class="font-w600"><i class="fa fa-star-o"/> {{ favorites.name }}
                          <button
                            class="btn btn-sm btn-default pull-right btn-mobile"
                            type="button"
                            @click="searchSidebarToggle()">Show</button>
                        </div>
                        <div class="font-s12 font-w400 text-muted">
                          <span><var
                            notranslate
                            existingLeadCount>{{ favorites.stats.existingLeadCount }}</var>{{ favorites.stats.existingLeadCount === 1 ? " object" : " objects" }}</span>
                          <template v-if="favorites.stats.newLeadCount > 0">
                            <span class="padding-l-4 padding-r-4">&middot;</span>
                            <span class="text-success"><var
                              notranslate
                              newLeadCount>{{ favorites.stats.newLeadCount }}</var> NEW</span>
                          </template>
                        </div>
                      </li>
                      <li
                        v-for="(item, itemKey) in bookmarks.items"
                        :class="{'is-active': selectedSub.leadList ? selectedSub.leadList.id === item.id : false}"
                        :key="itemKey"
                        @click="selectBookmark(item)">
                        <div
                          v-show="editSub && editSubId === item.id"
                          class="label-copy margin-r-5">
                          <textarea
                            :ref="`ownSubName${itemKey}`"
                            v-model="item.name"
                            class="form-control font-s13"
                            style="width: 85%;"
                            rows="2"
                            @keydown.enter.prevent="renameInboxName(item)"
                            @click.stop/>
                        </div>
                        <div
                          v-if="editSubId !== item.id"
                          class="font-w600"><span
                            v-if="!item.isEnabled"
                            class="label label-default margin-r-5">Inactive</span><var
                              notranslate
                              inboxName>{{ item.name }}</var>
                          <button
                            class="btn btn-sm btn-default pull-right btn-mobile"
                            type="button"
                            @click="searchSidebarToggle()">Show</button>
                        </div>
                        <div class="font-s12 font-w400 text-muted">
                          <get-time-utc :publicationTimeUtc="item.createdTime"/>
                          <span class="padding-l-4 padding-r-4">&middot;</span>
                          <span><var
                            notranslate
                            existingLeadCount>{{ item.stats.existingLeadCount }}</var>{{ item.stats.existingLeadCount === 1 ? " object" : " objects" }}</span>
                          <template v-if="item.stats.newLeadCount > 0">
                            <span class="padding-l-4 padding-r-4">&middot;</span>
                            <span class="text-success"><var
                              notranslate
                              newLeadCount>{{ item.stats.newLeadCount }}</var> NEW</span>
                          </template>
                        </div>
                        <div class="additional-controlls">
                          <div class="btn-group">
                            <button
                              v-tooltip.bottom="{
                                content: 'Refresh',
                                delay: { show: 700, hide: 100 },
                              }"
                              v-if="!editSub"
                              class="btn btn-sm btn-default bg-white"
                              @click="refreshLeadsList()">
                              <i class="fa fa-refresh"/>
                            </button>
                            <button
                              v-tooltip.bottom="{
                                content: 'Edit name',
                                delay: { show: 700, hide: 100 },
                              }"
                              v-if="!editSub"
                              class="btn btn-sm btn-default bg-white"
                              type="button"
                              @click.stop="editSubscription(item.id, `ownSubName${itemKey}`)">
                              <i class="glyphicon glyphicon-pencil"/>
                            </button>
                            <button
                              v-else
                              class="btn btn-sm btn-default bg-white"
                              type="button"
                              @click.stop="renameInboxName(item)">
                              <i class="glyphicon glyphicon-ok"/>
                            </button>
                            <button
                              v-tooltip.bottom="{
                                content: 'Delete',
                                delay: { show: 700, hide: 100 },
                              }"
                              v-if="!editSub"
                              class="btn btn-sm btn-default bg-white"
                              style=""
                              type="button"
                              @click.stop="deleteLeadList(item)">
                              <i class="fa fa-trash"/>
                            </button>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                <div
                  v-else
                  class="spinner-subs">
                  <i class="fa fa-circle-o-notch fa-spin big_spinner"/>
                </div>
              </div>
            </div>
            <div
              :class="{ 'active' : tabsSubscr['showOwn']}"
              class="tab-pane">
              <div
                class="side-panel"
                style="margin-bottom: 100px;">
                <!-- Data Section -->
                <div class="data-section">
                  <div
                    v-if="!loadingSubscriptions"
                    class="section-content">
                    <ul class="list list-selectable static-controls overcome-borders">
                      <li
                        :class="{'is-active': selectedSub.name === 'All subscriptions'}"
                        @click="selectSub({name: 'All subscriptions'})">
                        <div class="font-w600"><i class="fa fa-clone"/> All Subscriptions
                          <button
                            class="btn btn-sm btn-default pull-right btn-mobile"
                            type="button"
                            @click="searchSidebarToggle()">Show</button>
                        </div>
                        <div class="font-s12 font-w400 text-muted">
                          <span><var
                            notranslate
                            allSubsCount>{{ allSubsCount }}</var>{{ allSubsCount === 1 ? " object" : " objects" }}</span>
                          <template v-if="allSubsNewCount">
                            <span class="padding-l-4 padding-r-4">&middot;</span>
                            <span class="text-success"><var
                              notranslate
                              allSubsCount>{{ allSubsNewCount }}</var> NEW</span>
                          </template>
                        </div>
                      </li>
                      <li
                        v-for="(sub, index) in filteredOwnSubs"
                        :class="{'is-active': selectedSub.id === sub.id}"
                        :key="index"
                        class="has-controls"
                        @click="selectSub(sub)">
                        <div
                          v-show="editSub && editSubId === sub.id"
                          class="label-copy margin-r-5">
                          <textarea
                            :ref="`ownSubName${index}`"
                            v-model="sub.name"
                            class="form-control font-s13"
                            style="width: 85%;"
                            rows="2"
                            @keydown.enter.prevent="renameSubName(sub)"
                            @click.stop/>
                        </div>
                        <div
                          v-if="editSubId !== sub.id"
                          class="font-w600"><span
                            v-if="!sub.isEnabled"
                            class="label label-default margin-r-5">Inactive</span><var
                              notranslate
                              subName>{{ sub.name }}</var>
                          <!-- <i class="fa fa-thumb-tack rotated-pin"/> -->
                          <button
                            class="btn btn-sm btn-default pull-right btn-mobile"
                            type="button"
                            @click="searchSidebarToggle()">Show</button>
                        </div>
                        <div class="sub-data text-muted">
                          <get-time-utc :publicationTimeUtc="sub.createdTime"/>
                          <span class="padding-l-4 padding-r-4">&middot;</span>
                          <span><var
                            notranslate
                            existingLeadCount>{{ sub.stats.existingLeadCount }}</var>{{ sub.stats.existingLeadCount === 1 ? " object" : " objects" }}</span>
                          <template v-if="sub.stats.newLeadCount > 0">
                            <span class="padding-l-4 padding-r-4">&middot;</span>
                            <span class="text-success"><var
                              notranslate
                              newLeadCount>{{ sub.stats.newLeadCount }}</var> NEW</span>
                          </template>
                        </div>
                        <div class="additional-controlls">
                          <div class="btn-group">
                            <button
                              v-tooltip.bottom="{
                                content: 'Refresh',
                                delay: { show: 700, hide: 100 },
                              }"
                              v-if="!editSub"
                              class="btn btn-sm btn-default bg-white"
                              @click.stop="refreshLeadsList()">
                              <i class="fa fa-refresh"/>
                            </button>
                            <!-- Edit -->
                            <button
                              v-tooltip.bottom="{
                                content: 'Edit name',
                                delay: { show: 700, hide: 100 },
                              }"
                              v-if="!editSub"
                              class="btn btn-sm btn-default bg-white"
                              type="button"
                              @click.stop="editSubscription(sub.id, `ownSubName${index}`)">
                              <i class="glyphicon glyphicon-pencil"/>
                            </button>
                            <button
                              v-else
                              class="btn btn-sm btn-default bg-white"
                              type="button"
                              @click.stop="renameSubName(sub)">
                              <i class="glyphicon glyphicon-ok"/>
                            </button>
                            <!-- / Edit -->
                            <!-- To Inbox -->
                            <button
                              v-tooltip.bottom="{
                                content: 'Edit in Search Abo',
                                delay: { show: 700, hide: 100 },
                              }"
                              v-if="!editSub"
                              class="btn btn-sm btn-default bg-white"
                              type="button"
                              @click.stop="editInSearchAbo(sub)">
                              <i class="glyphicon glyphicon-share"/>
                            </button>
                            <!-- / To Inbox -->
                            <button
                              v-tooltip.bottom="{
                                content: 'Deactivate',
                                delay: { show: 700, hide: 100 },
                              }"
                              v-if="sub.isEnabled"
                              v-show="!editSub"
                              class="btn btn-sm btn-default bg-white"
                              type="button"
                              @click.stop="showDeactivateSub(sub, true)">
                              <i class="fa fa-toggle-on"/>
                            </button>
                            <button
                              v-tooltip.bottom="{
                                content: 'Activate',
                                delay: { show: 700, hide: 100 },
                              }"
                              v-else
                              v-show="!editSub"
                              class="btn btn-sm btn-default bg-white"
                              type="button"
                              @click.stop="showDeactivateSub(sub, false)">
                              <i class="fa fa-toggle-off"/>
                            </button>
                            <button
                              v-tooltip.bottom="{
                                content: 'Delete',
                                delay: { show: 700, hide: 100 },
                              }"
                              v-if="!editSub"
                              class="btn btn-sm btn-default bg-white"
                              style=""
                              type="button"
                              @click.stop="deleteSub(sub)">
                              <i class="fa fa-trash"/>
                            </button>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div
                    v-else
                    class="spinner-subs">
                    <i class="fa fa-circle-o-notch fa-spin big_spinner"/>
                  </div>
                </div>
                <!-- End Data Section -->
              </div>
            </div>
            <div
              :class="{ 'active' : tabsSubscr['showClients']}"
              class="tab-pane">
              <div
                v-if="!loadingSubscriptions"
                class="side-panel"
                style="margin-bottom: 100px;">
                <!-- Data Section -->
                <div
                  v-for="(sub, index) in filteredContactSubs"
                  :key="index"
                  class="data-section">
                  <div
                    class="section-label with-background bg-gray-lighter"
                    @click="sub.showMore = !sub.showMore">
                    <div
                      class="label-copy"
                      notranslate
                      fullname>{{ sub.contact.firstName }} {{ sub.contact.lastName }}</div>
                    <div class="section-controls">
                      <button
                        v-tooltip.bottom="{ content: 'Email history', delay: { show: 700, hide: 100 }}"
                        v-show="alphaFeature"
                        class="btn btn-sm btn-default alpha-feature feature-on-block"
                        @click="historySidebar=!historySidebar">
                        <i class="si si-envelope-letter"/>
                      </button>
                      <button
                        v-tooltip.bottom="{ content: 'Toggle client subscriptions', delay: { show: 700, hide: 100 }}"
                        class="btn btn-sm btn-default">
                        <i
                          :class="{'fa-angle-down': !sub.showMore, 'fa-angle-up': sub.showMore }"
                          class="fa"/>
                      </button>
                    </div>
                  </div>
                  <div
                    v-if="sub.showMore"
                    class="section-content">
                    <ul class="list list-selectable static-controls overcome-borders">
                      <li
                        v-for="(item, itemIndex) in sub.subs.items"
                        :class="{'is-active': selectedSub.id === item.id}"
                        :key="itemIndex"
                        @click="selectSub(item)">
                        <div
                          v-show="editSub && editSubId === item.id"
                          class="label-copy margin-r-5">
                          <textarea
                            :ref="`contactSubName${item.id}`"
                            v-model="item.name"
                            class="form-control font-s13"
                            style="width: 85%;"
                            rows="2"
                            @keydown.enter.prevent="renameSubName(item)"
                            @click.stop/>
                        </div>
                        <div
                          v-if="editSubId !== item.id"
                          class="font-w600"><span
                            v-if="!item.isEnabled"
                            class="label label-default margin-r-5">Inactive</span><var
                              notranslate
                              subName>{{ item.name }}</var>
                          <button
                            class="btn btn-sm btn-default pull-right btn-mobile"
                            type="button"
                            @click="searchSidebarToggle()">Show</button>
                        </div>
                        <div class="font-s12 font-w400 text-muted">
                          <get-time-utc :publicationTimeUtc="item.createdTime"/>
                          <span class="padding-l-4 padding-r-4">&middot;</span>
                          <span><var
                            notranslate
                            existingLeadCount>{{ item.stats.existingLeadCount }}</var>{{ item.stats.existingLeadCount === 1 ? " object" : " objects" }}</span>
                          <template v-if="item.stats.newLeadCount > 0">
                            <span class="padding-l-4 padding-r-4">&middot;</span>
                            <span class="text-success"><var
                              notranslate
                              newLeadCount>{{ item.stats.newLeadCount }}</var> NEW</span>
                          </template>
                        </div>
                        <div class="additional-controlls">
                          <div class="btn-group">
                            <button
                              v-tooltip.bottom="{
                                content: 'Refresh',
                                delay: { show: 700, hide: 100 },
                              }"
                              v-if="!editSub"
                              class="btn btn-sm btn-default bg-white"
                              @click="refreshLeadsList()">
                              <i class="fa fa-refresh"/>
                            </button>
                            <button
                              v-tooltip.bottom="{
                                content: 'Edit name',
                                delay: { show: 700, hide: 100 },
                              }"
                              v-if="!editSub"
                              class="btn btn-sm btn-default bg-white"
                              type="button"
                              @click.stop="editSubscription(item.id, `contactSubName${item.id}`)">
                              <i class="glyphicon glyphicon-pencil"/>
                            </button>
                            <button
                              v-else
                              class="btn btn-sm btn-default bg-white"
                              type="button"
                              @click.stop="renameSubName(item)">
                              <i class="glyphicon glyphicon-ok"/>
                            </button>
                            <button
                              v-tooltip.bottom="{
                                content: 'Edit in Search Abo',
                                delay: { show: 700, hide: 100 },
                              }"
                              v-if="!editSub"
                              class="btn btn-sm btn-default bg-white"
                              type="button"
                              @click.stop="editInSearchAbo(item)">
                              <i class="glyphicon glyphicon-share"/>
                            </button>
                            <button
                              v-tooltip.bottom="{
                                content: 'Deactivate',
                                delay: { show: 700, hide: 100 },
                              }"
                              v-if="item.isEnabled"
                              v-show="!editSub"
                              class="btn btn-sm btn-default bg-white"
                              type="button"
                              @click.stop="showDeactivateSub(item, true)">
                              <i class="fa fa-toggle-on"/>
                            </button>
                            <button
                              v-tooltip.bottom="{
                                content: 'Activate',
                                delay: { show: 700, hide: 100 },
                              }"
                              v-else
                              v-show="!editSub"
                              class="btn btn-sm btn-default bg-white"
                              type="button"
                              @click.stop="showDeactivateSub(item, false)">
                              <i class="fa fa-toggle-off"/>
                            </button>
                            <button
                              v-tooltip.bottom="{
                                content: 'Delete',
                                delay: { show: 700, hide: 100 },
                              }"
                              v-if="!editSub"
                              class="btn btn-sm btn-default bg-white"
                              style=""
                              type="button"
                              @click.stop="deleteSub(item)">
                              <i class="fa fa-trash"/>
                            </button>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                <!-- End Data Section -->
              </div>
              <div
                v-else
                class="spinner-subs">
                <i class="fa fa-circle-o-notch fa-spin big_spinner"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
    <!-- / Left Sidebar -->
    <!-- Send To Client Sidebar -->
    <aside
      v-if="showSidebar"
      id="sidebar-object-fixed-2"
      class="active sidebar-shadow just-header-vb"
      @click.stop>
      <div class="side-panel">
        <div class="flex-head">
          <div class="detail-header fancy-shadow">
            <div class="title">
              <div class="centering-block">
                <div>
                  <i class="fa fa-envelope-o margin-r-5"/>
                  <span class="font-s15 font-w600">Send <var notranslate>{{ selectedLeads.length }}</var> Objects to <var notranslate>{{ selectedSub.contact ? selectedSub.contact.firstName + " " + selectedSub.contact.lastName : "" }}</var></span>
                </div>
              </div>
            </div>
            <div class="controls">
              <button
                v-tooltip.bottom="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
                class="btn btn-default"
                @click="showSidebar = !showSidebar">
                <i class="fa fa-close"/>
              </button>
            </div>
          </div>
        </div>
        <div
          v-bar
          class="flex-scroll">
          <div class="detail-content">
            <div class="tab-content">
              <div class="tab-pane active">
                <form>
                  <div class="data-section stand-out">
                    <div class="section-label">
                      <div class="label-copy">Client</div>
                      <div class="section-controls">
                        <div class="btn-group">
                          <button
                            :class="{ 'active': sendToTabs['contact'] }"
                            class="btn btn-sm btn-default"
                            type="button"
                            @click="sendToShowTab('contact')">
                            Contact
                          </button>
                          <button
                            :class="{ 'active': sendToTabs['email'] }"
                            class="btn btn-sm btn-default"
                            type="button"
                            @click="sendToShowTab('email')">
                            Email
                          </button>
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="sendToTabs['contact']"
                      class="section-content">
                      <multiselect
                        id="sortBy"
                        :options="selectDemo"
                        :show-labels="false"
                        :close-on-select="true"
                        :allow-empty="false"
                        :placeholder="'Select contact'"
                        label="text"
                        track-by="value"
                        class="in-param-block"
                        openDirection="bottom"/>
                    </div>
                    <div
                      v-if="sendToTabs['email']"
                      class="section-content">
                      <div class="form-group">
                        <!-- <label for="email">Email</label> -->
                        <input
                          v-if="selectedSub.contact"
                          id="email"
                          v-model="selectedSub.contact.email"
                          notranslate
                          type="text"
                          name="email"
                          class="form-control"
                          placeholder="Email address"
                          aria-required="true"
                          aria-invalid="false">
                        <input
                          v-else
                          id="email"
                          v-model="contactEmail1"
                          notranslate
                          type="text"
                          name="email"
                          placeholder="Email address"
                          class="form-control"
                          aria-required="true"
                          aria-invalid="false">
                      </div>
                      <div class="form-group">
                        <label
                          for="email2"
                          class="text-primary mouse-pointer"
                          @click="additionalEmail=!additionalEmail">
                          <i
                            :class="{'fa-plus': !additionalEmail, 'fa-minus': additionalEmail}"
                            class="fa"/> BCC Email
                        </label>
                        <input
                          v-if="additionalEmail"
                          id="email2"
                          v-model="contactEmail2"
                          notranslate
                          type="text"
                          name="email2"
                          placeholder="BCC address"
                          class="form-control">
                      </div>
                    </div>
                  </div>
                  <div class="data-section stand-out no-z">
                    <div class="section-label">
                      <div class="label-copy">Message</div>
                    </div>
                    <div class="section-content">
                      <div class="form-group">
                        <textarea
                          id="message"
                          notranslate
                          name="message"
                          class="form-control"
                          rows="4"/>
                      </div>
                    </div>
                  </div>
                  <div class="data-section stand-out no-z">
                    <div class="section-label">
                      <div class="label-copy">{{ selectedLeads.length }} Object<span v-if="selectedLeads.length > 1">s</span></div>
                    </div>
                    <div class="section-content padding-t-0">
                      <div
                        :class="{'list-compact': objectsListCompact}"
                        class="form-group objects-list margin-b-10">
                        <table class="table table-condensed table-borderless font-s12 margin-b-0">
                          <tbody>
                            <tr
                              v-for="(lead, index) in selectedLeads"
                              :key="index">
                              <td class="width20percent padding-l-0 padding-r-0">
                                <img
                                  :src="`https://axresources.azurewebsites.net/image/get/${lead.publication.pictures[0].id}/?mw=500&mh=500&q=90}`"
                                  class="img-responsive">
                              </td>
                              <td class="padding-l-10">
                                <div
                                  notranslate
                                  class="font-w600">{{ lead.publication.primaryInfo.basicInfo.title }}</div>
                                <div
                                  notranslate
                                  class="text-muted">{{ lead.publication.address.street }} {{ lead.publication.address.streetNumber + "," }} {{ lead.publication.address.zip }} {{ lead.publication.address.locality }}</div>
                              </td>
                              <td class="padding-r-0 text-right">
                                <button
                                  v-tooltip.top="{ content: 'Remove from list', delay: { show: 700, hide: 100 }}"
                                  class="btn btn-xs btn-default"
                                  type="button"
                                  title=""
                                  data-original-title="Remove"><i class="fa fa-times"/></button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <button
                        v-tooltip.top="{ content: 'Expand/truncate list', delay: { show: 700, hide: 100 }}"
                        type="button"
                        class="btn btn-xs btn-block btn-default margin-b-10"
                        @click="objectsListCompact=!objectsListCompact">
                        <span v-if="objectsListCompact">Expand</span>
                        <span v-else>Truncate</span>
                        <span><i
                          :class="{'fa-angle-down': objectsListCompact, 'fa-angle-up': !objectsListCompact}"
                          class="fa"/></span>
                      </button>
                      <div
                        v-if="selectedSub.contact"
                        class="form-group">
                        <button
                          :disabled="!selectedSub.contact.email"
                          type="button"
                          class="btn btn-sm btn-block btn-success"
                          @click="sendLeads()"><i class="fa fa-send margin-r-5"/>Send</button>
                      </div>
                      <div
                        v-else
                        class="form-group">
                        <button
                          :disabled="!contactEmail1 && !contactEmail2"
                          type="button"
                          class="btn btn-sm btn-block btn-success"
                          @click="sendLeads()"><i class="fa fa-send margin-r-5"/>Send</button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
    <!-- End Send To Client Sidebar -->
    <!-- History Sidebar -->
    <aside
      v-if="historySidebar"
      id="sidebar-object-fixed-3"
      class="active sidebar-shadow"
      @click.stop>
      <div class="side-panel">
        <div class="flex-head">
          <div class="detail-header">
            <div class="title">
              <div class="centering-block">
                <div>
                  <i class="si si-envelope-letter margin-r-5"/>
                  <span class="font-s15 font-w600">Email History to Joe Black</span>
                </div>
              </div>
            </div>
            <div class="controls">
              <button
                v-tooltip.bottom="{ content: 'Close panel', delay: { show: 700, hide: 100 }}"
                class="btn btn-default"
                @click="historySidebar = !historySidebar">
                <i class="fa fa-close"/>
              </button>
            </div>
          </div>
        </div>
        <div
          v-bar
          class="flex-scroll">
          <div class="detail-content">
            <div class="tab-content">
              <div class="tab-pane active">
                <!-- Email 1 -->
                <div class="data-section">
                  <div class="section-label with-background bg-gray-lighter">
                    <div class="label-copy">Email 27 January 2019</div>
                    <div class="section-controls">
                      <button
                        v-tooltip.left="{ content: 'Toggle email', delay: { show: 700, hide: 100 }}"
                        class="btn btn-sm btn-default"
                        @click="email1=!email1"><i
                          :class="{'fa-angle-down': !email1, 'fa-angle-up': email1}"
                          class="fa"/></button>
                    </div>
                  </div>
                  <div
                    v-if="email1"
                    class="section-content padding-t-10">
                    <div class="form-group">
                      <label>Address</label>
                      <p class="font-s13 margin-b-10">joe@ascarix.com</p>
                    </div>
                    <div class="form-group">
                      <label>Message</label>
                      <p class="font-s13 margin-b-10">Hello, Joe! Take a look at these options. If you like it we can meet and talk with more details.</p>
                    </div>
                    <div
                      :class="{'list-compact': objectsListCompact}"
                      class="form-group objects-list margin-b-10">
                      <div class="font-s13 font-w600">Objects</div>
                      <table class="table table-condensed font-s12 margin-t-10 margin-b-0">
                        <tbody>
                          <tr>
                            <td class="padding-l-0 width20percent ">
                              <img
                                :src="`https://axresources.azurewebsites.net/image/get/f36ca62e-e2d0-bab0-2f9c-c6f56971f0c4/?mw=500&mh=500&q=90}`"
                                class="img-responsive">
                            </td>
                            <td class="padding-l-10">
                              <div class="font-w600">3.5-Zimmer Wohnung</div>
                              <div class="text-muted">Zürcherstrasse 4, 8852 Altendorf</div>
                            </td>
                          </tr>
                          <tr>
                            <td class="padding-l-0 width20percent ">
                              <img
                                :src="`https://axresources.azurewebsites.net/image/get/a1b91ac1-29e3-1dce-c4bf-0e6b855d21ed/?mw=500&mh=500&q=90}`"
                                class="img-responsive">
                            </td>
                            <td class="padding-l-10">
                              <div class="font-w600">5.5-Zimmer Haus mit Holzfeuerung</div>
                              <div class="text-muted">Alte Poststrasse, 7307 Jenins</div>
                            </td>
                          </tr>
                          <tr>
                            <td class="padding-l-0 width20percent ">
                              <img
                                :src="`https://axresources.azurewebsites.net/image/get/7b574164-1e88-64dd-d484-74a22004950a/?mw=500&mh=500&q=90}`"
                                class="img-responsive">
                            </td>
                            <td class="padding-l-10">
                              <div class="font-w600">Möblierte Ferien-/Eigentumswohnung mit traumhafter Aussicht auf das Bergpanorama</div>
                              <div class="text-muted">6174 Sörenberg</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <button
                      v-tooltip.top="{ content: 'Expand/truncate list', delay: { show: 700, hide: 100 }}"
                      type="button"
                      class="btn btn-xs btn-block btn-default margin-t-5 margin-b-10"
                      @click="objectsListCompact=!objectsListCompact">
                      <span v-if="objectsListCompact">Expand</span>
                      <span v-else>Truncate</span>
                      <span><i
                        :class="{'fa-angle-down': objectsListCompact, 'fa-angle-up': !objectsListCompact}"
                        class="fa"/></span>
                    </button>
                  </div>
                </div>
                <!-- Email -->
                <div class="data-section">
                  <div class="section-label with-background bg-gray-lighter">
                    <div class="label-copy">Email 25 January 2019</div>
                    <div class="section-controls">
                      <button
                        v-tooltip.left="{ content: 'Toggle email', delay: { show: 700, hide: 100 }}"
                        class="btn btn-sm btn-default"
                        @click="email2=!email2"><i
                          :class="{'fa-angle-down': !email2, 'fa-angle-up': email2}"
                          class="fa"/></button>
                    </div>
                  </div>
                  <div
                    v-if="email2"
                    class="section-content padding-t-10">
                    <div class="form-group">
                      <label>Address</label>
                      <p class="font-s13 margin-b-10">joe@ascarix.com</p>
                    </div>
                    <div class="form-group">
                      <label>Message</label>
                      <p class="font-s13 margin-b-10">Hello, Joe! Take a look at these options. If you like it we can meet and talk with more details.</p>
                    </div>
                    <div
                      :class="{'list-compact': objectsListCompact2}"
                      class="form-group objects-list margin-b-10">
                      <div class="font-s13 font-w600">Objects</div>
                      <table class="table table-condensed font-s12 margin-t-10 margin-b-0">
                        <tbody>
                          <tr>
                            <td class="padding-l-0 width20percent ">
                              <img
                                :src="`https://axresources.azurewebsites.net/image/get/f36ca62e-e2d0-bab0-2f9c-c6f56971f0c4/?mw=500&mh=500&q=90}`"
                                class="img-responsive">
                            </td>
                            <td class="padding-l-10">
                              <div class="font-w600">3.5-Zimmer Wohnung</div>
                              <div class="text-muted">Zürcherstrasse 4, 8852 Altendorf</div>
                            </td>
                          </tr>
                          <tr>
                            <td class="padding-l-0 width20percent ">
                              <img
                                :src="`https://axresources.azurewebsites.net/image/get/a1b91ac1-29e3-1dce-c4bf-0e6b855d21ed/?mw=500&mh=500&q=90}`"
                                class="img-responsive">
                            </td>
                            <td class="padding-l-10">
                              <div class="font-w600">5.5-Zimmer Haus mit Holzfeuerung</div>
                              <div class="text-muted">Alte Poststrasse, 7307 Jenins</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <button
                      v-tooltip.top="{ content: 'Expand/truncate list', delay: { show: 700, hide: 100 }}"
                      type="button"
                      class="btn btn-xs btn-block btn-default margin-t-5 margin-b-10"
                      @click="objectsListCompact2=!objectsListCompact2">
                      <span v-if="objectsListCompact2">Expand</span>
                      <span v-else>Truncate</span>
                      <span><i
                        :class="{'fa-angle-down': objectsListCompact2, 'fa-angle-up': !objectsListCompact2}"
                        class="fa"/></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
    <!-- End History Sidebar -->
  </div>
</template>
