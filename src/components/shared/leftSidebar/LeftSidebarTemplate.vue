<template>
  <div>
    <aside
      id="side-overlay"
      :class="['one-level-cap', { 'active': isShown }]">
      <slot/>
      <div class="side-panel">
        <div class="flex-head fancy-shadow">
          <div class="data-section">
            <slot name="header"/>
          </div>
        </div>
        <div
          v-bar
          class="flex-scroll">
          <div class="tab-content">
            <div class="tab-pane active">
              <slot name="content"/>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
