<template>
  <div class="form-group">
    <div class="slider-with-inputs">
      <div class="flex-label-group">
        <label v-html="label" />
      </div>
      <div class="input-group tamed-input-group">
        <span class="input-group-addon input-icon">
          <i class="fa fa-home"/>
        </span>
        <multiselect
          :value="value"
          :options="dataSet"
          :custom-label="customLabel"
          :name="fieldName"
          :data-vv-scope="formName"
          :group-select="false"
          :multiple="false"
          :limit="1"
          :searchable="true"
          :taggable="true"
          :show-labels="false"
          :clear-on-select="true"
          :close-on-select="true"
          :placeholder="label"
          :limit-text="limitText"
          track-by="id"
          openDirection="bottom"
          @input="handleInput" />
        <span
          v-tooltip.top="{ content: 'Approve parameter', delay: { show: 700, hide: 100 }}"
          class="input-group-addon input-icon bg-white approve-switch">
          <label class="css-input switch switch-square switch-sm switch-success">
            <input
              :checked="approved"
              type="checkbox"
              @input="handleApprove($event.target.checked)">
            <span class="icon-holder">
              <i class="fa fa-check-circle text-white first-icon"/>
              <i class="fa fa-warning text-warning second-icon"/>
            </span>
          </label>
        </span>
      </div>
    </div>
  </div>
</template>
