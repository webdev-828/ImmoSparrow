<template>
  <div>
    <button
      v-tooltip.bottom="{ content: 'Send feedback', delay: { show: 700, hide: 100 }}"
      type="button"
      class="btn btn-default"
      @click="show_intercom"><i
        id="intercom"
        class="fa fa-wechat"/>
    </button>
  </div>
</template>
