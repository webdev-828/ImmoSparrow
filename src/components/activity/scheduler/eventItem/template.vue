<template>
  <div
    v-tooltip.top="{ content: event.subject, delay: { show: 700, hide: 100 }}"
    ref="event_block"
    :class="eventClasses"
    :style="eventStyles"
    :title="event.subject"
    class="v-cal-event-item">
    <span
      :class="{
        'v-cal-event-name-small': event.duration && event.duration.value <= 30 && event.duration.value > 10,
        'v-cal-event-name-smaller': event.duration && event.duration.value <= 10,
      }"
      notranslate
      class="v-cal-event-name">
      <i
        :class="`fa ${activityType}`"
        class="white padding-r-10"/>{{ event.subject }}</span>
  </div>
</template>
