<template>
  <div class="fancy-popover">
    <div class="picture text-primary">
      <i class="si si-lock"/>
    </div>
    <div class="message-heading">
      <span>Change bundle to use this function</span>
    </div>
    <div class="message-subheading">
      <span>To access this feature you need bundle <var notranslate>{{ getBundles(empCtx.features[bundle][feature].bundles) }}</var> Please contact us for more information.</span>
    </div>
    <div class="controls">
      <button
        class="btn btn-sm btn-block btn-primary"
        type="button"
        @click="$root.$emit('showIntercom')">Contact</button>
    </div>
  </div>
</template>
