<template>
  <div :class="[ 'form-group', { 'has-error': fieldErrors.length } ]">
    <component
      :is="wrapperType"
      :label="label"
      :type="type"
      :formName="formName"
      :fieldName="fieldName"
      :step5="step5"
      :placeholder="placeholder"
      :minMaxFields="minMaxFields"
      :ppIndicator="ppIndicator"
      @enter="handleEnter">
      <template
        v-slot:input
        class="single-block input-group">
        <basic-input
          :value="value"
          :validate="validate"
          :approved.sync="approved"
          :type="type"
          :label="label"
          :formName="formName"
          :fieldName="fieldName"
          :placeholder="placeholder"
          :step5="step5"
          class="single-block input-group"
          @input="handleInput"
          @enter="handleEnter"
          @approve="handleApprove"/>
      </template>
      <template v-slot:errors>
        <div
          class="help-block"
          notranslate>
          <span
            v-for="(error, index) in fieldErrors"
            :key="`error-${index}`">
            {{ localize.translate(error.msg) }} <br>
          </span>
        </div>
      </template>
    </component>
  </div>
</template>
