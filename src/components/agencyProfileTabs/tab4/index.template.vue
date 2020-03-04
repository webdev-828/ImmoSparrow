<template>
  <div
    id="pipe-template"
    class="tabs-content padding-20">
    <form
      data-vv-scope="step_form"
      @submit.prevent="updateDefintion"
      @keydown.enter.prevent="">
      <div
        class="data-section stand-out margin-b-30">
        <div class="section-label">
          <div class="label-copy">{{ pipelineDef.name }}</div>
          <div class="section-controls"/>
        </div>
        <div class="section-content">
          <div
            v-if="pipelineDef"
            class="flex-grid-container">
            <div class="flex-grid">
              <div
                v-for="(step, stepId) in pipelineDef.steps"
                :key="stepId"
                class="flex-col">
                <div class="col-with-header">
                  <div class="col-fixed">
                    <div class="pipe-col-header">
                      <template v-if="stepId !== 0">
                        <div class="header-flap-control left-flap">
                          <button
                            v-tooltip.top="{ content: 'Add Column', delay: { show: 700, hide: 100 }}"
                            type="button"
                            class="btn btn-sm btn-default"
                            @click="addStep(stepId)"><i class="fa fa-plus"/></button>
                        </div>
                        <div
                          v-if="stepId > 1"
                          class="header-control">
                          <button
                            v-tooltip.top="{ content: 'Move Left', delay: { show: 700, hide: 100 }}"
                            type="button"
                            class="btn btn-sm btn-default"
                            @click="moveStep(stepId, stepId - 1)"><i class="fa fa-angle-left"/></button>
                        </div>
                      </template>
                      <div
                        notranslate
                        class="header-title">{{ step.name }}</div>
                      <div
                        v-if="stepId !== 0 && stepId < pipelineDef.steps.length - 1"
                        class="header-control">
                        <button
                          v-tooltip.top="{ content: 'Move Right', delay: { show: 700, hide: 100 }}"
                          type="button"
                          class="btn btn-sm btn-default"
                          @click="moveStep(stepId, stepId + 1)"><i class="fa fa-angle-right"/></button>
                      </div>
                      <div class="header-flap-control right-flap">
                        <button
                          v-tooltip.top="{ content: 'Add Column', delay: { show: 700, hide: 100 }}"
                          type="button"
                          class="btn btn-sm btn-default"
                          @click="addStep(stepId + 1)"><i class="fa fa-plus"/></button>
                      </div>
                    </div>
                  </div>
                  <div class="col-stretch">
                    <div :class="{ 'has-error' : errors.has(`step_form.step ${stepId+1} title`) }">
                      <label>Title</label>
                      <input
                        v-validate="{ required: true, min: 2, max: 50 }"
                        v-model="step.name"
                        :name="`step ${stepId+1} title`"
                        data-vv-scope="step_form"
                        type="text"
                        class="form-control input-sm">
                      <div
                        v-show="errors.has(`step_form.step ${stepId+1} title`)"
                        class="help-block text-right animated fadeInDown">
                        {{ errors.first(`step_form.step ${stepId+1} title`) }}
                      </div>
                    </div>
                    <div class="separator"/>
                    <div
                      v-if="stepId !== 0"
                      class="">
                      <button
                        v-tooltip.top="{ content: 'Delete column', delay: { show: 700, hide: 100 }}"
                        type="button"
                        class="btn btn-xs btn-default"
                        @click="deleteStep(stepId)"><i class="fa fa-trash"/></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="data-section">
        <div class="section-content">
          <button
            :disabled="updating"
            type="submit"
            class="btn btn-block btn-sm btn-success">
            <i
              v-if="updating"
              class="fa fa-circle-o-notch fa-spin"/> Update</button>
        </div>
      </div>
    </form>
  </div>
</template>
