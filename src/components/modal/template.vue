<template>
  <div
    v-show="showModal"
    class="modal-open">
    <div
      id="modal-fadein"
      class="modal fade in display_block zi-90000">
      <div
        class="background-modal"
        @click="closeModal"/>
      <div
        :class="{'modal-sm': !bigModal, 'modal-lg': bigModal}"
        class="modal-dialog">
        <div class="modal-content">
          <div class="data-section no-border">
            <div class="section-label">
              <div class="label-copy">
                <slot name="title"/>
              </div>
              <div class="section-controls">
                <slot name="close"/>
              </div>
            </div>
            <div class="section-content">
              <slot name="text"/>
            </div>
          </div>
          <div
            class="modal-footer">
            <slot name="slot_actions"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
