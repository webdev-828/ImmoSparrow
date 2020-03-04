<template>
  <div>
    <div class="upgrade-item">
      <div class="item-title">{{ name }}</div>
      <div class="upgrade-label bg-info"><i class="fa fa-info"/>&nbsp;Upgrade</div>
    </div>
    <div class="upgrade-module">
      <div class="popover">
        <div class="fancy-popover">
          <div class="picture text-info">
            <i class="si si-lock"/>
          </div>
          <div class="message-heading">
            <span>Change bundle to use {{ name }} function</span>
          </div>
          <div
            v-if="empCtx"
            class="message-subheading">
            <span>To access this feature you need bundle <var notranslate>{{ getBundles(empCtx.features.search[feature].bundles) }}</var> Please contact us for more information.</span>
          </div>
          <div class="controls">
            <button
              class="btn btn-sm btn-block btn-info"
              type="button"
              @click="$root.$emit('showIntercom')">Contact</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
