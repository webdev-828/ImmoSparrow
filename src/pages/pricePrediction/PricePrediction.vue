<template>
  <div>
    <div>
      <left
        :entranceAndBuilding="entranceAndBuilding"
        :mapIsLoaded="mapIsLoaded"
        @buildingFromAd="buildingFromAd"
      />
      <amap
        :buildingModel="buildingModel"
        :addressFromAd="addressFromAd"
        @mapIsLoaded="mapIsLoaded = true"
        @hasEntranceAndBuilding="hasEntranceAndBuilding"
      />
      <right
        v-if="showBuilding || predicted"
        :buildingOnAddress="buildingModel"
        :showBuilding="showBuilding"
        :addressFromAd="addressFromAd"
        :predicted="predicted"/>
    </div>
  </div>
</template>
