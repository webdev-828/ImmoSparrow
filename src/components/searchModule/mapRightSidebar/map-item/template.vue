<template>
  <div
    :class="{'selected': selectedIndex === index}"
    class="object-item"
    @click="$emit('selectAd', ad)">
    <div class="item-description">
      <div
        v-if="ad.pictures && ad.pictures.length"
        :style="'background-image: url(https://axresources.azurewebsites.net/image/get/' + ad.pictures[0].id + '/?mw=500&mh=500&q=90'"
        class="item-picture"/>
      <div
        v-else
        :style="{ backgroundImage: 'url('+photo+'', height: '100%', 'background-size': '100%', 'background-repeat': 'no-repeat' }"
        class="item-picture"/>
      <div class="status">
        <span class="label label-xs label-default">
          <!--{{ ad["primaryInfo"]["propertyType"]["name"] }}-->
          {{ getMainCategory([ad.primaryInfo.basicInfo.propertyCategory]) }}
        </span>
        <span
          v-if="ad.trackingInfo.publicationInterval.isActive"
          class="label label-xs label-success margin-l-5">
          On Market
        </span>
        <span
          v-else
          class="label label-xs label-danger margin-l-5">
          Off Market
        </span>
      </div>
      <div
        class="address"
        notranslate>{{ shortenTitle(ad.primaryInfo.basicInfo.title) }}</div>
    </div>
    <div class="item-data">
      <div class="flex-row">
        <div class="poperty-data">Address</div>
        <div class="value-data">
          <span
            v-if="ad.address.quality > 7"
            notranslate>{{ val(ad, ad => ad.address.street, "") }} {{ val(ad, ad => ad.address.streetNumber, "") }}</span>
          <span
            v-if="ad.address.quality > 5 && ad.address.quality <= 7"
            notranslate>{{ val(ad, ad => ad.address.street, "") }}</span>
        </div>
      </div>
      <div class="flex-row">
        <div class="poperty-data">Zip Locality</div>
        <div
          notranslate
          class="value-data">{{ ad.address.zip }} {{ ad.address.locality }}</div>
      </div>
      <div class="flex-row">
        <div class="poperty-data">Price</div>
        <div
          v-if="val(ad, item => item.financialInfo.totalPriceCalculated)"
          notranslate
          class="value-data">
          <small>{{ val(ad, item => item.financialInfo.currency.value, "") }}</small>
          {{ val(ad, item => item.financialInfo.totalPriceCalculated, x => formatPrice(x), "") }}
        </div>
      </div>
      <!-- <div class="flex-row">
          <div class="poperty-data">Price m<sup>2</sup></div>
          <div class="value-data"><small>{{ val(ad, item =>  item.financialInfo.currency.value, "") }}</small>
            <span>{{ val(ad, item =>  item.financialInfo.pricePerSqrMeterCalculated, x => format_money(x), "") }}</span>
          </div>
        </div> -->
      <div
        v-if="ad.trackingInfo.publicationInterval.isActive"
        class="flex-row">
        <div class="poperty-data">On Market</div>
        <get-time-utc
          :publicationTimeUtc="val(ad, ad => ad.trackingInfo.publicationInterval.publicationTimeUtc, '')"
          class="value-data"/>
      </div>
    </div>
  </div>
</template>
