<template>
  <div style="padding: 5px; float: left; width: 100%;">
    <p
      v-if="tooltip!=''"
      style="font-size: 14px"
      notranslate>{{ tooltip }}</p>
    <p
      v-if="loader"
      style="font-size: 40px"
      notranslate><i class="fa fa-circle-o-notch fa-spin"/></p>
  </div>
</template>
