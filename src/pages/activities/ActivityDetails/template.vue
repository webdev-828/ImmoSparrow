<template>
  <aside
    id="sidebar-fixed"
    class="active sidebar-shadow w-650 just-header-vb">
    <confirm-modal
      :showModal="showModal"
      :title="'Delete Activity'"
      :text="'Are you sure you want to delete this activity?'"
      :onSubmit="deleteActivity"
      :onCancel="() => showModal = false"/>
    <div
      v-show="loadElement"
      class="preloader">
      <i class="fa fa-circle-o-notch fa-spin"/>
    </div>
    <div
      v-if="(activity && activity.id) || addActivity || editActivity"
      class="side-panel">
      <div class="detail-header fancy-shadow">
        <div class="title">
          <div class="centering-block">
            <div>
              <span class="font-s15 font-w600">{{ !addActivity? 'Activity Details' : 'New Activity' }}</span>
            </div>
          </div>
        </div>
        <div class="controls">
          <template v-if="activity">
            <button
              :disabled="downloading"
              class="btn btn-sm btn-default"
              @click="exportCalendar('ics')">
              <i
                v-if="downloading"
                class="fa fa-circle-o-notch fa-spin"/> Download as iCal
            </button>
            <template v-if="isOwner">
              <button
                v-if="!checkCompleted"
                class="btn btn-sm btn-success"
                @click.stop="changeStatus()">
                Mark as Done
              </button>
              <button
                v-else
                class="btn btn-sm btn-danger"
                @click.stop="changeStatus()">
                Mark as Undone
              </button>
              <button
                class="btn btn-sm btn-default margin-l-5"
                @click="showModal = true">
                <i class="fa fa-trash"/>
              </button>
            </template>
          </template>
          <button
            class="btn btn-sm btn-default margin-l-10"
            @click="$emit('closeActivityDetail')">
            <i class="fa fa-close"/>
          </button>
        </div>
      </div>
      <div
        v-bar
        class="detail-content">
        <div class="tab-content">
          <div
            class="tab-pane active padding-b-20">
            <div class="side-panel activity-add-module">
              <!-- Details -->
              <div class="data-section stand-out">
                <div class="section-content">
                  <activity
                    :activity="activity"
                    :addActivity="addActivity"
                    :fromPipeDetails="fromPipeDetails"
                    :editActivity="editActivity"
                    :isOwner="isOwner"
                    v-on="$listeners" />
                </div>
              </div>
              <!-- / Details -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
