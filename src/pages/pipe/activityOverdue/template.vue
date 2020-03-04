<template>
  <div @click.stop>
    <div class="activity-date">
      <template>
        <div class="date-container">Pending</div>
        <div
          v-for="ac in activityOverdue"
          :key="ac.id"
          class="activity-container">
          <label class="css-input css-checkbox css-checkbox-sm css-checkbox-rounded css-checkbox-primary">
            <input
              v-if="isOwner"
              :checked="checkStatus(ac.status)"
              type="checkbox"
              @input="changeStatus(ac)">
            <span/>
            <span notranslate>
              <i :class="getActivityType(ac)"/>
              {{ ac.subject }}
              &nbsp;<span class="label label-default bg-gray-light text-primary-dark"> {{ ac.timeUtc | moment("HH:mm") }}</span>
            </span>
          </label>
        </div>
      </template>
    </div>
  </div>
</template>
