<template>
  <div>
    <object-component
      v-if="selectedEntry && selectedEntry.id && $store.getters['globalStatesModule/showRightSidebar']"
      :itemId="val(selectedEntry, selectedEntry => selectedEntry.publication.id)"
      :selectedIndex="0"
      :pageNum="1"
      @closeRightSidebar="closeObjectRightSidebar()"/>
    <div
      v-close-rightSidebar
      v-close-pipeItem
      id="head-container"
      class="bg-white">
      <div
        class="main-section">
        <div
          class="title-section">
          <span>Pipeline</span>
        </div>
        <div class="buttons-section">
          <div class="btn-group">
            <pipe-search
              @selectSearchResult="selectSearchResult"/>
          </div>
          <div class="btn-group">
            <button
              v-tooltip.top="{ content: 'Current Pipe', delay: { show: 700, hide: 100 }}"
              type="button"
              class="btn btn-sm btn-default"
              data-toggle="dropdown"
              aria-expanded="false">
              <span
                v-if="val(selectedPipeline, selectedPipeline => selectedPipeline.pipeline.id)"
                notranslate>{{ selectedPipeline.pipeline.name }} </span>
              <span v-else>Select pipeline </span><span class="caret margin-l-10"/>
            </button>
            <ul
              id="filter-dropdown"
              class="dropdown-menu">
              <li>
                <div>
                  <div
                    class="flex-head fancy-shadow"
                    @click.stop>
                    <div class="data-section">
                      <div class="section-label">
                        <div class="label-copy">
                          Select Pipe
                        </div>
                        <div class="section-controls">
                          <button
                            :class="{'active': addDealInList}"
                            type="button"
                            class="btn btn-sm btn-success"
                            @click.stop="openCreatePipe()">
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
                            name=""
                            placeholder="Search by pipe name"
                            class="form-control">
                        </div>
                      </div>
                    </div>
                    <ul class="flex-tabs no-shadow list-unstyled">
                      <li
                        :class="{ 'active' : tabsPipeFilter['started']}"
                        @click.stop="show('started')">
                        <span>
                          All
                        </span>
                      </li>
                      <li
                        :class="{ 'active' : tabsPipeFilter['my']}"
                        @click.stop="show('my')">
                        <span>
                          Me
                        </span>
                      </li>
                      <li
                        :class="{ 'active' : tabsPipeFilter['team']}"
                        @click.stop="show('team')">
                        <span>
                          Team
                        </span>
                      </li>
                      <li
                        :class="{ 'active' : tabsPipeFilter['agency']}"
                        @click.stop="show('agency')">
                        <span>
                          Agency
                        </span>
                      </li>
                      <li
                        v-tooltip.top="{ content: 'All other pipes also visible to you', delay: { show: 700, hide: 100 }}"
                        :class="{ 'active' : tabsPipeFilter['private']}"
                        @click.stop="show('private')">
                        <span>
                          Other
                        </span>
                      </li>
                      <li
                        :class="{ 'active' : tabsPipeFilter['favorites']}"
                        @click.stop="show('favorites')">
                        <span>
                          <i
                            class="fa fa-fw fa-star"
                            style="transform: scale(1.2);"/> Favorites
                        </span>
                      </li>
                    </ul>
                  </div>
                  <pipe-details
                    v-if="addDealInList || editPipeId"
                    :editPipeId="editPipeId"
                    @closePipeDetails="addDealInList = false; editPipeId = '';"
                    @reloadPipelines="reloadPipelines" />
                  <div
                    class="flex-scroll show-scrollbar">
                    <div class="tab-content">
                      <div class="tab-pane active">
                        <div
                          class="section-content">
                          <ul class="list list-selectable padding-top-5">
                            <li
                              v-for="(pipe, index) in allPipelines"
                              :key="index"
                              :class="selectedPipeline.pipeline && selectedPipeline.pipeline.id == pipe.id ? 'active' : '' "
                              @click="selectPipeline(pipe)">
                              <div class="filter-row">
                                <div class="name">
                                  <i
                                    :class="{'fa fa-star-o': (!pipe.tags || (pipe.tags && !pipe.tags.includes('my-favorites'))), 'fa fa-star text-warning': (pipe.tags && pipe.tags.includes('my-favorites'))}"
                                    notranslate
                                    @click.stop="addToFav(pipe)"/> {{ pipe.name }}
                                </div>
                                <div class="text-muted">
                                  <span
                                    :class="pipe.activeEntryCount === 0 ? '' : 'counter-accented'"
                                    notranslate
                                    class="ispc-counter large-counter">{{ pipe.activeEntryCount }}</span>
                                </div>
                                <!-- Number of pipe items -->
                              </div>
                              <div
                                class="sub-data text-muted">
                                <div
                                  notranslate
                                  class="left-section">
                                  <i :class="ownerType(pipe.owner.ownerType)"/> {{ pipe.owner.name }}
                                </div>
                                <div class="right-section">
                                  <div class="btn-group">
                                    <button
                                      type="button"
                                      class="btn btn-xs btn-default bg-white edit-button"
                                      @click.stop="editPipeId = pipe.id"><i class="fa fa-pencil"/></button>
                                    <button
                                      type="button"
                                      class="btn btn-xs btn-default bg-white edit-button"
                                      @click.stop="deletePipe(pipe)"><i class="fa fa-trash"/></button>
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
        </div>
        <div class="pipe-label-data">
          <div v-if="val(selectedPipeline, selectedPipeline => selectedPipeline.pipeline.id)">
            <span class="font-s12"><router-link
              to="/inbox"
              exact>Go to inbox</router-link> to add leads</span>
          </div>
          <div v-else>
            <span class="font-s12">Select a pipeline or <router-link
              to="/inbox"
              exact>go to inbox</router-link> to add leads</span>
          </div>
        </div>
        <div
          class="control-section">
          <div class="btn-group margin-r-10">
            <label class="css-input switch switch-sm switch-success">
              <input
                :disabled="!val(selectedPipeline, selectedPipeline => selectedPipeline.pipeline.id)"
                :checked="entryState"
                type="checkbox"
                @input="changeEntryState()"><span/> <span>On Market Ads Only</span>
            </label>
          </div>
          <filter-dropdown
            :searchable="true"
            :tooltipContent="'Pipe Owner'"
            :title="'Filter by Owner'"
            :placeholder="'Select owner'"
            :disabled="!val(selectedPipeline, selectedPipeline => selectedPipeline.pipeline.id)"
            :selected="selectedMember"
            :options="filteredOwners"
            @select="selectMember"
          />
          <filter-dropdown
            :title="'Filter by Item Status'"
            :disabled="!selectedPipeline.pipeline"
            :translate="true"
            :options="entriesFilterOptions"
            :shortWidth="true"
            :selected="selectedEntryFilter"
            @select="selectEntryFilter"
          />
          <button
            v-tooltip.top="{ content: 'Add/Remove Pipe from Favoritites', delay: { show: 700, hide: 100 }}"
            v-if="val(selectedPipeline, selectedPipeline => selectedPipeline.pipeline.id)"
            :class="{'btn-default': !selectedPipeline.pipeline.tags.includes('my-favorites'), 'btn-warning': selectedPipeline.pipeline.tags.includes('my-favorites')}"
            class="btn btn-sm"
            type="button"
            @click="addToFav(selectedPipeline.pipeline)">
            <i
              :class="{'fa-star-o': !selectedPipeline.pipeline.tags.includes('my-favorites'), 'fa-star text-white': selectedPipeline.pipeline.tags.includes('my-favorites')}"
              class="fa" /> <span v-if="!selectedPipeline.pipeline.tags.includes('my-favorites')">Add to</span>
            <span v-else>Remove from</span> Favorites
          </button>
          <button
            v-tooltip.top="{ content: 'Delete Pipe', delay: { show: 700, hide: 100 }}"
            v-if="val(selectedPipeline, selectedPipeline => selectedPipeline.pipeline.id)"
            type="button"
            class="btn btn-sm btn-default"
            @click="deletePipe(selectedPipeline.pipeline)">
            <i class="fa fa-trash"/>
          </button>
        </div>
      </div>
    </div>
    <div
      v-close-rightSidebar
      v-close-pipeItem
      id="pipe-instance"
      :class="{'showStatusBar': dragging}"
      class="block-screen modern-ui">
      <confirm-modal
        :showModal="showModal"
        :title="'Delete Entry'"
        :text="'Are you sure you want to delete this entry?'"
        :onSubmit="deleteLead"
        :onCancel="closeModal"/>
      <confirm-modal
        :showModal="showDeletePipe"
        :title="'Delete Pipeline'"
        :text="'Are you sure you want to delete this pipeline?'"
        :onSubmit="confirmDeletePipe"
        :onCancel="() => showDeletePipe = false"/>
      <!-- Pipe Modal -->
      <modal
        v-show="showPipeModal"
        ref="modal"
        :modalShow="showPipeModal">
        <template slot="close">
          <button
            class="btn btn-sm btn-default"
            @click="closeMoveToPipeModal()"><i class="fa fa-close"/></button>
        </template>
        <template slot="title">Move to Pipeline</template>
        <template slot="text">
          <div class="open">
            <div class="font-s13 padding-b-10">Please select a pipeline to which you want to move this entry:</div>
            <ul
              class="dropdown-menu dropdown-correction">
              <li
                style="margin-right: 1px;"
                class="dropdown-header bg-gray-lighter margin-b-10">Pipelines</li>
              <li
                v-if="pipelines && pipelines.items.length && val(selectedPipeline, selectedPipeline => selectedPipeline.pipeline.id)"
                class="margin-b-10"
                style="display: flex;">
                <select
                  v-model="moveToPipeline"
                  class="form-control input-sm margin-r-5"
                  @click.stop>
                  <option
                    v-for="pipe in availablePipelines"
                    :key="pipe.id"
                    :value="pipe"
                    notranslate>{{ pipe.name }}</option>
                </select>
              </li>
            </ul>
          </div>
        </template>
        <template slot="slot_actions">
          <button
            :disabled="!moveToPipeline.name || modalLoading"
            class="btn btn-sm btn-primary"
            type="button"
            data-dismiss="modal"
            @click="moveToPipe()">
            <i
              v-if="modalLoading"
              class="fa fa-circle-o-notch fa-spin"/> Move</button>
          <button
            class="btn btn-sm btn-default"
            type="button"
            data-dismiss="modal"
            @click="closeMoveToPipeModal()">Cancel</button>
        </template>
      </modal>
      <!-- / Pipe Modal -->
      <div
        v-if="dragElement"
        class="statusBar">
        <draggable
          id="deleteArea"
          v-bind="sortableOptions"
          :move="checkMove"
          class="area area-delete">
          <span class="title">
            <i class="fa fa-trash"/>
          </span>
        </draggable>
        <template>
          <draggable
            v-if="getEntryStatus(dragElement.status) !== 'InProgress'"
            id="reopenArea"
            v-bind="sortableOptions"
            class="area area-pipeline">
            <span class="title">Reopen</span>
          </draggable>
          <draggable
            v-if="getEntryStatus(dragElement.status) !== 'Lost'"
            id="loseArea"
            v-bind="sortableOptions"
            class="area area-lose">
            <span class="title">Lose</span>
          </draggable>
          <draggable
            v-if="getEntryStatus(dragElement.status) !== 'Won'"
            id="winArea"
            v-bind="sortableOptions"
            :move="checkMove"
            class="area area-win">
            <span class="title">Win</span>
          </draggable>
        </template>
        <draggable
          id="pipeArea"
          v-bind="sortableOptions"
          :move="checkMove"
          class="area area-pipeline">
          <span class="title">Pipeline</span>
        </draggable>
      </div>
      <div class="flex-grid-container">
        <div
          v-if="val(selectedPipeline, selectedPipeline => selectedPipeline.pipeline.definition) && !loading"
          class="flex-grid">
          <div
            v-for="column in pipelineEntries"
            :key="column.step.id"
            :class="{'stand-out-col': column.step.name=='Unassigned', 'isolated': pipelineEntries.length < 3}"
            class="flex-col">
            <div class="col-with-header">
              <div class="col-fixed">
                <div class="pipe-col-header">
                  <div
                    notranslate
                    class="header-title" >{{ column.step.name }}
                    <span
                      v-if="column.entries.length"
                      notranslate
                      class="ispc-counter">{{ column.entries.length }}</span>
                  </div>
                </div>
              </div>
              <div
                v-bar
                class="stretch-wrap">
                <!-- <draggable class="col-stretch" :id="step.id" :list="getLeadsForStep(step.id)" v-bind="sortableOptions" @start="onStart" @end="onEnd" :move="checkMove">-->
                <draggable
                  :id="column.step.id"
                  v-model="column.entries"
                  v-bind="sortableOptions"
                  :move="checkMove"
                  class="col-stretch"
                  @start="onStart"
                  @end="onEnd">
                  <div
                    v-for="(lead, leadKey) in column.entries"
                    :key="leadKey"
                    :id="lead.id"
                    :class="{'pipe-item-draggable': !lead.isDeleted}"
                    class="pipe-item"
                    @click.stop="selectLead(lead, null)">
                    <div class="item-description">
                      <div class="ad-state">
                        <span
                          v-if="lead.isDeleted"
                          class="label label-default">Deleted</span>
                        <span
                          v-else
                          :class="entryStatusLabelClass(lead.status)">{{ getEntryStatus(lead.status) }}</span>
                      </div>
                      <div
                        v-if="val(lead, lead => lead.publication.pictures)"
                        :style="`background-image: url('https://axresources.azurewebsites.net/image/get/${lead.publication.pictures[0].id}/?mw=500&mh=500&q=90}');`"
                        class="item-picture"/>
                      <div
                        v-if="val(lead, lead => lead.publication.trackingInfo.publicationInterval.isActive)"
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
                        class="title">{{ val(lead, lead => lead.name, "") || val(lead, lead => lead.publication.primaryInfo.basicInfo.title, "") }}</div>
                      <div
                        notranslate
                        class="address">{{ displayAddress(val(lead, lead => lead.entityModifiableInfo.address)) || displayAddress(val(lead, lead => lead.publication.address)) }}</div>
                      <div
                        v-if="val(lead, lead => lead.publication.trackingInfo.contactCalculated)"
                        class="vendor">
                        <div class="fa fa-building margin-r-5" />
                        <span notranslate>{{ val(lead, lead => lead.publication.trackingInfo.contactCalculated.name, "") }}</span>
                      </div>
                    </div>
                    <div
                      :class="timelineStatusClasses(lead.timelineInfo.status)"
                      class="item-status">
                      <div
                        v-if="checkActivities(lead.timelineInfo.status, true)"
                        class="status-marker">No Activities</div>
                      <div
                        v-else
                        class="status-marker">Activity is {{ checkTimelineStatus(lead.timelineInfo.status) }}</div>
                      <a
                        v-if="checkActivities(lead.timelineInfo.status, false)"
                        class="status-dropdown-toggle"
                        href="javascript:void(0)"
                        @click.stop="lead.isArchived = !lead.isArchived">
                        <div :class="{'fa fa-chevron-circle-up': lead.isArchived, 'fa fa-chevron-circle-down': !lead.isArchived}"/>
                      </a>
                      <a
                        v-else
                        class="status-dropdown-toggle"
                        href="javascript:void(0)">
                        <div class="fa fa-exclamation-triangle"/>
                      </a>
                    </div>
                    <div
                      v-if="lead.isArchived"
                      class="item-activities">
                      <activity-overdue
                        :lead="lead"
                        :isOwner="checkIfOwner(lead)"
                        @refreshSelectedEntry="refreshSelectedEntry"/>
                      <div
                        class=""
                        style="padding: 0 8px;">
                        <button
                          class="btn btn-xs btn-block btn-default"
                          type="button"
                          @click.stop="selectLead(lead, 'viewAll')">View All</button>
                        <button
                          class="btn btn-xs btn-block btn-primary"
                          type="button"
                          @click.stop="selectLead(lead, 'addActivity')">Add Activity</button>
                      </div>
                    </div>
                  </div>
                </draggable>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="loading"
        class="spinner">
        <i class="fa fa-circle-o-notch fa-spin big_spinner"/>
      </div>
    </div>
    <aside
      v-if="selectedEntry && $store.getters['globalStatesModule/showPipeDetails']"
      id="sidebar-fixed"
      class="active sidebar-shadow w-650 pipe-vb z-10001">
      <div class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block width100percent">
              <span
                class="font-s14 font-w600"
                notranslate>
                <span
                  v-if="selectedEntry.isDeleted"
                  class="label label-default margin-r-5">Deleted</span>
                <span
                  v-if="getEntryStatus(selectedEntry.status) !== 'InProgress'"
                  :class="entryStatusLabelClass(selectedEntry.status)"
                  class="margin-r-5">{{ getEntryStatus(selectedEntry.status) }}</span>
                <span v-if="!editTitle">{{ val(selectedEntry, selectedEntry => selectedEntry.name, "") || val(selectedEntry, selectedEntry => selectedEntry.publication.primaryInfo.basicInfo.title, "") }}</span>
                <input
                  v-if="editTitle"
                  ref="editTitle"
                  :maxlength="50"
                  v-model="selectedEntry.name"
                  type="text"
                  class="width100percent"
                  @keydown.enter.prevent="updateSelectedEntry()">
              </span>
            </div>
          </div>
          <div class="controls">
            <button
              v-tooltip.bottom="{
                content: 'Edit title',
                delay: { show: 700, hide: 100 },
              }"
              v-if="!editTitle && selectedEntryFilter.text !== 'Deleted'"
              :disabled="selectedEntry.isDeleted"
              class="btn btn-sm btn-default bg-white"
              type="button"
              @click.stop="editTitleName()">
              <i class="glyphicon glyphicon-pencil"/>
            </button>
            <button
              v-if="editTitle"
              class="btn btn-sm btn-default bg-white"
              type="button"
              @click.stop="editTitle = false">
              <i class="fa fa-remove"/>
            </button>
            <button
              v-if="editTitle"
              class="btn btn-sm btn-default bg-white"
              type="button"
              @click.stop="updateSelectedEntry()">
              <i class="fa fa-check"/>
            </button>
            <filter-dropdown
              :searchable="true"
              :tooltipContent="'Owner'"
              :title="'Select owner'"
              :icon="'fa fa-user'"
              :options="filteredEmployees"
              :selected="selectedOwner"
              :disabled="selectedEntry.isDeleted"
              @select="assignEmployee"
            />
            <button
              v-if="selectedEntry.isDeleted || getEntryStatus(selectedEntry.status) !== 'InProgress'"
              class="btn btn-sm btn-default"
              @click.stop="reopenEntry()">Reopen</button>
            <template v-else>
              <template v-if="getEntryStatus(selectedEntry.status) === 'InProgress'">
                <button
                  class="btn btn-sm btn-success"
                  @click="winLoseAction(true)">Win</button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="winLoseAction(false)">Lose</button>
              </template>
            </template>
            <button
              v-tooltip.bottom="{ content: 'Delete', delay: { show: 700, hide: 100 }}"
              v-if="!selectedEntry.isDeleted"
              class="btn btn-sm btn-default margin-l-5"
              @click="showDeleteLead(selectedEntry)"><i class="fa fa-trash"/></button>
            <button
              class="btn btn-sm btn-default margin-l-10"
              @click="selectedEntry = null">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <div
          v-if="selectedEntry && val(selectedPipeline, selectedPipeline => selectedPipeline.pipeline.id)"
          class="detail-pipe fancy-shadow">
          <div
            v-for="column in pipelineEntries"
            :class="{'completed': checkLeadCompleteStatus(column.step), 'disabled': selectedEntry.isDeleted }"
            :key="column.step.id"
            class="pipe-step"
            @click="!selectedEntry.isDeleted ? moveToStep(column.step.id): ''">
            <div
              notranslate
              class="step-title">
              <span v-if="column.step.name.length < 25">{{ column.step.name }}</span>
              <span v-else>{{ column.step.name.substr(0, 24) }}…</span>
            </div>
          </div>
        </div>
        <entry-details
          :activitySection="activitySection"
          :item="selectedEntry"
          :pipeline="selectedPipeline.pipeline"
          @refreshSelectedEntry="refreshSelectedEntry"
        />
      </div>
    </aside>
  </div>
</template>
