<template>
  <div class="data-section stand-out">
    <div
      class="section-label mouse-pointer"
      @click="sectionRelated=!sectionRelated">
      <div class="label-copy">Related Object</div>
      <div class="section-controls">
        <button
          type="button"
          class="btn btn-sm btn-default"
          @click.stop="$emit('openDetailView')">
          Details
        </button>
        <button
          class="btn btn-sm btn-default margin-l-10">
          <i
            :class="{'fa-angle-up': sectionRelated, 'fa-angle-down': !sectionRelated}"
            class="fa"/>
        </button>
      </div>
    </div>
    <div
      v-if="sectionRelated"
      class="section-content">
      <div class="table-flex-col">
        <div class="table-col">
          <div class="object-image-wrap">
            <div
              :style="'background-image: url(static/img/house-placeholder.png'"
              class="placeholder"/>
            <div
              :style="val(item, item => item.publication.pictures.length, 0) ? `background-image: url(https://axresources.azurewebsites.net/image/get/${item.publication.pictures[0].id}/?mw=500&mh=500&q=90}` : ''"
              class="object-image"
              @click="$emit('openDetailView')"/>
            <span
              v-if="val(item, item => item.publication.trackingInfo.publicationInterval.isActive)"
              class="status-label label label-success">On Market</span>
            <span
              v-else
              class="status-label label label-danger">Off Market</span>
          </div>
        </div>
        <div class="table-col">
          <div class="object-detail-compact">
            <div class="detail-data">
              <div
                class="data-name"
                notranslate>{{ val(item, item => item.publication.primaryInfo.basicInfo.title, "") }}</div>
              <div class="data-parameters">
                <div class="fluid-data-table flex-option margin-b-0">
                  <div class="fluid-cell-wrap">
                    <div class="fluid-cell">
                      <div class="attribute">
                        Address
                      </div>
                      <div
                        class="value"
                        notranslate>
                        {{ displayAddress(val(item, item => item.publication.address)) }}
                      </div>
                    </div>
                  </div>
                  <div class="fluid-cell-wrap">
                    <div class="fluid-cell">
                      <div class="attribute">
                        Ad price
                      </div>
                      <div
                        class="value"
                        notranslate>
                        <small>{{ val(item, item => item.publication.financialInfo.currency.text, "CHF") }}</small> {{ val(item, item => item.publication.financialInfo.totalPriceCalculated, item => formatPrice(item), "") }}
                      </div>
                    </div>
                  </div>
                  <div class="fluid-cell-wrap">
                    <div class="fluid-cell">
                      <div class="attribute">
                        Room's
                      </div>
                      <div
                        class="value"
                        notranslate>
                        {{ val(item, item => item.publication.primaryInfo.layout.rooms.roomCount, "") }}
                      </div>
                    </div>
                  </div>
                  <div class="fluid-cell-wrap">
                    <div class="fluid-cell">
                      <div class="attribute">
                        Living Area
                      </div>
                      <div
                        class="value"
                        notranslate>
                        <span v-if=" val(item, item => item.publication.primaryInfo.layout.size.areaLiving)">
                          {{ val(item, item => item.publication.primaryInfo.layout.size.areaLiving, "") }} m<sup>2</sup>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
