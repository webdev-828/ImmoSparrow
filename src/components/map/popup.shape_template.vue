<template>
  <div
    class="block"
    style="padding: 20px; float: left; width: 100%;"><p style="font-size: 14px">Please enter shape name:</p> <input
      v-model="shapeModelName"
      notranslate
      class="form-control"
      @keyup.enter="updateShapeName"> <br>
    <div>
      <a
        v-if="shapeModelName != '' && shapeModelName != undefined"
        class="btn btn-primary pull-left"
        @click="updateShapeName"> Update</a>
      <a
        class="btn btn-default pull-right"
        @click="closePopup">Cancel</a>
    </div>
  </div>
</template>
