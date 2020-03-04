<template>

  <div>
    <div class="marker_title">
      <div
        v-bar
        v-if="adsInfo.length"
        :class="{small: minifiedPopup}">
        <div
          v-if="!minifiedPopup"
          class="width100percent" >
          <div
            v-for="ad in adsInfo"
            :class="{active: ad.uniqueIdentifier == uniqueIdentifier}"
            :key="ad.uniqueIdentifier"
            class="r"
            @click="selectAddress(ad)" >
            <div
              class="photo"
              style="height: 50px; overflow: hidden">
              <img :src="'https://axresources.azurewebsites.net/image/get/'+ad.pictures.otherPictures[0].id+'/?mw=200&mh=200&q=90'">
            </div>
            <div class="text">
              <span
                class="title"
                notranslate>{{ ad.title }}</span>
              <span
                class="address"
                notranslate><i class="fa fa-address-book"/> <b>{{ ad.address.street }} {{ ad.address.streetNumber }}, {{ ad.address.locality }}</b></span>
              <span class="area"><i class="fa fa-area-chart"/> Living area: <b><span notranslate>{{ ad.livingArea }}</span> m<sup>2</sup></b></span>
            </div>
          </div>

        </div>
        <div
          v-else
          class="width100percent">
          <a
            class="pull-left"
            style="width: 260px"
            @click="minify">Show ads</a><span class="pull-right"><span notranslate>[{{ adsInfo.length }}]</span></span>
        </div>
      </div>
      <div v-else>
        <div @click="selectAddress('ass')">Title 1</div><br>
        <div @click="selectAddress('ass')">Title 2</div><br>
        <div @click="selectAddress('ass')">Title 3</div>
      </div>

    </div>

  </div>

</template>
