<template>
  <div class="input-block">
    <input
      v-number-input="type === 'number'"
      v-validate="validate"
      :key="fieldName"
      :value="value"
      :data-vv-scope="formName"
      :name="fieldName"
      :withStep5="step5"
      :class="{ 'v-input-number': type === 'number'}"
      :placeholder="placeholder"
      autocomplete="off"
      @input="handleInput($event.target.value)"
      @blur="validateField"
      @keydown.stop.prevent.enter="enterPressed">
    <span
      v-tooltip.top="{ content: 'Approve parameter', delay: { show: 700, hide: 100 }}"
      v-if="approved !== null"
      class="input-group-addon input-icon bg-white approve-switch is-transparent">
      <label class="css-input switch switch-square switch-sm switch-success">
        <input
          :checked="approved"
          :disabled="!!fieldErrors.length"
          type="checkbox"
          @input="handleApprove($event.target.checked)">
        <span class="icon-holder">
          <i class="fa fa-check-circle text-white first-icon" />
          <i class="fa fa-warning text-warning second-icon" />
        </span>
      </label>
    </span>
  </div>
</template>
