<template>
  <div v-click-outside="cancel">
    <div
      v-show="!editable"
      @click="editable = true">
      {{ text }}
    </div>
    <form
      v-show="editable"
      @submit.prevent="submit">
      <input
        v-model="newText"
        type="text">
      <button
        type="button"
        @click="cancel()">cancel</button>
      <button type="submit">send</button>
    </form>
  </div>
</template>
