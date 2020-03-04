<template>
  <div class="data-section stand-out">
    <div class="section-label">
      <div class="label-copy">Apartments
        <span class="text-muted font-w400">
          {{ apartments.length }}
        </span>
      </div>
      <div
        v-if="apartments.length"
        class="section-controls">
        <span class="font-s12 margin-r-10"><strong>{{ slidePage + 1 }}</strong> of <strong>{{ apartments.length }}</strong></span>
        <button
          v-tooltip.top="{ content: 'Previous apartment', delay: { show: 700, hide: 100 }}"
          v-if="slidePage > 0"
          class="btn btn-sm btn-default"
          @click="prevSlide"><i class="fa fa-angle-left"/></button>
        <button
          v-tooltip.top="{ content: 'Next apartment', delay: { show: 700, hide: 100 }}"
          v-if="slidePage + 1 < apartments.length"
          class="btn btn-sm btn-default"
          @click="nextSlide">
          <i class="fa fa-angle-right"/>
        </button>
      </div>
    </div>

    <carousel
      ref="carouselApartments"
      :per-page="1"
      :mouse-drag="false"
      :spacePadding="0"
      :paginationEnabled="false"
      :navigationEnabled="false"
      class="section-content"
      @pageChange="pageChangedApartments">
      <slide
        v-for="apartment in apartments"
        :key="apartment.id">
        <div class="font-w600 font-s13 margin-b-5">
          <span>{{ getApartmentTitle(apartment) }}</span>
        </div>
        <div class="table-flex-col">
          <div class="table-col">
            <div class="flex-row">
              <div class="poperty-data">EWID</div>
              <div class="value-data">
                {{ ewid(apartment) }}
              </div>
            </div>
            <div class="flex-row">
              <div class="poperty-data">Rooms</div>
              <div class="value-data">
                {{ rooms(apartment) }}
              </div>
            </div>
            <div class="flex-row">
              <div class="poperty-data">Living Area</div>
              <div class="value-data">
                <span v-if="livingArea(apartment)">
                  {{ livingArea(apartment) }} m<sup>2</sup>
                </span>
              </div>
            </div>
            <div class="flex-row">
              <div class="poperty-data">Level</div>
              <div class="value-data">{{ level(apartment) }}</div>
            </div>
          </div>
          <div class="table-col">
            <div class="flex-row">
              <div class="poperty-data">Level number</div>
              <div class="value-data">{{ levelNumber(apartment) }}</div>
            </div>
            <div class="flex-row">
              <div class="poperty-data">Position</div>
              <div class="value-data">{{ position(apartment) }}</div>
            </div>
            <div class="flex-row">
              <div class="poperty-data">Admin number</div>
              <div class="value-data">{{ adminNumber(apartment) }}</div>
            </div>
          </div>
        </div>
      </slide>
    </carousel>
  </div>
</template>
