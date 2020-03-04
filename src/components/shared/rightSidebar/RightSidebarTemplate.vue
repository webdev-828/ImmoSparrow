<template>
  <div v-if="isEnabled">
    <slot name="full-sidebar-display"/>
    <slot name="modal"/>
    <aside
      v-move
      :id="asideId"
      :class="['sidebar-shadow', ...additionalClasses, { 'active': isVisible }]">
      <button
        v-if="!disableToggling"
        class="btn btn-default side-overlay--button"
        type="button"
        @click="toggleSidebar()">
        <i class="arrow"/>
      </button>

      <div class="side-panel">
        <div class="detail-header">
          <div class="title">
            <div class="centering-block">
              <slot name="title"/>
            </div>
          </div>
          <div class="controls">
            <button
              v-tooltip.bottom="{ content: 'Close panel', delay: { show: 700, hide: 100 } }"
              class="btn btn-default"
              @click="closeSidebar()">
              <i class="fa fa-close"/>
            </button>
          </div>
        </div>
        <slot name="content"/>
      </div>
    </aside>
  </div>
</template>
