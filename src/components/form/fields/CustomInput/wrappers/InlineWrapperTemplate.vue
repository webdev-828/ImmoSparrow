<template>
  <div class="slider-with-inputs">
    <div class="flex-label-group">
      <label
        style="display: inline-block; font-weight: 700;"
        v-html="label"/>
    </div>
    <div class="inputs-holder">
      <slot name="input" />
    </div>
    <slot name="errors" />
  </div>
</template>
