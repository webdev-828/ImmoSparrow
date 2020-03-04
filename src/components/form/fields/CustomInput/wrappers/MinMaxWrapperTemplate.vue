<template>
  <div class="slider-with-inputs">
    <div class="custom-label">
      <label v-html="label"/>
      <div
        v-if="ppIndicator"
        class="label-plate-wrap">
        <div class="label-plate bg-gray-light">
          <span class="label-plate--icon">
            <span class="icon-priceprediction"/>
          </span>
          <span class="label-plate--title">{{ ppIndicator }}</span>
        </div>
      </div>
    </div>
    <div class="inputs-holder">
      <div class="input-block">
        <basic-input
          :value="minMaxFields.values.min"
          :validate="validationObject[0]"
          :approved="null"
          :type="type"
          :fieldName="`${fieldName}-min`"
          :formName="formName"
          :step5="step5"
          class="w-100"
          @input="handleInput($event, 'min')"
          @enter="handleEnter(false)"/>
      </div>
      <div class="input-block">
        <basic-input
          :value="minMaxFields.values.max"
          :validate="validationObject[1]"
          :approved="null"
          :type="type"
          :fieldName="`${fieldName}-max`"
          :formName="formName"
          :step5="step5"
          class="w-100"
          @input="handleInput($event, 'max')"
          @enter="handleEnter(true)"/>
      </div>
    </div>
    <div class="params-holder">
      <div class="param-block">
        <span>min {{ minMaxText.min }}</span>
      </div>
      <div class="param-block">
        <span>max {{ minMaxText.max }}</span>
      </div>
    </div>
    <slot name="errors" />
  </div>
</template>
