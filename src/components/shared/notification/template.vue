<template>
  <notifications
    :max="1"
    classes="notifClass"
    group="actions"
    position="top center">
    <template
      slot="body"
      slot-scope="props">
      <div :class="{ 'notif success': props.item.type === 'success', 'notif warn': props.item.type === 'warn', 'notif error': props.item.type === 'error' }">
        <a class="title">
          {{ props.item.title }}
        </a>
        <button
          type="button"
          class="close"
          aria-hidden="true"
          @click="props.close">×</button>
        <div v-html="props.item.text"/>
      </div>
    </template>
  </notifications>
</template>

<style scoped>
</style>
