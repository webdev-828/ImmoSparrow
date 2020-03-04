<template>
  <aside
    id="sidebar-fixed"
    class="active sidebar-shadow w-650 just-header-vb">
    <confirm-modal
      :showModal="showModal"
      :title="'Delete Note'"
      :text="'Are you sure you want to delete this note?'"
      :onSubmit="deleteNote"
      :onCancel="() => showModal = false"/>
    <div
      v-if="note && note.id"
      class="side-panel">
      <div class="detail-header fancy-shadow">
        <div class="title">
          <div class="centering-block">
            <div>
              <span class="font-s15 font-w600">Note Details</span>
            </div>
          </div>
        </div>
        <div class="controls">
          <button
            class="btn btn-sm btn-default margin-l-10"
            @click="$emit('closeNoteDetail')">
            <i class="fa fa-close"/>
          </button>
        </div>
      </div>
      <div
        v-bar
        class="detail-content">
        <div class="tab-content">
          <div
            class="tab-pane active padding-b-20">
            <div class="side-panel activity-add-module">
              <!-- Details -->
              <div class="data-section stand-out">
                <div class="section-content">
                  <div class="activity-add-module">
                    <form
                      id="note_form"
                      data-vv-scope="note_form"
                      @submit.prevent="updateNote('note_form')">
                      <div
                        :class="{'has-error': errors.has('note_form.content')}"
                        class="form-group">
                        <label for="content">Content</label>
                        <textarea
                          v-validate="'required'"
                          v-model="note.content"
                          notranslate
                          name="content"
                          data-vv-scope="note_form"
                          class="form-control font-s12"
                          placeholder="Note Content"
                          rows="14"/>
                        <div
                          v-show="errors.has('note_form.content')"
                          class="help-block text-right animated fadeInDown">{{
                          errors.first('note_form.content') }}
                        </div>
                      </div>
                      <div class="margin-b-10">
                        <button
                          :disabled="editing || !isOwner"
                          type="submit"
                          class="btn btn-block btn-sm btn-success">
                          <i
                            v-if="editing"
                            class="fa fa-circle-o-notch fa-spin"/> Update Note</button>
                        <button
                          v-tooltip.top="{ content: 'Delete Note', delay: { show: 700, hide: 100 }}"
                          v-if="isOwner"
                          type="button"
                          class="btn btn-block btn-sm btn-default"
                          @click="showModal = true"><i class="fa fa-trash"/></button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
