<template>
  <div>
    <object-component
      v-if="selectedEntry && selectedEntry.id && $store.getters['globalStatesModule/showRightSidebar']"
      :itemId="val(selectedEntry, selectedEntry => selectedEntry.publication.id)"
      :selectedIndex="0"
      :pageNum="1"
      @closeRightSidebar="closeObjectRightSidebar()"/>
    <aside
      v-if="selectedEntry && $store.getters['globalStatesModule/showPipeDetails']"
      id="sidebar-fixed"
      class="active sidebar-shadow w-650 pipe-vb z-10001">
      <div class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <span
                class="font-s14 font-w600"
                notranslate>
                <span>{{ val(selectedEntry, selectedEntry => selectedEntry.name, "") || val(selectedEntry, selectedEntry => selectedEntry.publication.primaryInfo.basicInfo.title, "") }}</span>
              </span>
            </div>
          </div>
          <div class="controls">
            <button
              class="btn btn-sm btn-default margin-l-10"
              @click="selectedEntry = null">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <entry-details
          :item="selectedEntry"
          :pipeline="selectedPipeline" />
      </div>
    </aside>
    <confirm-modal
      :showModal="showModal"
      :title="'Delete activities'"
      :text="'Are you sure you want to delete selected activities?'"
      :onCancel="() => showModal = false"
      :onSubmit="deleteSelected"/>
    <div
      id="head-container"
      class="bg-white">
      <div
        class="main-section">
        <div
          class="title-section">
          <span>Activities</span>
        </div>
        <div class="info-section">
          <small><var overdueNo>{{ activities.overdueItemCount }}</var> Overdue, <var totalCount>{{ activities.totalItemCount }}</var> Total</small>
        </div>
        <div
          class="control-section">
          <div class="btn-toolbar">
            <div class="btn-group">
              <button
                type="button"
                data-toggle="dropdown"
                aria-expanded="true"
                class="btn btn-sm btn-flexible btn-default">
                <span
                  v-if="selectedPipeline && selectedPipeline.name"
                  notranslate
                  class="truncate-big">{{ selectedPipeline.name }}</span>
                <span
                  v-else
                  class="truncate-big">All pipes</span>  <span class="caret margin-l-10"/>
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
                          <div class="section-controls"/>
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
                      <ul class="flex-tabs no-shadow list-unstyled">
                        <li
                          :class="{ 'active' : tabsPipeFilter['started']}"
                          @click.stop="show('started')">
                          <span>
                            <i
                              class="fa fa-fw fa-list"
                              style="transform: scale(1.2);"/> All
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
                    <div class="flex-scroll">
                      <div class="tab-content">
                        <div
                          class="tab-pane active">
                          <div
                            class="section-content">
                            <ul class="list list-selectable padding-top-5">
                              <li
                                :class="{'active': selectedPipeline.id === 'Show All'}"
                                @click="selectPipeline({ id: 'Show All' })">
                                <div class="filter-row">
                                  <div class="name">
                                    Show All
                                  </div>
                                </div>
                              </li>
                              <li
                                v-for="(pipe, index) in allPipelines"
                                :key="index"
                                :class="selectedPipeline.id == pipe.id ? 'active' : '' "
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
                                      :class="pipe.pendingEntryActivityCount === 0 ? '' : 'counter-accented'"
                                      notranslate
                                      class="ispc-counter large-counter">{{ pipe.pendingEntryActivityCount }}</span>
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
            <div class="btn-group">
              <filter-dropdown
                :searchable="true"
                :tooltipContent="'Pipe Owner'"
                :title="'Filter by Owner'"
                :placeholder="'Select owner'"
                :options="filteredOwners"
                @select="selectOwner"
              />
            </div>
            <div class="btn-group">
              <div class="input-group mouse-pointer">
                <input
                  v-model="searchForString"
                  placeholder="Search by (subject, contact, due date )"
                  type="text"
                  class="form-control input-sm search-header-input"
                  @keyup.enter="searchFor()">
                <span
                  v-if="!searchLoading"
                  class="input-group-addon"
                  @click="searchFor()">
                  <i class="fa fa-search"/>
                </span>
                <span
                  v-if="searchLoading"
                  class="input-group-addon">
                  <i class="fa fa-circle-o-notch fa-spin"/>
                </span>
                <span
                  v-if="searchFinished"
                  class="input-group-addon bg-gray-light"
                  @click="clearSearch">
                  <i class="fa fa-remove"/>
                </span>
              </div>
            </div>
            <div class="btn-group">
              <button
                v-for="(i, index) in [10,20,50]"
                :key="index"
                :class="i == perPage ? 'active':''"
                class="btn btn-sm btn-default"
                @click.stop="changePerPage(i)">{{ i }}
              </button>
            </div>
            <!-- <div class="btn-group">
              <button
                v-tooltip.top="{ content: 'Download as Excel', delay: { show: 700, hide: 100 }}"
                type="button"
                disabled
                class="btn btn-sm btn-default">
                <i class="fa fa-download"/> <span class="visible-xl">Download as Excel</span>
              </button>
            </div> -->
            <div class="btn-group">
              <button
                v-tooltip.top="{ content: 'Add Activity', delay: { show: 700, hide: 100 }}"
                type="button"
                class="btn btn-sm btn-success"
                @click="createNewActivity()">
                <i class="fa fa-plus"/> <span class="visible-xl">Add Activity</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <main
      v-close-pipeItem
      id="main-container"
      class="standard-vb table-page">
      <div
        v-bar
        style="position: absolute; z-index: 1">
        <div>
          <div class="objects-list">
            <div class="block">
              <div class="block-content">
                <div class="table-controls">
                  <div class="left-side">
                    <div v-if="selectedItems.length">
                      <button
                        v-tooltip.top="{ content: 'Delete Selected', delay: { show: 700, hide: 100 }}"
                        type="button"
                        class="btn btn-sm btn-default"
                        @click="showModal = true">
                        <i class="fa fa-trash"/>
                      </button>
                      <button
                        type="button"
                        class="btn btn-sm btn-success"
                        @click="markSelected()">Mark as Done</button>
                    </div>
                  </div>
                  <div class="right-side">
                    <div
                      class="btn-group"
                      role="group">
                      <button
                        :class="{'active': checkStatusFilter('planned')}"
                        type="button"
                        class="btn btn-sm btn-flexible btn-default"
                        @click="setStatusFilter('planned')">Planned</button>
                      <button
                        :class="{'active': checkStatusFilter('overdue')}"
                        type="button"
                        class="btn btn-sm btn-flexible btn-default"
                        @click="setStatusFilter('overdue')">Overdue</button>
                      <button
                        :class="{'active': checkStatusFilter('done')}"
                        type="button"
                        class="btn btn-sm btn-flexible btn-default"
                        @click="setStatusFilter('done')">Done</button>
                      <button
                        :class="{'active': selectedTimeFilter === 'Today'}"
                        type="button"
                        class="btn btn-sm btn-flexible btn-default"
                        @click="setTimeFilter('Today')">Today</button>
                      <button
                        :class="{'active': selectedTimeFilter === 'Tomorrow'}"
                        type="button"
                        class="btn btn-sm btn-flexible btn-default"
                        @click="setTimeFilter('Tomorrow')">Tomorrow</button>
                      <button
                        :class="{'active': selectedTimeFilter === 'This Week'}"
                        type="button"
                        class="btn btn-sm btn-flexible btn-default"
                        @click="setTimeFilter('This Week')">This Week</button>
                      <button
                        :class="{'active': selectedTimeFilter === 'Next Week'}"
                        type="button"
                        class="btn btn-sm btn-flexible btn-default"
                        @click="setTimeFilter('Next Week')">Next Week</button>
                      <div
                        class="btn-group"
                        role="group">
                        <button
                          type="button"
                          class="btn btn-sm btn-flexible btn-default dropdown-toggle"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false">
                          Choose
                          <span class="caret"/>
                        </button>
                        <ul
                          class="dropdown-menu dropdown-menu-right"
                          @click.stop>
                          <li class="dropdown-header">Choose date range</li>
                          <li>
                            <div class="datepic">
                              <datepicker
                                v-model="rangeMin"
                                :disabledDates="disabledDatesRangeMin"
                                :input-class="'form-control input-sm'"
                                :typeable="false"
                                :calendar-class="'rightside-datepicker'"
                                :placeholder="'From'"/>
                              <div class="date-separator">—</div>
                              <datepicker
                                v-model="rangeMax"
                                :disabledDates="disabledDatesRangeMax"
                                :input-class="'form-control input-sm'"
                                :typeable="false"
                                :calendar-class="'rightside-datepicker'"
                                :placeholder="'To'"/>
                            </div>
                            <div class="datepic-controls text-right">
                              <button
                                type="button"
                                class="btn btn-sm btn-default"
                                @click="resetRange()">Reset</button>
                              <button
                                type="button"
                                class="btn btn-sm btn-success"
                                @click="applyRangeFilter()">Apply</button>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="row"
                  style="">
                  <div class="col-sm-12 padding-t-10">
                    <div v-if="!loading">
                      <table class="table table-condensed table-striped va-middle">
                        <thead>
                          <tr>
                            <th
                              class="width20px hover-point"
                              style="padding-left: 8px; padding-right: 8px;">
                              <label
                                v-tooltip.top="{ content: 'Select All', delay: { show: 700, hide: 100 }}"
                                class="css-input css-checkbox css-checkbox-sm css-checkbox-default margin0"
                                @click.stop>
                                <input
                                  type="checkbox"
                                  @click.stop="addAllToSelected()"><span/>
                              </label>
                            </th>
                            <th class="font-s13 width20px hover-point">Done</th>
                            <th class="font-s13 hover-point">Type</th>
                            <th class="width15percent font-s13 hover-point">Subject</th>
                            <th class="font-s13 hover-point">Pipeline Item</th>
                            <th class="font-s13 hover-point">Contact/Vendor</th>
                            <th class="font-s13 hover-point">Email</th>
                            <th class="font-s13 hover-point">Phone</th>
                            <th class="font-s13 hover-point">Company</th>
                            <th class="font-s13 hover-point">Owner</th>
                            <th class="font-s13 hover-point">Due Date</th>
                            <th class="font-s13 hover-point">Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(activity, acKey) in activities.items"
                            :key="acKey"
                            :class="{'selected': selectedItems.indexOf(activity) !== -1,
                                     'completed': checkCompleted(activity.status),
                                     'overdue': checkTime(activity.timeUtc) === 'overdue',
                                     'ontime': checkTime(activity.timeUtc) === 'ontime'}"
                            class="hovertr font-s12"
                            @click.stop="getActivity(acKey)">
                            <td>
                              <label
                                class="css-input css-checkbox css-checkbox-sm css-checkbox-default margin0"
                                @click.stop>
                                <input
                                  :checked="selectedItems.indexOf(activity) !== -1"
                                  type="checkbox"
                                  @click.stop="addToSelected($event, activity)"><span/>
                              </label>
                            </td>
                            <td>
                              <label
                                class="css-input css-radio css-radio-sm css-radio-default margin0"
                                @click.stop>
                                <input
                                  :checked="checkCompleted(activity.status)"
                                  type="radio"
                                  @click.stop="changeStatus(activity)"><span/>
                              </label>
                            </td>
                            <td v-html="getActivityType(activity)" />
                            <td
                              class="font-w600"
                              notranslate>{{ activity.subject }}</td>
                            <td
                              class=""
                              notranslate
                              @click.stop="getPipeEntry(activity)">
                              <a
                                href="#"
                                class="hover-link text-underline">{{ val(activity, activity => activity.pipelineEntry.entityModifiableInfo.name) || val(activity, activity => activity.pipelineEntry.publication.primaryInfo.basicInfo.title) }}</a></td>
                            <td
                              class=""
                              notranslate>{{ val(activity, activity => activity.pipelineEntry.entityModifiableInfo.contactInfo.personalName) || val(activity, activity => activity.pipelineEntry.publication.trackingInfo.publisherCalculated.primaryInfo.person.name) || val(activity, activity => activity.pipelineEntry.publication.trackingInfo.publisherCalculated.primaryInfo.personOrOrganization.name) }}</td>
                            <td
                              class=""
                              notranslate>{{ val(activity, activity => activity.pipelineEntry.entityModifiableInfo.contactInfo.contactInfo.email) || val(activity, activity => activity.pipelineEntry.publication.trackingInfo.publisherCalculated.primaryInfo.contactInfo.emailAddresses[0]) }}</td>
                            <td
                              class=""
                              notranslate>{{ val(activity, activity => activity.pipelineEntry.entityModifiableInfo.contactInfo.contactInfo.workPhone) || val(activity, activity => activity.pipelineEntry.publication.trackingInfo.publisherCalculated.primaryInfo.contactInfo.phoneNumbers[0]) }}</td>
                            <td
                              class=""
                              notranslate>{{ val(activity, activity => activity.pipelineEntry.entityModifiableInfo.contactInfo.organizationName) || val(activity, activity => activity.pipelineEntry.publication.trackingInfo.publisherCalculated.primaryInfo.organization.name) }}</td>
                            <td
                              v-tooltip.top="{ content: employeeName(activity.pipelineEntry.assignedEmployee), delay: { show: 700, hide: 100 }}"
                              notranslate
                              class="">{{ val(activity, activity => activity.pipelineEntry.assignedEmployee, activity => empInitials(activity), "") }}
                            </td>
                            <td
                              v-if="[0, 1, -1].includes(getDuration(activity.timeUtc))"
                              class="">{{ getDueDate(activity.timeUtc) }}
                            </td>
                            <td
                              v-else
                              notranslate
                              class="">{{ getDueDate(activity.timeUtc) }}
                            </td>
                            <td class="">{{ activity.durationMinutes ? formatDuration(activity.durationMinutes) : '' }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div
                      v-if="loading"
                      class="text-center">
                      <i class="fa fa-circle-o-notch fa-spin spn"/>
                    </div>
                    <paginate
                      ref="activitiesPagination"
                      :page-count="pages"
                      :page-range="3"
                      :margin-pages="2"
                      :click-handler="nextPage"
                      :prev-text="'Prev'"
                      :next-text="'Next'"
                      :container-class="'pagination to-the-right'"
                      :page-class="'page-item'"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <activity-details
      v-if="(activity && activity.id) || addActivity || editActivity || loadElement"
      :activity="activity"
      :addActivity="addActivity"
      :editActivity="editActivity"
      :loadElement="loadElement"
      @closeActivityDetail="closeActivityDetail()"/>
  </div>
</template>
