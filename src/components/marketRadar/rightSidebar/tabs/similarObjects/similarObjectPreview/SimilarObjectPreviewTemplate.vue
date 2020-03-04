<template>
  <div
    :class="{'selected': ad.selected }"
    class="object-item"
    @click="openAd(ad)">
    <div class="item-description">
      <div
        v-if="ad.pictures && ad.pictures.length"
        :style="'background-image: url(https://axresources.azurewebsites.net/image/get/' + ad.pictures[0].id + '/?mw=500&mh=500&q=90'"
        class="item-picture"/>
      <div
        v-else
        :style="{ backgroundImage: 'url('+ photo +'', height: '100%', 'background-size': '100%', 'background-repeat': 'no-repeat' }"
        class="item-picture"/>
      <div
        class="select-box"
        @click.stop>
        <label
          class="css-input css-checkbox css-checkbox-primary css-checkbox-rounded css-checkbox-sm">
          <input
            v-model="ad.selected"
            type="checkbox"
            class="font-s12"
          ><span/>
        </label>
      </div>
      <div class="status">
        <span class="label label-xs label-default">
          {{ getMainCategory([propertyCategory]) }}
        </span>
        <span
          v-if="isActive"
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
      >{{ shortenTitle(ad.primaryInfo.basicInfo.title) }}</div>
    </div>
    <div class="item-data">
      <div class="flex-row">
        <div class="poperty-data">Address</div>
        <div class="value-data">
          <span
            v-if="addressQuality > 7"
          >{{ street }} {{ streetNumber }}</span>
          <span
            v-if="addressQuality > 5 && addressQuality <= 7"
          >{{ street }}</span>
        </div>
      </div>
      <div class="flex-row">
        <div class="poperty-data">Zip Locality</div>
        <div class="value-data">{{ zip }} {{ locality }}</div>
      </div>
      <div class="flex-row">
        <div class="poperty-data">Price</div>
        <div
          v-if="totalPriceCalculated"
          class="value-data">
          <small>{{ currencyValue }}</small>
          {{ formatPrice(totalPriceCalculated) }}
        </div>
      </div>
      <div
        v-if="isActive && publicationTimeUTC"
        class="flex-row">
        <div class="poperty-data">On Market</div>
        <get-time-utc
          :publicationTimeUtc="publicationTimeUTC"
          class="value-data"/>
      </div>
    </div>
  </div>
</template>
