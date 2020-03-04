<template>
  <div
    v-if="buildingInfo"
    class="tab-pane active">
    <div class="right-side-panel padding-b-20">
      <div class="carousel-block">
        <vue-gallery
          :images="photos"
          :index="index"
          @close="closeFullScreen(index)"/>
        <carousel
          :navigateTo="0"
          :value="navigateTo"
          :paginationEnabled="true"
          :per-page="1"
          :mouse-drag="false"
          :spacePadding="0"
          :paginationColor="'#ccc'"
          :paginationActiveColor="'#5c90d2'"
          :navigationEnabled="true">
          <slide
            v-for="(p, imageIndex) in photos"
            :key="imageIndex">
            <div
              :style="{ 'background-image': 'url(' + p + ')', 'width': '100%', 'height': '100%', 'background-size': '100%', 'background-repeat': 'no-repeat' }"
              class="image"
              @click="clickOnImg(imageIndex)">
              <i
                class="fa fa-expand"
              />
            </div>
          </slide>
        </carousel>
      </div>

      <column-data
        :title="'Building'"
        :data-list="buildingData"
      />
      <column-data
        :title="'Property'"
        :data-list="propertyData"
      />
      <apartments
        :apartments="apartments"
      />
      <inhabitants
        :entrenceId="entranceId"
      />
      <owners
        :item="buildingInfo"
        :entrenceId="entranceId"
      />
    </div>
  </div>
  <div
    v-else
    class="data-section stand-out margin-t-10">
    <p class="text-danger text-center">Sorry, there is no building info for this address</p>
  </div>
</template>
