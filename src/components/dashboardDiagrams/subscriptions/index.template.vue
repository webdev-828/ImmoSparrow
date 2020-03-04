<template>
  <div>
    <div class="item-label">
      <div class="general-label">
        <div>Subscriptions</div>
        <div class="item-parameter">{{ totalCount }} <small style="font-size: 13px;">total</small></div>
      </div>
      <div class="btn-block-wrap">
        <router-link
          :to="`/inbox`"
          class="btn btn-sm btn-link">See All</router-link>
        <router-link
          :to="`/search`"
          class="btn btn-sm btn-link">Add Subscription</router-link>
      </div>
    </div>
    <div class="item-table">
      <table class="table table-condensed">
        <thead>
          <tr>
            <th class="width50percent">Subscription</th>
            <th>Total</th>
            <th>Unread</th>
            <th>New Today</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="leadGen in leadGens"
            :key="leadGen.id">
            <td><router-link :to="`/inbox/${leadGen.id}`">{{ leadGen.name }}</router-link></td>
            <td>{{ leadGen.stats.totalLeadCount }}</td>
            <td>{{ leadGen.stats.newLeadCount }}</td>
            <td>{{ leadGen.stats.createdTodayLeadCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
