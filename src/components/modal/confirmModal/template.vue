<template>
  <div
    v-show="showModal"
    class="modal-open">
    <div
      id="modal-fadein"
      class="modal fade in display_block zi-90000">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="data-section no-border">
            <div class="section-label">
              <div class="label-copy">
                {{ title }}
              </div>
              <div class="section-controls">
                <button
                  class="btn btn-sm btn-default"
                  @click="onCancel()"><i class="fa fa-close"/></button>
              </div>
            </div>
            <div class="section-content">
              <p class="text font-s13 margin-b-10">{{ text }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button
              class="btn btn-sm btn-default"
              type="button"
              data-dismiss="modal"
              @click="onCancel()">Cancel</button>
            <button
              class="btn btn-sm btn-primary"
              type="button"
              data-dismiss="modal"
              @click="onSubmit()">Yes</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
