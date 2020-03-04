<template>
  <div>
    <div
      class="mapboxgl-popup-wrap">
      <div
        class="pos-relative">
        <div>
          <button
            class="no-button"
          >
            <span>
              {{ fakeId }} - {{ poi.name }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
  .withZ5 {
    z-index: 5;
  }
</style>
