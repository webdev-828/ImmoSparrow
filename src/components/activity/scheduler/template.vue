<template>
  <div class="v-cal">
    <modal
      v-show="showDialog"
      ref="modal"
      :modalShow="showDialog">
      <template slot="close">
        <button
          class="btn btn-sm btn-default"
          type="button"
          @click="cancelDialog();"><i class="fa fa-close"/></button>
      </template>
      <template slot="title">Activity</template>
      <template slot="text">
        <form
          id="scheduler_form"
          data-vv-scope="scheduler_form"
          @submit.prevent="createEvent">
          <div class="flex-row">
            <div
              :class="{'has-error': errors.has('scheduler_form.subject')}"
              class="form-group margin-b-10">
              <label for="subject">Subject</label>
              <input
                v-validate="'required'"
                v-model="activity.subject"
                data-vv-scope="scheduler_form"
                placeholder=""
                name="subject"
                class="form-control"
                type="text">
              <div
                v-show="errors.has('scheduler_form.subject')"
                class="help-block text-right animated fadeInDown">{{
                errors.first('scheduler_form.subject') }}
              </div>
            </div>
            <div class="form-group margin-b-10">
              <label for="startTime">Date</label>
              <div class="daterange-col">
                <datepicker
                  :input-class="'form-control input-sm'"
                  :typeable="false"
                  v-model="activity.date"
                  :disabledDates="disabledDatesStartDate"
                  :calendar-class="'leftside-datepicker'"
                  :placeholder="'Date'"
                  data-vv-scope="scheduler_form"
                  notranslate/>
              </div>
            </div>
            <div
              :class="{'has-error': showTimeError}"
              class="form-group margin-b-10">
              <label for="startTime">Start time</label>
              <input
                v-model="activity.startTime"
                placeholder=""
                data-vv-scope="scheduler_form"
                name="startTime"
                class="form-control"
                type="time">
              <div
                v-if="showTimeError"
                :class="{'has-error': showTimeError}"
                style="">
                <div class="help-block req_error">The start time field is required.</div>
              </div>
            </div>
            <!-- <div class="form-group margin-b-10">
              <label for="endTime">End time</label>
              <input
                v-model="activity.endTime"
                placeholder=""
                class="form-control"
                type="time">
            </div> -->
            <div class="form-group margin-b-10">
              <label for="startTime">Duration</label>
              <div class="simulate-form-control">
                <multiselect
                  id="duration"
                  v-model="activity.duration"
                  :options="durationOptions"
                  :show-labels="false"
                  notranslate
                  data-vv-scope="scheduler_form"
                  label="text"
                  track-by="value"
                  openDirection="bottom"
                  placeholder="Duration" />
              </div>
            </div>
            <div class="form-group margin-b-10">
              <label for="message">Message</label>
              <input
                v-model="activity.message"
                placeholder=""
                data-vv-scope="scheduler_form"
                name="message"
                class="form-control"
                type="text">
            </div>
          </div>
        </form>
      </template>
      <template slot="slot_actions">
        <button
          class="btn btn-sm btn-default"
          type="button"
          data-dismiss="modal"
          @click="cancelDialog()"> Cancel
        </button>
        <button
          :disabled="showTimeError"
          class="btn btn-sm btn-primary"
          type="submit"
          form="scheduler_form">Ok</button>
      </template>
    </modal>
    <header class="v-cal-header">
      <div class="v-cal-header__actions">
        <div class="actions-left btn-group">
          <button
            :disabled="!isPrevAllowed"
            type="button"
            class="btn btn-block btn-sm btn-default"
            @click="prev"
            v-html="'Back'" />
          <button
            :class="{ 'active': checkIfToday(activity.date)}"
            class="btn btn-block btn-sm btn-default"
            type="button"
            @click="goToToday">Today</button>
          <button
            :disabled="!isNextAllowed"
            type="button"
            class="btn btn-block btn-sm btn-default"
            @click="next"
            v-html="'Next'" />
        </div>
      </div>
      <div class="v-cal-header__title-bar">
        <h3
          v-if="activity.date"
          notranslate
          class="v-cal-header__title">{{ activity.date | moment('dddd MMM D') }}</h3>
      </div>
    </header>
    <section
      :class="'v-cal-content--day'"
      class="v-cal-content show-scrollbar">
      <!-- <div class="v-cal-weekdays">
        <div
          notranslate
          class="v-cal-weekday-item">{{ activity.date | moment("ddd DD/MM") }}</div>
      </div> -->
      <div class="v-cal-days">
        <div class="v-cal-times">
          <div class="v-cal-hour">Time</div>
          <div
            v-for="(time, timeKey) in times"
            :key="timeKey"
            :class="{ 'is-now': time.isSame(now, 'hour') }"
            notranslate
            class="v-cal-hour">{{ time | moment("HH:mm") }}</div>
        </div>
        <div class="v-cal-days__wrapper">
          <div
            v-if="day !== null"
            :class="{ 'is-today': day.isToday }"
            class="v-cal-day v-cal-day--day">
            <div
              class="v-cal-day__hour-block"
              @click="openDialog(null)">
              <span
                notranslate
                class="v-cal-day__hour-block-fill">00:00</span>
              <div class="v-cal-day__hour-content">
                <div
                  :class="{'tiny-events': day.events.filter(e => !e.startTime).length > 2}"
                  class="v-cal-event-list">
                  <event-item
                    v-for="(event,index) in day.events.filter(e => !e.startTime)"
                    :key="index"
                    :event="event" />
                </div>
              </div>
            </div>
            <div
              v-for="(time, tKey) in day.availableTimes"
              :key="tKey"
              :class="[ time.isSame(now, 'hour') ? 'is-now' : '', hourClass ]"
              class="v-cal-day__hour-block"
              @click="openDialog(time.hour())">
              <span
                notranslate
                class="v-cal-day__hour-block-fill">{{ time | moment("HH:mm") }}</span>
              <div
                :id="`slot-${time.hours()}`"
                class="v-cal-day__hour-content">
                <div class="v-cal-event-list">
                  <event-item
                    v-for="(event, index) in getDayEvents"
                    v-if="time.hours() === getStartTime(event.startTime)"
                    :key="index"
                    :event="event" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <footer class="v-cal-footer" />
  </div>
</template>
