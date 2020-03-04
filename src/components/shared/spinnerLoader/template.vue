<template>
  <div
    v-if="isLoading"
    class="spinner-loader">
    <i class="fa fa-circle-o-notch fa-spin fa-2x" />
    <br>
    Please wait...
  </div>
</template>

<style scoped>
.spinner-loader {
  display: flex;
  position: absolute;
  background: rgba(236, 240, 244, 0.8);
  top: 0;
  left: 60px;
  right: 0;
  bottom: 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  z-index: 11000;
}

@media (max-width: 991px) {
  .spinner-loader {
    top: 60px;
    left: 0px;
  }
}
</style>
