<template>
  <div class="fancy-message-wrap">
    <div class="fancy-message text-center animated bounceInDown">
      <div class="icon">
        <img src="../../../../static/img/icons/house.svg">
      </div>
      <template v-if="$store.getters['authStatesModule/employeeContext']">
        <div class="title">
          Change bundle to use {{ pageName }}
        </div>
        <div class="subtitle">
          <span>To access this feature you need bundle <var notranslate>{{ getBundles($store.getters['authStatesModule/employeeContext'].features[moduleName][feature].bundles) }}</var> Please contact us for more information.</span>
        </div>
      </template>
      <div
        v-else
        class="subtitle">
        Select an employee to use {{ pageName }}
      </div>
      <div class="buttons">
        <button
          class="btn btn-lg btn-primary"
          type="button"
          @click="$root.$emit('showIntercom')">Contact Us</button>
        <button
          class="btn btn-lg btn-default"
          type="button"
          @click="cancel">Cancel</button>
      </div>
    </div>
  </div>
</template>
