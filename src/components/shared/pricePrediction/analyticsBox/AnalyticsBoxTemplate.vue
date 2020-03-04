<template>
  <div
    v-if="prediction"
    class="fancy-price fit-into-col">
    <div
      :style="{ 'background-color': color }"
      class="price-container text-white">
      <div class="price-label">
        {{ isTransaction ? 'Transaction': 'Advertisement' }} Price
        <span class="label label-default">{{ transactionType === 10 ? 'Rent' : 'Buy' }}</span>
      </div>
      <div
        class="price-amount"
        notranslate>{{ prediction.value | money }}</div>
      <div
        class="price-smaller"
        notranslate>
        {{ prediction.value / livingArea | money }} / m<sup>2</sup>
      </div>
      <div class="additional-info">
        <div class="info-section margin-r-15 margin-b-5">
          <div class="range-label">Price Range</div>
          <div
            class="range-amount"
            notranslate>
            {{ prediction.min | money }} <i class="fa fa-arrows-h"/> {{ prediction.max | money }}
          </div>
        </div>
        <div class="info-section margin-r-15">
          <div class="range-label">
            <span notranslate>M<sup>2</sup></span> Range
          </div>
          <div
            class="range-amount"
            notranslate>
            {{ prediction.min / livingArea | money }} <i class="fa fa-arrows-h"/> {{ prediction.max / livingArea | money }}
          </div>
        </div>
        <div
          class="info-section graph"
          style="">
          <div class="price-label">Confidence</div>
          <star-rating
            v-if="prediction.confidence"
            :no="Math.floor(prediction.confidence * 100)"/>
        </div>
      </div>
    </div>
  </div>
</template>
