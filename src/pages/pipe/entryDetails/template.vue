<template>
  <div>
    <activity-details
      v-if="(selectedActivity && selectedActivity.id)"
      :activity="selectedActivity"
      :editActivity="true"
      :fromPipeDetails="true"
      :isOwner="isOwner"
      @closeActivityDetail="closeActivityDetail()"
      @updateActivity="updateActivity()"/>
    <note-details
      v-if="(selectedNote && selectedNote.id)"
      :note="selectedNote"
      :isOwner="isOwner"
      @closeNoteDetail="closeNoteDetail()"
      @updateNote="updateNote()"/>
    <div
      v-show="refresh"
      class="preloader">
      <i class="fa fa-circle-o-notch fa-spin"/>
    </div>
    <ul class="flex-tabs list-unstyled">
      <li
        :class="{active: tabsItem['overview']}"
        @click="showTabs('tabsItem', 'overview')">
        <span>Overview</span>
      </li>
      <li
        :class="{active: tabsItem['object']}"
        @click="showTabs('tabsItem', 'object')">
        <span>Object</span>
      </li>
      <li
        :class="{active: tabsItem['contact']}"
        @click="showTabs('tabsItem', 'contact')">
        <span>Contact</span>
      </li>
    </ul>
    <div
      v-bar
      v-if="item"
      class="detail-content">
      <div class="tab-content">
        <div
          v-show="tabsItem['overview']"
          class="tab-pane active padding-b-20">
          <div>
            <basic-info
              :item="item"
              @openDetailView="openDetailView"/>
            <div class="data-section stand-out">
              <div
                class="section-label mouse-pointer"
                @click="sectionLifetime=!sectionLifetime">
                <div class="label-copy">Lifetime</div>
                <div class="section-controls">
                  <button class="btn btn-sm btn-default has-tooltip">
                    <i
                      :class="{'fa-angle-up': sectionLifetime, 'fa-angle-down': !sectionLifetime}"
                      class="fa"/>
                  </button>
                </div>
              </div>
              <div
                v-if="sectionLifetime"
                class="section-content">
                <div class="table-flex-col">
                  <div class="table-col">
                    <div class="price-block-pipe">
                      <div class="price-amount">
                        <!-- <var lifetimeDays>{{ item._lifetimeInfo.lifetimeDayCount }}</var> days -->
                        <get-time-utc
                          :publicationTimeUtc="val(item, item => item.createdTime, '')"
                          class="value-data"/>
                      </div>
                      <div class="bars">
                        <div class="progress progress-mini">
                          <div
                            :style="{'width': getLifetimePercentageBar1}"
                            class="progress-bar progress-bar-primary"
                            role="progressbar"
                            aria-valuenow="30"
                            aria-valuemin="0"
                            aria-valuemax="100"/>
                        </div>
                        <div class="progress progress-mini">
                          <div
                            :style="{'width': getLifetimePercentageBar2}"
                            class="progress-bar progress-bar-success"
                            role="progressbar"
                            aria-valuenow="30"
                            aria-valuemin="0"
                            aria-valuemax="100"/>
                        </div>
                      </div>
                      <div
                        v-if="lifeTimeAvgWon && lifeTimeAvgWon.wonAvgLifetimeSeconds"
                        class="font-s13">
                        <strong><var wonAvgDays>{{ lifeTimeAvgWon.wonAverageLifetimeDays }}</var> days</strong> to avg. Won
                      </div>
                    </div>
                  </div>
                  <div class="table-col">
                    <div class="flex-row">
                      <div class="poperty-data">Inactive</div>
                      <div
                        class="value-data"
                        notranslate>{{ val(item, item => item._lifetimeInfo.inactiveDayCount, '') }}</div>
                    </div>
                    <div class="flex-row">
                      <div class="poperty-data">Created</div>
                      <div
                        notranslate
                        class="value-data">{{ formatDate(item.createdTime) }}</div>
                    </div>
                    <!-- <div class="flex-row">
                      <div class="poperty-data">Top activity</div>
                      <div class="value-data">Anruf (100%)</div>
                    </div>
                    <div class="flex-row">
                      <div class="poperty-data">Most active user</div>
                      <div class="value-data">Roberto Orazi (100%)</div>
                    </div> -->
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="!item.isDeleted && getEntryStatus(item.status) === 'InProgress'"
              id="addActivity"
              class="data-section stand-out">
              <div
                class="section-label mouse-pointer"
                @click="sectionAddToDeal=!sectionAddToDeal">
                <div class="label-copy">Add to item</div>
                <div class="section-controls">
                  <button class="btn btn-sm btn-default has-tooltip">
                    <i
                      :class="{'fa-angle-up': sectionAddToDeal, 'fa-angle-down': !sectionAddToDeal}"
                      class="fa"/>
                  </button>
                </div>
              </div>
              <div v-if="sectionAddToDeal">
                <div class="section-label  with-tabs">
                  <div class="tabs-section">
                    <span
                      :class="{ 'active' : tabsDetails['showNote']}"
                      class="tab"
                      @click="showTabs('tabsDetails', 'showNote')">
                      Note
                    </span>
                    <span
                      :class="{ 'active' : tabsDetails['showActivity']}"
                      class="tab"
                      @click="showTabs('tabsDetails', 'showActivity')">
                      Activity
                    </span>
                    <span
                      v-show="alphaFeature"
                      :class="{ 'active' : tabsDetails['showFile']}"
                      class="tab alpha-feature feature-on-text no-z"
                      @click="showTabs('tabsDetails', 'showFile')">
                      File
                    </span>
                  </div>
                </div>
              </div>
              <div
                v-if="tabsDetails['showNote'] && sectionAddToDeal"
                class="section-content">
                <form
                  data-vv-scope="note_form"
                  @submit.prevent="createNote('note_form')">
                  <div
                    :class="{'has-error': errors.has('note_form.note')}"
                    class="form-group">
                    <textarea
                      v-validate="'required'"
                      v-model="activityNote"
                      name="note"
                      class="form-control margin-b-5"
                      placeholder="Note text"
                      rows="1"/>
                    <div
                      v-show="errors.has('note_form.note')"
                      class="help-block text-right animated fadeInDown">{{
                      errors.first('note_form.note') }}
                    </div>
                    <div class="controls">
                      <button
                        type="button"
                        class="btn btn-sm btn-default"
                        @click="activityNote = ''">Cancel</button>
                      <button
                        type="submit"
                        class="btn btn-sm btn-primary">Add</button>
                    </div>
                  </div>
                </form>
              </div>
              <div
                v-if="tabsDetails['showActivity'] && sectionAddToDeal"
                class="section-content">
                <activity
                  :addActivity="true"
                  :fromPipeDetails="true"
                  @createActivity="createActivity"/>
              </div>
              <div
                v-if="tabsDetails['showFile']"
                class="section-content">
                <form>
                  <div class="form-group">
                    <h5>Attach a file to the deal</h5>
                  </div>
                  <div class="form-group">
                    <input
                      name="myFile"
                      type="file"
                      multiple>
                  </div>
                  <div class="form-group">
                    <button
                      class="btn btn-sm btn-primary"
                      type="button">Upload</button>
                  </div>
                </form>
              </div>
            </div>
            <div class="data-section stand-out no-z">
              <div
                class="section-label mouse-pointer"
                @click="sectionActivities=!sectionActivities">
                <div class="label-copy">Activities</div>
                <div class="section-controls">
                  <button class="btn btn-sm btn-default has-tooltip">
                    <i
                      :class="{'fa-angle-up': sectionActivities, 'fa-angle-down': !sectionActivities}"
                      class="fa"/>
                  </button>
                </div>
              </div>
              <div
                v-if="sectionActivities">
                <div class="section-label with-tabs">
                  <div class="tabs-section">
                    <span
                      :class="{'active': activityType['None']}"
                      class="tab"
                      @click="setActivityType('None')">All</span>
                    <span
                      :class="{'active': activityType['Call']}"
                      class="tab"
                      @click="setActivityType('Call')">Call</span>
                    <span
                      :class="{'active': activityType['Meeting']}"
                      class="tab"
                      @click="setActivityType('Meeting')">Meeting</span>
                    <span
                      :class="{'active': activityType['Tasks']}"
                      class="tab"
                      @click="setActivityType('Tasks')">Tasks</span>
                    <span
                      :class="{'active': activityType['Deadline']}"
                      class="tab"
                      @click="setActivityType('Deadline')">Deadline</span>
                    <span
                      :class="{'active': activityType['Email']}"
                      class="tab"
                      @click="setActivityType('Email')">Email</span>
                    <span
                      :class="{'active': activityType['Lunch']}"
                      class="tab"
                      @click="setActivityType('Lunch')">Lunch</span>
                    <span
                      v-show="alphaFeature"
                      :class="{'active': activityType['Changelog']}"
                      class="tab alpha-feature feature-on-text no-z"
                      @click="setActivityType('Changelog')">Changelog</span>
                  </div>
                </div>
              </div>
              <div
                v-if="sectionActivities"
                id="viewAll"
                class="section-content padding-t-0">
                <div
                  v-if="activityType['Changelog']"
                  class="some-class"
                  style="width: 250px;">
                  <div class="fluid-data-table flex-option">
                    <div class="fluid-cell-wrap">
                      <div class="fluid-cell no-accent">
                        <div class="attribute">Item created</div>
                        <div class="value">7 Jan 2019</div>
                      </div>
                    </div>
                    <div class="fluid-cell-wrap">
                      <div class="fluid-cell no-accent">
                        <div class="attribute">Item Won</div>
                        <div class="value">8 Jan 2019</div>
                      </div>
                    </div>
                    <div class="fluid-cell-wrap">
                      <div class="fluid-cell no-accent">
                        <div class="attribute">Item Lost</div>
                        <div class="value">9 Jan 2019</div>
                      </div>
                    </div>
                    <div class="fluid-cell-wrap">
                      <div class="fluid-cell no-accent">
                        <div class="attribute">Item Deleted</div>
                        <div class="value">9 Jan 2019</div>
                      </div>
                    </div>
                    <div class="fluid-cell-wrap">
                      <div class="fluid-cell no-accent">
                        <div class="attribute">Assigned to A</div>
                        <div class="value">10 Jan 2019</div>
                      </div>
                    </div>
                    <div class="fluid-cell-wrap">
                      <div class="fluid-cell no-accent">
                        <div class="attribute">Assigned from A to B</div>
                        <div class="value">10 Jan 2019</div>
                      </div>
                    </div>
                  </div>
                </div>
                <ul
                  v-if="!activityType['Changelog']"
                  class="timeline list-unstyled">
                  <div
                    v-for="(list, listKey) in filteredActivities"
                    :key="listKey">
                    <template v-if="list.items.length">
                      <li class="timeline-subhead padding-t-10">{{ list.name }}
                        <span
                          class="text-muted"
                          notranslate>{{ list.items.length }}</span>
                      </li>
                      <!-- Demo -->
                      <!-- <li class="timeline-segment cursor-show future-segment">
                        <div class="segment-type">
                          <i class="fa fa-phone"/>
                        </div>
                        <div class="segment-subject">
                          <div class="subject-message">
                            <label class="css-input css-checkbox css-checkbox-circled css-checkbox-sm css-checkbox-success">
                              <input type="checkbox"> <span class="has-tooltip"/> <span class="font-s14 font-w600">Name</span>
                            </label>
                            <button
                              type="button"
                              class="btn btn-xs btn-default"><i class="fa fa-pencil"/></button>
                          </div>
                          <div class="subject-info">
                            <span>September 16, 07:00</span>
                          </div>
                        </div>
                      </li> -->
                      <!-- / Demo -->
                      <li
                        v-for="item in list.items"
                        :key="item.id"
                        :class="{'note-segment': item.content, 'future-segment': list.name === 'Pending'}"
                        class="timeline-segment cursor-show"
                        @click="item.content ? loadNoteDetails(item) : loadActivityDetails(item)">
                        <div class="segment-subject">
                          <div
                            :class="{'space-between': item.content }"
                            class="subject-message"
                            notranslate>
                            <label
                              v-if="!item.content"
                              :class="{'css-input css-checkbox css-checkbox-circled css-checkbox-sm css-checkbox-success': !item.content }"
                              @click.stop>
                              <input
                                v-if="isOwner"
                                :disabled="changingStatus"
                                :checked="checkStatus(item.status)"
                                type="checkbox"
                                @input="changeStatus(item)">
                              <span v-tooltip.top="{ content: checkStatus(item.status) ? 'Mark as undone' : 'Mark as done', delay: { show: 700, hide: 100 }}"/>
                            </label>
                            <span
                              class="font-s14 font-w600"
                              notranslate>{{ item.subject || item.content }}</span>
                          </div>
                          <div
                            class="subject-info"
                            notranslate>
                            <span v-if="item.timeUtc">
                              {{ item.timeUtc | moment("MMMM DD") }}<var notranslate>, {{ item.timeUtc | moment("HH:mm") }}</var>
                            </span>
                            <span v-else>
                              {{ item.createdTime | moment("MMMM DD") }}<var notranslate>, {{ item.createdTime | moment("HH:mm") }}</var>
                            </span>
                          </div>
                        </div>
                        <div class="segment-type">
                          <i :class="getActivityType(item)"/>
                        </div>
                      </li>
                    </template>
                  </div>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <object-tab
          v-show="tabsItem['object']"
          :item="item"/>
        <contact-tab
          v-show="tabsItem['contact']"
          :item="item"/>
      </div>
    </div>
  </div>
</template>
