<template>
  <div class="activity-add-module">
    <form
      id="activity_form"
      data-vv-scope="activity_form"
      @submit.prevent="addNewActivity('activity_form')">
      <div
        :class="{'has-error': errors.has('activity_form.subject')}"
        class="form-group">
        <label for="subject">Subject</label>
        <input
          v-validate="'required'"
          v-model="newActivity.subject"
          name="subject"
          data-vv-scope="activity_form"
          class="form-control"
          type="text"
          placeholder="Activity Subject">
        <div
          v-show="errors.has('activity_form.subject')"
          class="help-block text-right animated fadeInDown">{{
          errors.first('activity_form.subject') }}
        </div>
      </div>
      <div
        v-if="newActivity.pipeline && !fromPipeDetails"
        class="form-group">
        <label for="subject">Pipeline</label>
        <input
          v-model="newActivity.pipeline.name"
          notranslate
          readonly
          name="pipeItem"
          class="form-control"
          type="text"
          placeholder="Pipeline">
      </div>
      <div
        v-if="newActivity.pipelineEntry && !fromPipeDetails"
        class="form-group">
        <label for="subject">Pipeline entry</label>
        <input
          v-model="newActivity.pipelineEntry.name"
          notranslate
          readonly
          name="pipeEntry"
          class="form-control"
          type="text"
          placeholder="Pipeline entry">
      </div>
      <div
        v-if="addActivity && !fromPipeDetails"
        :class="{'has-error': pipeRequired}"
        class="form-group">
        <label for="subject">Pipeline</label>
        <div
          class="flex-input-group">
          <div class="input-element with-border">
            <multiselect
              v-model="selectedPipeline"
              :options="pipelines"
              :searchable="true"
              :show-labels="false"
              name="pipeline"
              label="name"
              data-vv-scope="activity_form"
              class="cursor-show"
              placeholder="Select a pipeline"
              @select="selectPipeline"/>
            <div
              v-show="pipeRequired"
              class="help-block text-right animated fadeInDown">
              The pipeline field is required.
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="addActivity && !fromPipeDetails && selectedPipeline"
        :class="{'has-error': entryRequired}"
        class="form-group">
        <label for="subject">Pipeline entry</label>
        <div
          class="flex-input-group">
          <div class="input-element with-border">
            <multiselect
              v-model="selectedEntry"
              :options="entries"
              :searchable="true"
              :show-labels="false"
              :custom-label="entryName"
              class="cursor-show"
              placeholder="Select a pipe entry"
              @select="entryRequired = false"/>
            <div
              v-show="entryRequired"
              class="help-block text-right animated fadeInDown">
              The pipeline entry field is required.
            </div>
          </div>
        </div>
      </div>
      <div class="activity-type form-group padding-t-10">
        <div
          class="btn-group group-flexed"
          role="group">
          <button
            :class="{ 'btn-default' : !activityType['Call'], 'btn-primary' : activityType['Call'] }"
            class="btn btn-sm"
            type="button"
            @click="operateActivityType('Call')"><i class="fa fa-phone"/> Call</button>
          <button
            :class="{ 'btn-default' : !activityType['Meeting'], 'btn-primary' : activityType['Meeting'] }"
            class="btn btn-sm"
            type="button"
            @click="operateActivityType('Meeting')"><i class="fa fa-users"/> Meeting</button>
          <button
            :class="{ 'btn-default' : !activityType['Task'], 'btn-primary' : activityType['Task'] }"
            class="btn btn-sm"
            type="button"
            @click="operateActivityType('Task')"><i class="fa fa-tasks"/> Task</button>
          <button
            :class="{ 'btn-default' : !activityType['Deadline'], 'btn-primary' : activityType['Deadline'] }"
            class="btn btn-sm"
            type="button"
            @click="operateActivityType('Deadline')"><i class="fa fa-clock-o"/> Deadline</button>
          <button
            :class="{ 'btn-default' : !activityType['Email'], 'btn-primary' : activityType['Email'] }"
            class="btn btn-sm"
            type="button"
            @click="operateActivityType('Email')"><i class="fa fa-envelope"/> Email</button>
          <button
            :class="{ 'btn-default' : !activityType['Lunch'], 'btn-primary' : activityType['Lunch'] }"
            class="btn btn-sm"
            type="button"
            @click="operateActivityType('Lunch')"><i class="fa fa-coffee"/> Lunch</button>
        </div>
      </div>
      <div class="activity-details-columns">
        <div class="calendar-container">
          <scheduler
            :item="activeViewProps"
            @changeDate="changeDate" />
        </div>
        <div class="input-container">
          <div class="form-group">
            <div class="input-daterange">
              <div class="daterange-col">
                <datepicker
                  :input-class="'form-control input-sm'"
                  :typeable="false"
                  v-model="activityDate"
                  :disabledDates="disabledDatesStartDate"
                  :calendar-class="'leftside-datepicker'"
                  :placeholder="'Date'"
                  notranslate/>
              </div>
              <div
                :class="{'has-error': errors.has('activity_form.start time')}"
                class="daterange-col">
                <input
                  v-validate="'required'"
                  v-model="startTime"
                  data-vv-scope="activity_form"
                  placeholder="Start time"
                  name="start time"
                  class="form-control input-sm"
                  type="time">
              </div>
              <!-- <div class="daterange-col">
                <input
                  v-model="endTime"
                  placeholder="End time"
                  name="endTime"
                  class="form-control input-sm"
                  type="time">
              </div> -->
              <!-- <div
                :class="{'has-error': errors.has('activity_form.time') && !activityTime}"
                class="daterange-col">
                <multiselect
                  v-validate="'required'"
                  id="time"
                  v-model="activityTime"
                  :options="timeOptions"
                  :maxHeight="160"
                  :show-labels="false"
                  openDirection="bottom"
                  notranslate
                  name="time"
                  data-vv-scope="activity_form"
                  placeholder="Time"/>
                <div
                  v-show="errors.has('activity_form.time') && !activityTime"
                  class="help-block text-right animated fadeInDown">{{
                  errors.first('activity_form.time') }}
                </div>
              </div>  -->
              <div class="daterange-col">
                <multiselect
                  id="duration"
                  v-model="durationMinutes"
                  :options="durationOptions"
                  :show-labels="false"
                  label="text"
                  track-by="value"
                  openDirection="bottom"
                  placeholder="Duration"
                ><template class="123"/>
                </multiselect>
              </div>
            </div>
            <div
              v-show="errors.has('activity_form.start time')"
              class="help-block req_error text-right animated fadeInDown"
              style="">{{ errors.first('activity_form.start time') }}
            </div>
          </div>
          <div class="form-group">
            <label
              class=""
              for="input-message">Message</label>
            <textarea
              id="input-message"
              v-model="newActivity.message"
              class="form-control"
              name="example-textarea-input"
              rows="4"
              placeholder="Activity Message" />
          </div>
        </div>
      </div>
      <div class="margin-b-10">
        <button
          v-if="addActivity"
          :disabled="editing"
          type="submit"
          class="btn btn-block btn-sm btn-success">
          <i
            v-if="editing"
            class="fa fa-circle-o-notch fa-spin"/> Add Activity</button>
        <button
          v-if="editActivity"
          :disabled="editing || !isOwner"
          type="submit"
          class="btn btn-block btn-sm btn-success">
          <i
            v-if="editing"
            class="fa fa-circle-o-notch fa-spin"/> Update Activity</button>
      </div>
    </form>
  </div>
</template>
