<template>
  <div class="row">
    <form
      class="col-xs-4"
      @submit.prevent="updateNotification()"
      @keydown.enter.prevent="">
      <div class="form-group">
        <label>Search Subscription</label>
        <div class="form-inline">
          Notify me about new items
          <select
            v-model="selectedNotificationFrequency"
            class="form-control margin-l-5">
            <option
              v-for="notification in notifications"
              :key="notification.id"
              :value="notification.id">{{ notification.value }}</option>
          </select>
        </div>
      </div>
      <div class="controls-section">
        <button
          type="submit"
          class="btn btn-success">Update</button>
      </div>
    </form>
  </div>
</template>
