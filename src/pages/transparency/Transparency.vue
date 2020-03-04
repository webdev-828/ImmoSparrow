<template>
  <div>
    <div>
      <left-sidebar/>
      <transparency-map :address="address"/>
      <right-sidebar v-if="object.id != undefined"/>
      <div
        v-show="object.id != undefined"
        class="legend">
        <i class="fa fa-square color-grey"/> Property
        <i class="fa fa-square color-red"/> Building
      </div>
    </div>
  </div>
</template>
<script>
</script>
