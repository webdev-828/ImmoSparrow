<template>
  <div class="popup-item">
    <ul class="flex-tabs list-unstyled">
      <li
        :class="{ 'active' : tabsInfo['showBase']}"
        @click="show('showBase')">
        <span>Basic Info</span>
      </li>
      <li
        :class="{ 'active' : tabsInfo['showEntrances']}"
        @click="show('showEntrances')">
        <span>Entrances</span>
      </li>
    </ul>
    <div
      v-if="tabsInfo['showBase']"
      class="item-details">
      <div
        class="data-section stand-out"
        style="padding: 0 !important;">
        <div class="section-content">
          <div class="table-flex-col">
            <div class="table-col">
              <div class="flex-row">
                <div class="poperty-data">Apartments</div>
                <div
                  class="value-data"
                  notranslate>{{ building.primaryInfo.apartmentCount }}</div>
              </div>
              <div class="flex-row">
                <div class="poperty-data">Floors</div>
                <div
                  class="value-data"
                  notranslate>{{ building.primaryInfo.floorCount }}</div>
              </div>
              <div class="flex-row">
                <div class="poperty-data">Property Area</div>
                <div
                  class="value-data"
                  notranslate>{{ building.realProperty.primaryInfo.area }} m<sup>2</sup></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="tabsInfo['showEntrances']"
      class="item-details visible-scroll">
      <div
        class="data-section stand-out"
        style="padding: 0 !important;">
        <div class="section-content">
          <div class="table-flex-col">
            <div class="table-col">
              <div
                v-for="(entrance, index) in building.entrances"
                :key="entrance.id"
                style="cursor: pointer"
                class="flex-row"
                @click="setEntrence(entrance, index)">
                <div
                  v-if="entrance.address"
                  class="poperty-data"
                  notranslate> {{ entrance.address.street }} {{ entrance.address.streetNumber }}, {{ entrance.address.locality }}</div>
                <div class="value-data"><a
                  class=""
                  @click="setEntrence(entrance, index)"><i class="fa fa-chevron-circle-right"/></a></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="building.entrances[0].pictures"
      class="item-description">
      <div v-if="building.entrances[0].pictures.length">
        <div
          :style="'background-image: url(http://axresources.azurewebsites.net/image/get/' + building.entrances[0].pictures[0].id + '/?mw=500&mh=500&q=90);'"
          class="item-picture"
        />
        <div
          class="title"
          notranslate>{{ building.entrances[0].address.street }}, {{ building.entrances[0].address.zip }} {{ building.entrances[0].address.locality }}
        </div>
      </div>
      <div
        v-else
        :style="{ backgroundImage: 'url('+ppNoImage+'' }"
        class="placeholder"
      />
    </div>
    <div
      v-else
      :style="{ backgroundImage: 'url('+ppNoImage+'' }"
      class="placeholder"/>
  </div>
</template>
